const {randomInt,randomUUID}=require('node:crypto');
const bank=require('./adaptive-bank.js');
const shuffled=values=>{
  const out=[...values];
  for(let i=out.length-1;i>0;i--){const j=randomInt(i+1);[out[i],out[j]]=[out[j],out[i]];}
  return out;
};
function prepareQuestion(state) {
  if(state.answers.length>=50) return;
  const stage=bank.stages[state.answers.length];
  const q=stage.variants[state.level];
  const correctPosition=state.positions[state.answers.length];
  const distractors=shuffled(q.choices.map((_,i)=>i).filter(i=>i!==q.answer));
  const order=Array.from({length:4},(_,i)=>i===correctPosition?q.answer:distractors.shift());
  state.current={id:q.id,order};
}
function startExam(name,durationMinutes,now=Date.now()) {
  const state={id:randomUUID(),version:bank.version,name,startedAt:now,deadline:now+durationMinutes*60000,
    status:'active',reason:null,finishedAt:null,level:1,answers:[],positions:shuffled(Array.from({length:50},(_,i)=>i%4)),lastRequest:null};
  prepareQuestion(state);return state;
}
function expire(state,now=Date.now()) {
  if(state.status==='active' && now>=state.deadline){state.status='finished';state.reason='time';state.finishedAt=state.deadline;state.current=null;return true;}
  return false;
}
function submit(state,body,now=Date.now()) {
  expire(state,now);
  if(state.status!=='active') return {finished:true};
  if(body.requestId && body.requestId===state.lastRequest) return {duplicate:true};
  if(typeof body.requestId!=='string' || body.requestId.length>100 || !body.requestId) throw Object.assign(new Error('Invalid submission identifier.'),{status:400});
  if(body.questionId!==state.current.id) throw Object.assign(new Error('This question has already been locked. The current question has been restored.'),{status:409});
  if(!Number.isInteger(body.choice) || body.choice<0 || body.choice>3) throw Object.assign(new Error('Choose one answer.'),{status:400});
  const stage=bank.stages[state.answers.length];
  const q=stage.variants[state.level];
  const selected=state.current.order[body.choice];
  const correct=selected===q.answer;
  state.answers.push({id:q.id,level:state.level,choice:selected,order:[...state.current.order],correct,flagged:body.flagged===true,submittedAt:now});
  state.lastRequest=body.requestId;
  state.level=Math.max(0,Math.min(2,state.level+(correct?1:-1)));
  if(state.answers.length===25) state.level=1;
  if(state.answers.length===50){state.status='finished';state.reason='complete';state.finishedAt=now;state.current=null;}
  else prepareQuestion(state);
  return {accepted:true};
}
function publicState(state,now=Date.now()) {
  expire(state,now);
  const base={id:state.id,version:state.version,name:state.name,status:state.status,reason:state.reason,
    startedAt:state.startedAt,deadline:state.deadline,finishedAt:state.finishedAt,serverNow:now,
    answered:state.answers.length,mathAnswered:Math.min(25,state.answers.length),englishAnswered:Math.max(0,state.answers.length-25)};
  if(state.status==='finished') return {...base,report:report(state)};
  const stage=bank.stages[state.answers.length];
  const q=stage.variants[state.level];
  const section=bank.sections.find(s=>s.id===stage.section);
  return {...base,current:{id:q.id,number:state.answers.length+1,subject:stage.subject,prompt:q.prompt,
    choices:state.current.order.map(i=>q.choices[i]),diagram:q.diagram||null,
    passage:section.passageTitle?{title:section.passageTitle,paragraphs:section.paragraphs||null,lines:section.lines||null}:null}};
}
function report(state) {
  if(state.status!=='finished') throw new Error('Finish the exam before viewing answers.');
  const skills={};
  const rows=state.answers.map((answer,i)=>{
    const stage=bank.stages[i],q=stage.variants[answer.level];
    skills[stage.skill] ||= {correct:0,answered:0};skills[stage.skill].answered++;
    if(answer.correct) skills[stage.skill].correct++;
    return {number:i+1,id:q.id,subject:stage.subject,skill:stage.skill,difficulty:q.difficulty,prompt:q.prompt,
      selected:q.choices[answer.choice],selectedLetter:'ABCD'[answer.order.indexOf(answer.choice)],
      answer:q.choices[q.answer],answerLetter:'ABCD'[answer.order.indexOf(q.answer)],
      choices:answer.order.map(j=>q.choices[j]),explanation:q.explanation,correct:answer.correct,flagged:answer.flagged,
      diagram:q.diagram||null,passage:bank.sections.find(s=>s.id===stage.section).passageTitle||null};
  });
  const math=rows.filter(r=>r.subject==='Math'&&r.correct).length;
  const english=rows.filter(r=>r.subject==='English'&&r.correct).length;
  // Only the currently served item was seen when time expired; reveal no unused variants.
  const unfinished=rows.length<50?{number:rows.length+1,subject:bank.stages[rows.length].subject,prompt:bank.stages[rows.length].variants[state.level].prompt,answer:bank.stages[rows.length].variants[state.level].choices[bank.stages[rows.length].variants[state.level].answer],explanation:bank.stages[rows.length].variants[state.level].explanation}:null;
  return {math,english,total:math+english,unanswered:50-rows.length,rows,skills,unfinished};
}
module.exports={bank,startExam,submit,expire,publicState,report};
