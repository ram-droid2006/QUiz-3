(() => {
  'use strict';
  const $=id=>document.getElementById(id),icon=name=>window.EXAM_ICONS[name]||'';
  const quizNumber=Number(document.documentElement.dataset.homework||1);
  const quizPath='/homework-'+quizNumber+'/';
  const totalQuestions=quizNumber===3?34:33,mathQuestions=17,englishQuestions=totalQuestions-mathQuestions;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const format=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
  let state=null,choice=null,flagged=false,pending=null,busy=false,refreshing=false,anchor=0,wallAnchor=0,lastQuestion=null,warning='';
  let prefs={dark:false,font:18};
  try{const p=JSON.parse(localStorage.getItem('brcdc-appearance')||'{}');prefs={dark:p.dark===true,font:[18,21,24].includes(p.font)?p.font:18};}catch{}
  document.querySelectorAll('[data-icon]').forEach(el=>el.outerHTML=icon(el.dataset.icon));
  function appearance(){
    document.documentElement.dataset.theme=prefs.dark?'dark':'light';
    document.documentElement.style.setProperty('--reading-size',prefs.font+'px');$('text-size').value=String(prefs.font);
    $('theme-button').innerHTML=icon(prefs.dark?'Sun':'Moon');
    const label=prefs.dark?'Turn on light mode':'Turn on dark mode';
    $('theme-button').title=label;$('theme-button').setAttribute('aria-label',label);$('theme-button').setAttribute('aria-pressed',String(prefs.dark));
    try{localStorage.setItem('brcdc-appearance',JSON.stringify(prefs));}catch{}
  }
  function message(value){$('connection').textContent=value;$('connection').hidden=!value;}
  function draftKey(){return 'brcdc-homework-'+quizNumber+'-draft-'+state.id;}
  function saveDraft(){
    if(!state?.current)return;
    try{localStorage.setItem(draftKey(),JSON.stringify({id:state.current.id,choice,flagged,pending}));}catch{message('Unsubmitted selections cannot be saved in this browser. Submitted answers are saved on the server.');}
  }
  function loadDraft(){
    choice=null;flagged=false;pending=null;
    try{const d=JSON.parse(localStorage.getItem(draftKey())||'null');if(d?.id===state.current.id){choice=Number.isInteger(d.choice)&&d.choice>=0&&d.choice<4?d.choice:null;flagged=d.flagged===true;pending=d.pending||null;}}catch{}
  }
  async function api(route,data){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const res=await fetch(quizPath+'api/'+route,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,cache:'no-store',signal:controller.signal});
      const result=await res.json();
      if(!res.ok)throw Object.assign(new Error(result.error||'Request failed.'),{status:res.status});
      return result;
    }finally{clearTimeout(timeout);}
  }
  function remaining(){
    if(state?.status==='paused')return state.remainingMs;
    if(state?.status!=='active')return 0;
    return Math.max(0,state.remainingMs-Math.max(performance.now()-anchor,Date.now()-wallAnchor));
  }
  function controls(){
    const locked=state?.status!=='active'||remaining()<=0||busy;
    document.querySelectorAll('#choices input').forEach(el=>el.disabled=locked||Boolean(pending));
    $('flag-button').disabled=locked||Boolean(pending);$('pause-button').disabled=locked||Boolean(pending);
    $('next').disabled=locked||choice===null;
    $('next').innerHTML=busy?'Saving...':pending?'Retry saving answer':(state?.answered===totalQuestions-1?'Lock answer & finish':'Lock answer & continue')+icon(state?.answered===totalQuestions-1?'Check':'ArrowRight');
    $('resume-button').disabled=busy;
  }
  function tick(){
    if(state?.status!=='active')return;
    const ms=remaining();$('time').textContent=ms?format(ms):'Time ended';
    const level=ms<=0?'ended':ms<=60000?'1':ms<=300000?'5':ms<=600000?'10':'';
    if(level!==warning){
      warning=level;$('time-warning').hidden=!level;
      $('time-warning').textContent=level==='ended'?'Time is up. Answers are locked while your results load.':level+' minute'+(level==='1'?'':'s')+' or less remaining.';
      $('time-warning').dataset.urgent=String(level==='ended'||level==='1');
    }
    if(ms<=0){controls();refresh();}
  }
  function accept(next){
    if(state&&next.id===state.id&&(next.revision<state.revision||(next.revision===state.revision&&next.serverNow<state.serverNow)))return;
    const prior=state?.status;state=next;anchor=performance.now();wallAnchor=Date.now();message('');
    for(const [id,status] of [['start-screen','not-started'],['exam-screen','active'],['paused-screen','paused'],['results-screen','finished']])$(id).hidden=state.status!==status;
    if(state.status==='active'){
      if(lastQuestion!==state.current.id||prior!=='active'){lastQuestion=state.current.id;loadDraft();renderQuestion();}
      progress();controls();tick();
    }else if(state.status==='paused'){
      lastQuestion=null;
      $('question-title').textContent='';$('choices').replaceChildren();$('passage').replaceChildren();$('passage-title').textContent='';$('diagram').replaceChildren();
      $('pause-summary').textContent=state.answered+' of '+totalQuestions+' answers locked. '+format(state.remainingMs)+' remaining.';
      if(prior!=='paused')$('paused-title').focus();
      controls();
    }else if(state.status==='finished'){
      document.querySelectorAll('dialog[open]').forEach(d=>d.close());pending=null;
      renderResults();if(prior!=='finished'){$('results-title').focus();window.scrollTo(0,0);}
    }
  }
  async function refresh(){
    if(refreshing)return;refreshing=true;
    try{accept(await api('session'));}
    catch(error){message(error.status?error.message:'Connection interrupted. An active timer continues. Reconnect in this browser to recover your saved work.');}
    finally{refreshing=false;}
  }
  function progress(){
    $('answered').textContent=state.answered+' of '+totalQuestions+' locked';$('progress').value=state.answered;
    $('math-count').textContent=state.mathAnswered+' / '+mathQuestions;$('english-count').textContent=state.englishAnswered+' / '+englishQuestions;
    $('save-status').textContent=pending?'Waiting for save confirmation':choice===null?'Submitted answers saved':'Selection not yet submitted';
    $('math-grid').replaceChildren();$('english-grid').replaceChildren();
    for(let i=0;i<totalQuestions;i++){
      const el=document.createElement('span');el.className='progress-cell'+(i<state.answered?' answered':'');el.textContent=i+1;
      if(i===state.answered)el.setAttribute('aria-current','step');
      el.setAttribute('aria-label','Question '+(i+1)+', '+(i<state.answered?'locked':i===state.answered?'current':'not reached'));
      $(i<mathQuestions?'math-grid':'english-grid').append(el);
    }
  }
  function renderQuestion(){
    const q=state.current,oldPassage=$('passage-title').textContent,samePassage=oldPassage===q.passage?.title;
    $('subject').textContent=q.subject;$('question-number').textContent='Question '+q.number+' of '+totalQuestions;
    $('item-label').textContent=q.subject+' '+(q.subject==='Math'?state.mathAnswered+1:state.englishAnswered+1)+' of '+(q.subject==='Math'?mathQuestions:englishQuestions);
    $('question-title').textContent=q.prompt;$('passage-panel').hidden=!q.passage;$('return-to-passage').hidden=!q.passage;
    $('question-layout').classList.toggle('with-passage',Boolean(q.passage));$('passage-title').textContent=q.passage?.title||'';
    if(!samePassage){
      $('passage').replaceChildren();
      (q.passage?.paragraphs||[]).forEach(value=>{const p=document.createElement('p');p.textContent=value;$('passage').append(p);});
      $('passage-panel').scrollTop=0;
    }
    $('passage-credit').textContent=q.passage?.credit||'';$('diagram').innerHTML=window.examDiagram(q.diagram);
    $('choices').innerHTML='<legend class="sr-only">Choose one answer</legend>';
    q.choices.forEach((value,i)=>{
      const label=document.createElement('label');label.className='choice';
      const input=document.createElement('input');input.type='radio';input.name=q.id;input.value=i;input.checked=i===choice;
      const letter=document.createElement('span');letter.className='choice-letter';letter.textContent='ABCD'[i];letter.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.className='choice-text';text.textContent=value;
      input.addEventListener('change',()=>{if(busy||pending||remaining()<=0)return;choice=i;saveDraft();progress();controls();});
      label.append(input,letter,text);$('choices').append(label);
    });
    $('flag-button').setAttribute('aria-pressed',String(flagged));
    if(q.number>1){$('question-title').focus({preventScroll:true});$(samePassage?'question-title':'workspace').scrollIntoView({block:'start'});}
  }
  function renderResults(){
    const r=state.report;
    $('result-name').textContent=state.name+' | '+new Date(state.finishedAt).toLocaleString();
    $('completion-message').textContent=state.reason==='time'?'Time ended. '+r.answered+' answers submitted; '+r.unanswered+' unanswered.':'All '+totalQuestions+' answers are locked and saved.';
    $('math-score').textContent=r.math+' / '+mathQuestions;$('english-score').textContent=r.english+' / '+englishQuestions;$('total-score').textContent=r.total+' / '+totalQuestions;
    const metrics=[['Active work',format(r.activeMs)],['Paused time',format(r.pauseMs)],['Pauses',r.pauseCount],['Average / submitted',format(r.averageMs)],['Answered',r.answered+' / '+totalQuestions],['Unanswered',r.unanswered],['Marked for review',r.flagged],['Elapsed time',format(r.wallMs)]];
    $('metrics').innerHTML=metrics.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('');
    $('skill-summary').innerHTML=Object.entries(r.skills).sort((a,b)=>a[1].correct/a[1].total-b[1].correct/b[1].total).map(([skill,s])=>'<div class="skill-row"><span>'+esc(skill)+'</span><progress max="'+s.total+'" value="'+s.correct+'" aria-label="'+esc(skill)+'"></progress><strong>'+s.correct+' / '+s.total+'</strong></div>').join('');
    renderReport();
  }
  function renderReport(){
    const filter=$('result-filter').value;
    $('report-list').innerHTML=state.report.rows.map(row=>{
      const filtered=filter==='incorrect'&&row.correct||filter==='flagged'&&!row.flagged;
      const passage=row.passage?'<div class="report-passage"><h4>'+esc(row.passage.title)+'</h4>'+row.passage.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'<p class="muted">'+esc(row.passage.credit)+'</p></div>':'';
      return '<article class="answer-row'+(filtered?' filtered':'')+'"><div class="answer-meta"><span class="answer-status '+(row.correct?'correct':'incorrect')+'">'+row.status+'</span><span>Form B #'+row.source+' | '+row.difficulty+' | Active '+format(row.activeMs)+(row.flagged?' | Marked':'')+'</span></div><div class="'+(passage?'report-columns':'')+'">'+passage+'<div class="report-question"><h3>'+row.number+'. '+esc(row.prompt)+'</h3>'+window.examDiagram(row.diagram)+'<ol type="A" class="report-choices">'+row.choices.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ol><p><strong>Your answer:</strong> '+(row.answered?row.selectedLetter+'. '+esc(row.selected):'Unanswered')+'</p><p><strong>Correct answer:</strong> '+row.answerLetter+'. '+esc(row.answer)+'</p><p class="explanation">'+esc(row.explanation)+'</p></div></div></article>';
    }).join('');
  }
  $('start-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;busy=true;$('start-button').disabled=true;
    try{accept(await api('start',{name:$('student-name').value.trim()}));}catch(error){message(error.message);}
    finally{busy=false;$('start-button').disabled=false;controls();}
  });
  $('next').addEventListener('click',async()=>{
    if(busy||choice===null||remaining()<=0||state.status!=='active')return;
    pending||={questionId:state.current.id,choice,flagged,requestId:crypto.randomUUID()};saveDraft();busy=true;controls();
    try{const next=await api('answer',pending);pending=null;accept(next);}
    catch(error){if(error.status===409){pending=null;await refresh();}else message('Save not confirmed. Retry saving this answer. An active timer continues.');}
    finally{busy=false;controls();}
  });
  async function pause(paused){
    if(busy||pending)return;saveDraft();busy=true;controls();
    try{accept(await api(paused?'pause':'resume',{}));}
    catch{message('Pause or resume not confirmed. Reconnecting to check the timer.');await refresh();}
    finally{busy=false;controls();}
  }
  $('pause-button').addEventListener('click',()=>pause(true));$('resume-button').addEventListener('click',()=>pause(false));
  $('flag-button').addEventListener('click',()=>{if(busy||pending||remaining()<=0)return;flagged=!flagged;$('flag-button').setAttribute('aria-pressed',String(flagged));saveDraft();});
  $('theme-button').addEventListener('click',()=>{prefs.dark=!prefs.dark;appearance();});
  $('text-size').addEventListener('change',e=>{prefs.font=Number(e.target.value);appearance();});
  $('instructions-button').addEventListener('click',()=>$('instructions-dialog').showModal());
  $('close-instructions').addEventListener('click',()=>$('instructions-dialog').close());
  $('result-filter').addEventListener('change',renderReport);$('print-button').addEventListener('click',()=>window.print());
  $('download-button').addEventListener('click',async()=>{
    $('download-button').disabled=true;message('Preparing all '+totalQuestions+' questions and passages...');
    try{
      const bytes=await window.homeworkPDF(state.report),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
      const a=document.createElement('a');a.href=url;a.download='BRCDC-Homework-'+quizNumber+'-'+state.name.replace(/[^a-zA-Z0-9_-]/g,'-')+'-results.pdf';
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);message('');
    }catch{message('The PDF could not be created. Use Print and choose Save as PDF to keep all '+totalQuestions+' questions.');}
    finally{$('download-button').disabled=false;}
  });
  addEventListener('online',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();refresh();}});
  appearance();if(matchMedia('(max-width:700px)').matches)$('navigation').open=false;
  if(location.protocol==='file:'){
    $('duration-label').textContent='Live quiz';
    $('start-screen').hidden=false;
    const link=document.createElement('a');link.href='http://127.0.0.1:4318'+quizPath;
    link.className='primary server-link';link.textContent='Open Homework Quiz #'+quizNumber;
    $('start-form').replaceWith(link);
    message('Open the live quiz below to start or resume your saved homework.');
    return;
  }
  api('config').then(c=>{$('duration-label').textContent=c.minutes+' minutes';$('start-button').disabled=false;}).catch(()=>message('Cannot reach the homework server.'));
  refresh();setInterval(tick,250);setInterval(()=>{if(state?.status==='active'||state?.status==='paused')refresh();},10000);
})();
