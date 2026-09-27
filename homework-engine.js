const {randomInt,randomUUID}=require('node:crypto');
function createHomeworkEngine(bank){
const byId=new Map(bank.questions.map(q=>[q.id,q]));
function shuffle(items){
  const out=[...items];
  for(let i=out.length-1;i>0;i--){const j=randomInt(i+1);[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
function prepare(state,now){
  if(bank.mode==='fixed'){
    state.current={id:bank.questions[state.answers.length].id,startedAt:now};
    return;
  }
  const used=new Set(state.answers.map(a=>a.id));
  const group=bank.groups.find(g=>bank.questions.some(q=>q.group===g&&!used.has(q.id)));
  if(group!==state.group){state.level=1;state.group=group;}
  const pool=bank.questions.filter(q=>q.group===group&&!used.has(q.id));
  const distance=Math.min(...pool.map(q=>Math.abs(q.level-state.level)));
  const q=shuffle(pool.filter(q=>Math.abs(q.level-state.level)===distance))[0];
  state.current={id:q.id,startedAt:now};
}
function startExam(name,minutes,now=Date.now()){
  const positions=shuffle(Array.from({length:bank.questions.length},(_,i)=>i%4)),orders={};
  bank.questions.forEach((q,i)=>{
    const others=shuffle([0,1,2,3].filter(x=>x!==q.answer));
    orders[q.id]=Array.from({length:4},(_,j)=>j===positions[i]?q.answer:others.shift());
  });
  const state={id:randomUUID(),version:bank.version,name,status:'active',reason:null,startedAt:now,
    deadline:now+minutes*60000,durationMs:minutes*60000,finishedAt:null,pausedAt:null,pauseMs:0,pauseCount:0,
    revision:0,answers:[],orders,level:1,group:null,current:null,lastRequest:null};
  prepare(state,now);return state;
}
function expire(state,now=Date.now()){
  if(state.status!=='active'||now<state.deadline)return false;
  state.finishedAt=state.deadline;state.status='finished';state.reason='time';state.revision++;return true;
}
function setPaused(state,paused,now=Date.now()){
  expire(state,now);
  if(state.status==='finished')return;
  if(paused&&state.status==='active'){
    state.status='paused';state.pausedAt=now;state.pauseCount++;state.revision++;
  }else if(!paused&&state.status==='paused'){
    const elapsed=Math.max(0,now-state.pausedAt);
    state.pauseMs+=elapsed;state.deadline+=elapsed;state.current.startedAt+=elapsed;
    state.pausedAt=null;state.status='active';state.revision++;
  }
}
function submit(state,input,now=Date.now()){
  expire(state,now);
  if(state.status==='finished')return;
  if(state.status==='paused')throw Object.assign(new Error('Resume your homework before answering.'),{status:409});
  if(input.requestId&&input.requestId===state.lastRequest)return;
  if(typeof input.requestId!=='string'||!input.requestId||input.requestId.length>100)throw Object.assign(new Error('Invalid submission identifier.'),{status:400});
  if(input.questionId!==state.current.id)throw Object.assign(new Error('That question is locked. Your current question has been restored.'),{status:409});
  if(!Number.isInteger(input.choice)||input.choice<0||input.choice>3)throw Object.assign(new Error('Choose one answer.'),{status:400});
  const q=byId.get(state.current.id),order=state.orders[q.id],selected=order[input.choice],correct=selected===q.answer;
  state.answers.push({id:q.id,choice:selected,correct,flagged:input.flagged===true,submittedAt:now,activeMs:Math.max(0,now-state.current.startedAt)});
  state.lastRequest=input.requestId;state.revision++;
  state.level=Math.max(0,Math.min(2,q.level+(correct?1:-1)));
  if(state.answers.length===bank.questions.length){
    state.status='finished';state.reason='complete';state.finishedAt=now;state.current=null;
  }else prepare(state,now);
}
function report(state){
  if(state.status!=='finished')throw new Error('Finish the homework before viewing answers.');
  const answered=new Map(state.answers.map(a=>[a.id,a]));
  const ids=[...state.answers.map(a=>a.id),...(state.current?[state.current.id]:[])];
  ids.push(...bank.questions.filter(q=>!ids.includes(q.id)).map(q=>q.id));
  const skills={};
  const rows=ids.map((id,i)=>{
    const q=byId.get(id),a=answered.get(id),order=state.orders[id];
    skills[q.skill]||={correct:0,answered:0,total:0,activeMs:0};
    const activeMs=a?.activeMs||(id===state.current?.id?Math.max(0,state.finishedAt-state.current.startedAt):0);
    const skill=skills[q.skill];skill.total++;skill.answered+=a?1:0;skill.correct+=a?.correct?1:0;skill.activeMs+=activeMs;
    return {...q,number:i+1,choices:order.map(j=>q.choices[j]),answer:q.choices[q.answer],answerLetter:'ABCD'[order.indexOf(q.answer)],
      selected:a?q.choices[a.choice]:null,selectedLetter:a?'ABCD'[order.indexOf(a.choice)]:null,
      correct:a?.correct||false,flagged:a?.flagged||false,answered:Boolean(a),activeMs,
      status:a?(a.correct?'Correct':'Incorrect'):id===state.current?.id?'Not submitted':'Not reached'};
  });
  const math=rows.filter(r=>r.subject==='Math'&&r.correct).length,english=rows.filter(r=>r.subject==='English'&&r.correct).length;
  const activeMs=Math.max(0,state.finishedAt-state.startedAt-state.pauseMs);
  return {title:bank.title,name:state.name,id:state.id,version:state.version,startedAt:state.startedAt,finishedAt:state.finishedAt,reason:state.reason,
    math,english,total:math+english,answered:state.answers.length,unanswered:bank.questions.length-state.answers.length,counts:bank.counts,
    activeMs,pauseMs:state.pauseMs,pauseCount:state.pauseCount,wallMs:state.finishedAt-state.startedAt,
    averageMs:state.answers.length?state.answers.reduce((n,a)=>n+a.activeMs,0)/state.answers.length:0,
    flagged:rows.filter(r=>r.flagged).length,rows,skills};
}
function publicState(state,now=Date.now()){
  expire(state,now);
  const base={id:state.id,version:state.version,name:state.name,revision:state.revision,status:state.status,reason:state.reason,serverNow:now,
    deadline:state.deadline,remainingMs:state.status==='paused'?Math.max(0,state.deadline-state.pausedAt):Math.max(0,state.deadline-now),
    startedAt:state.startedAt,finishedAt:state.finishedAt,answered:state.answers.length,
    mathAnswered:state.answers.filter(a=>byId.get(a.id).subject==='Math').length,
    englishAnswered:state.answers.filter(a=>byId.get(a.id).subject==='English').length,pauseCount:state.pauseCount};
  if(state.status==='finished')return {...base,report:report(state)};
  if(state.status==='paused')return base;
  const q=byId.get(state.current.id);
  return {...base,current:{id:q.id,number:state.answers.length+1,subject:q.subject,prompt:q.prompt,
    choices:state.orders[q.id].map(i=>q.choices[i]),diagram:q.diagram,passage:q.passage}};
}
return {bank,startExam,submit,setPaused,expire,publicState,report};
}
module.exports={createHomeworkEngine};
