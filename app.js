(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const icon=name=>window.EXAM_ICONS[name]||'';
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state=null,choice=null,flagged=false,busy=false,pending=null,expired=false,refreshing=false;
  let anchor=performance.now(),wallAnchor=Date.now(),warningLevel='',lastQuestion=null;
  let prefs={dark:false,font:18};
  try{const saved=JSON.parse(localStorage.getItem('brcdc-appearance')||'{}');prefs={dark:saved.dark===true,font:[18,21,24].includes(saved.font)?saved.font:18};}catch{}
  document.querySelectorAll('[data-icon]').forEach(el=>el.outerHTML=icon(el.dataset.icon));
  function appearance(){
    document.documentElement.dataset.theme=prefs.dark?'dark':'light';
    document.documentElement.style.setProperty('--reading-size',prefs.font+'px');
    $('text-size').value=String(prefs.font);
    $('theme-button').innerHTML=icon(prefs.dark?'Sun':'Moon');
    const label=prefs.dark?'Turn on light mode':'Turn on dark mode';
    $('theme-button').title=label;$('theme-button').setAttribute('aria-label',label);$('theme-button').setAttribute('aria-pressed',String(prefs.dark));
    try{localStorage.setItem('brcdc-appearance',JSON.stringify(prefs));}catch{}
  }
  function message(text){$('connection').textContent=text;$('connection').hidden=!text;}
  function draftKey(){return state?'brcdc-draft-'+state.id:null;}
  function saveDraft(){try{localStorage.setItem(draftKey(),JSON.stringify({id:state.current.id,choice,flagged,pending}));}catch{message('This browser cannot save an unsubmitted selection. Locked answers are still saved with the exam.');}}
  function loadDraft(){
    choice=null;flagged=false;pending=null;
    try{const saved=JSON.parse(localStorage.getItem(draftKey())||'null');if(saved?.id===state.current.id){choice=Number.isInteger(saved.choice)&&saved.choice>=0&&saved.choice<4?saved.choice:null;flagged=saved.flagged===true;pending=saved.pending||null;}}catch{}
  }
  async function api(url,data){
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const res=await fetch(url,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,signal:controller.signal,cache:'no-store'});
      const result=await res.json();if(!res.ok)throw Object.assign(new Error(result.error||'Request failed.'),{status:res.status});return result;
    }finally{clearTimeout(timeout);}
  }
  function remaining(){
    if(!state||state.status!=='active')return 0;
    const elapsed=Math.max(performance.now()-anchor,Date.now()-wallAnchor);
    return Math.max(0,Math.ceil((state.deadline-state.serverNow-elapsed)/1000));
  }
  function lockControls(){
    const lock=expired||busy||Boolean(pending);
    document.querySelectorAll('#choices input').forEach(el=>el.disabled=lock);
    $('flag-button').disabled=lock;
    $('next').disabled=expired||busy||choice===null;
    $('next').innerHTML=busy?'Saving...':pending?'Retry saving answer':(state?.answered===49?'Lock answer & finish':'Lock answer & continue')+icon(state?.answered===49?'Check':'ArrowRight');
  }
  function tick(){
    if(!state||state.status!=='active')return;
    const seconds=remaining();$('time').textContent=seconds?`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'Time ended';
    const level=seconds<=0?'ended':seconds<=60?'1':seconds<=300?'5':seconds<=600?'10':'';
    if(level!==warningLevel){
      warningLevel=level;$('time-warning').hidden=!level;
      $('time-warning').textContent=level==='ended'?'Time is up. Your exam is locked while we retrieve your saved results.':level?`${level} minute${level==='1'?'':'s'} or less remaining. Lock each answer before time runs out.`:'';
      $('time-warning').dataset.urgent=String(level==='1'||level==='ended');
    }
    if(seconds===0&&!expired){expired=true;lockControls();refresh();}
  }
  function accept(next){
    if(state&&next.id===state.id&&(next.answered<state.answered||(state.status==='finished'&&next.status!=='finished')))return;
    const wasFinished=state?.status==='finished';
    state=next;anchor=performance.now();wallAnchor=Date.now();message('');
    $('start-screen').hidden=state.status!=='not-started';
    $('exam-screen').hidden=state.status!=='active';
    $('results-screen').hidden=state.status!=='finished';
    if(state.status==='active'){
      expired=false;
      if(lastQuestion!==state.current.id){lastQuestion=state.current.id;loadDraft();renderQuestion();}
      updateProgress();lockControls();tick();
    }else if(state.status==='finished'){
      document.querySelectorAll('dialog[open]').forEach(d=>d.close());
      pending=null;renderResults();
      if(!wasFinished){$('results-title').focus({preventScroll:true});window.scrollTo(0,0);}
    }
  }
  async function refresh(){
    if(refreshing)return;refreshing=true;
    try{accept(await api('/api/session'));}
    catch(error){message(error.status?error.message:'Connection interrupted. The exam clock continues. Reconnect to restore your saved progress.');}
    finally{refreshing=false;}
  }
  function updateProgress(){
    $('answered').textContent=`${state.answered} of 50 locked`;$('progress').value=state.answered;
    $('math-count').textContent=`${state.mathAnswered} / 25`;$('english-count').textContent=`${state.englishAnswered} / 25`;
    $('save-status').textContent=pending?'Waiting for save confirmation':choice===null?'All submitted answers saved':'Selection saved; not submitted';
    ['math-grid','english-grid'].forEach(id=>$(id).replaceChildren());
    for(let i=0;i<50;i++){
      const item=document.createElement('span');item.textContent=String(i+1);item.className='progress-cell';
      if(i<state.answered)item.classList.add('answered');
      if(i===state.answered)item.setAttribute('aria-current','step');
      item.setAttribute('aria-label',`Question ${i+1}, ${i<state.answered?'locked':i===state.answered?'current':'not reached'}`);
      $(i<25?'math-grid':'english-grid').append(item);
    }
  }
  function renderQuestion(){
    const q=state.current,previousPassage=$('passage-title').textContent;
    $('subject').textContent=q.subject;$('question-number').textContent=`Question ${q.number} of 50`;$('item-label').textContent=`${q.subject} ${q.number>25?q.number-25:q.number} of 25`;
    $('question-title').textContent=q.prompt;
    $('passage-panel').hidden=!q.passage;$('return-to-passage').hidden=!q.passage;$('question-layout').classList.toggle('with-passage',Boolean(q.passage));
    $('passage-title').textContent=q.passage?.title||'';
    if(previousPassage!==$('passage-title').textContent){
      $('passage').replaceChildren();
      (q.passage?.paragraphs||q.passage?.lines||[]).forEach(line=>{const p=document.createElement('p');p.textContent=line;if(q.passage.lines)p.className='poem-line';$('passage').append(p);});
      $('passage-panel').scrollTop=0;
    }
    $('diagram').innerHTML=window.examDiagram(q.diagram);
    $('choices').querySelectorAll('label').forEach(el=>el.remove());
    q.choices.forEach((value,index)=>{
      const label=document.createElement('label');label.className='choice';
      const radio=document.createElement('input');radio.type='radio';radio.name=q.id;radio.value=String(index);radio.checked=choice===index;
      const letter=document.createElement('span');letter.className='choice-letter';letter.textContent='ABCD'[index];letter.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.className='choice-text';text.textContent=value;
      radio.addEventListener('change',()=>{tick();if(expired||pending||busy)return;choice=index;saveDraft();updateProgress();lockControls();});
      label.append(radio,letter,text);$('choices').append(label);
    });
    $('flag-button').setAttribute('aria-pressed',String(flagged));
    if(q.number>1){
      $('question-title').focus({preventScroll:true});
      const samePassage=q.passage?.title===previousPassage;
      $(samePassage&&matchMedia('(max-width:1100px)').matches?'question-title':'workspace').scrollIntoView({block:'start'});
    }
  }
  function renderResults(){
    const report=state.report;
    $('result-name').textContent=state.name+' | '+new Date(state.finishedAt).toLocaleString();
    $('completion-message').textContent=state.reason==='time'?`Time ended. ${state.answered} answers were submitted; ${report.unanswered} questions were unanswered.`:'All 50 answers are locked and saved.';
    $('math-score').textContent=`${report.math} / 25`;$('english-score').textContent=`${report.english} / 25`;$('total-score').textContent=`${report.total} / 50`;
    const skills=Object.entries(report.skills).sort((a,b)=>a[1].correct/a[1].answered-b[1].correct/b[1].answered);
    $('skill-summary').innerHTML=skills.map(([skill,s])=>`<div class="skill-row"><span>${esc(skill)}</span><progress max="${s.answered}" value="${s.correct}" aria-label="${esc(skill)}"></progress><strong>${s.correct} / ${s.answered}</strong></div>`).join('')||'<p>No answers were submitted.</p>';
    renderReport();
    if(report.unfinished){const q=report.unfinished;$('unfinished-report').innerHTML=`<article class="answer-row"><span class="answer-status">Not submitted before time ended</span><h3>${q.number}. ${esc(q.prompt)}</h3><p><strong>Correct answer:</strong> ${esc(q.answer)}</p><p>${esc(q.explanation)}</p></article><p>${report.unanswered-1} additional questions were not reached.</p>`;}
    else $('unfinished-report').replaceChildren();
  }
  function renderReport(filter=$('result-filter').value){
    const rows=state.report.rows;
    $('report-list').innerHTML=rows.map(row=>{
      const excluded=filter==='incorrect'&&row.correct||filter==='flagged'&&!row.flagged;
      return `<article class="answer-row${excluded?' filtered':''}"><div class="answer-meta"><span class="answer-status ${row.correct?'correct':'incorrect'}">${row.correct?'Correct':'Incorrect'}</span><span>${esc(row.subject)} | ${esc(row.difficulty)}${row.flagged?' | Marked for review':''}</span></div><h3>${row.number}. ${esc(row.prompt)}</h3>${window.examDiagram(row.diagram)}<p><strong>Your answer:</strong> ${row.selectedLetter}. ${esc(row.selected)}</p><p><strong>Correct answer:</strong> ${row.answerLetter}. ${esc(row.answer)}</p><p class="explanation">${esc(row.explanation)}</p></article>`;
    }).join('');
    const count=rows.filter(r=>filter==='all'||filter==='incorrect'&&!r.correct||filter==='flagged'&&r.flagged).length;
    if(!count)$('report-list').insertAdjacentHTML('beforeend','<p class="empty-filter">No answers in this group.</p>');
  }
  $('start-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;busy=true;$('start-button').disabled=true;
    try{accept(await api('/api/start',{name:$('student-name').value.trim()}));}catch(error){message(error.message||'Could not start. Please try again.');}
    finally{busy=false;$('start-button').disabled=false;if(state?.status==='active')lockControls();}
  });
  $('next').addEventListener('click',async()=>{
    tick();if(busy||expired||choice===null||state?.status!=='active')return;
    pending ||= {questionId:state.current.id,choice,flagged,requestId:crypto.randomUUID()};saveDraft();
    busy=true;lockControls();$('save-status').textContent='Saving your answer...';
    try{const next=await api('/api/answer',pending);pending=null;accept(next);}
    catch(error){
      if(error.status===409){pending=null;await refresh();}
      else {message('Your submission is not yet confirmed. Retry saving or reconnect. The clock continues.');}
    }finally{busy=false;if(state?.status==='active'){lockControls();updateProgress();}}
  });
  $('flag-button').addEventListener('click',()=>{tick();if(expired||busy||pending)return;flagged=!flagged;$('flag-button').setAttribute('aria-pressed',String(flagged));saveDraft();});
  $('theme-button').addEventListener('click',()=>{prefs.dark=!prefs.dark;appearance();});
  $('text-size').addEventListener('change',event=>{prefs.font=Number(event.target.value);appearance();});
  $('instructions-button').addEventListener('click',()=>$('instructions-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
  $('result-filter').addEventListener('change',()=>renderReport());
  $('print-button').addEventListener('click',()=>window.print());
  addEventListener('online',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();refresh();}});
  addEventListener('pageshow',()=>{if(location.protocol!=='file:')refresh();});
  appearance();
  if(matchMedia('(max-width:700px)').matches)$('navigation').open=false;
  if(location.protocol==='file:'){
    $('duration-label').textContent='Server required';
    message('This adaptive exam now uses a saved, timed session. Open the running exam to continue.');
    const link=document.createElement('a');link.href='http://127.0.0.1:4318';link.textContent='Open adaptive exam';link.className='primary server-link';$('start-form').replaceWith(link);return;
  }
  api('/api/config').then(config=>{$('duration-label').textContent=`${config.minutes} minutes`;$('start-button').disabled=false;}).catch(()=>message('Cannot reach the exam server. Please reconnect.'));
  refresh();setInterval(tick,250);setInterval(()=>{if(state?.status==='active')refresh();},10000);
})();
