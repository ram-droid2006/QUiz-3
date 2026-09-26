/* Self-contained PDF export; no browser association for HTML files is needed. */
window.homeworkPDF=async function(report){
  const quizNumber=Number(document.documentElement.dataset.homework||1);
  const mathQuestions=report.counts.Math,englishQuestions=report.counts.English,totalQuestions=report.rows.length;
  const {PDFDocument,StandardFonts,rgb}=window.PDFLib;
  const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink=rgb(.12,.16,.14),muted=rgb(.32,.37,.34),green=rgb(.08,.34,.24);
  const safe=value=>Array.from(String(value??'').normalize('NFKD')).filter(c=>!/[\u0300-\u036f]/.test(c)).map(c=>{try{font.encodeText(c);return c;}catch{return c==='\u2212'?'-':'?';}}).join('');
  const duration=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+'m '+s%60+'s';};
  const write=(page,text,x,y,size=10,strong=false,color=ink)=>page.drawText(safe(text),{x,y,size,font:strong?bold:font,color});
  function lines(value,width,size=9,strong=false){
    const f=strong?bold:font,out=[];let line='';
    for(const word of safe(value).split(/\s+/)){
      const candidate=line?line+' '+word:word;
      if(f.widthOfTextAtSize(candidate,size)<=width){line=candidate;continue;}
      if(line)out.push({text:line,size,strong});
      line='';
      for(const char of word){
        if(f.widthOfTextAtSize(line+char,size)>width){out.push({text:line,size,strong});line='';}
        line+=char;
      }
    }
    if(line)out.push({text:line,size,strong});
    return out;
  }
  const block=(text,width,size=9,strong=false)=>[...lines(text,width,size,strong),{text:'',size:4}];
  function drawRows(page,rows,x,y){
    for(const row of rows){write(page,row.text,x,y,row.size,row.strong);y-=row.size+4;}
  }
  function splitRows(rows,available){
    const chunks=[];let used=0,part=[];
    for(const row of rows){
      if(used+row.size+4>available&&part.length){chunks.push(part);part=[];used=0;}
      part.push(row);used+=row.size+4;
    }
    if(part.length)chunks.push(part);return chunks;
  }
  function pageHeader(title,subtitle){
    const page=pdf.addPage([612,792]);write(page,'BRCDC | Homework Quiz #'+quizNumber,36,754,12,true,green);
    write(page,title,36,729,14,true);
    drawRows(page,lines(subtitle,540,9),36,708);return page;
  }
  let overview=pageHeader('Finished work',report.name+' | '+new Date(report.finishedAt).toLocaleString());
  const overviewRows=[
    ...block('Math: '+report.math+'/'+mathQuestions+'     English: '+report.english+'/'+englishQuestions+'     Total: '+report.total+'/'+totalQuestions,540,13,true),
    ...block((report.reason==='time'?'Time ended. ':'Completed. ')+report.answered+' submitted; '+report.unanswered+' unanswered.',540,10),
    ...block('Active work: '+duration(report.activeMs)+' | Paused: '+duration(report.pauseMs)+' | Pauses: '+report.pauseCount,540,10),
    ...block('Elapsed: '+duration(report.wallMs)+' | Average per submitted question: '+duration(report.averageMs)+' | Marked: '+report.flagged,540,10),
    ...block('All '+totalQuestions+' assigned questions follow, including unanswered and not-reached questions. Choices retain the order shown in this attempt.',540,10),
    ...block('Each English passage appears beside its questions and again in full in the Reading passages section at the end.',540,10),
    ...block('Practice scores and difficulty labels are not official SHSAT scores or calibrated estimates. Active time includes reading time and excludes confirmed pauses.',540,9),
    ...block('Skill breakdown (correct / assigned; submitted; active time)',540,11,true)
  ];
  for(const [skill,s] of Object.entries(report.skills))overviewRows.push(...block(skill+': '+s.correct+'/'+s.total+'; '+s.answered+' submitted; '+duration(s.activeMs),540,9));
  overviewRows.push(...block('Attempt: '+report.id+' | Bank: '+report.version,540,8));
  const overviewChunks=splitRows(overviewRows,610);
  overviewChunks.forEach((chunk,i)=>{if(i)overview=pageHeader('Finished work (continued)',report.name);drawRows(overview,chunk,36,678);});
  async function diagramImage(diagram){
    const holder=document.createElement('div');holder.innerHTML=window.examDiagram(diagram);
    const svg=holder.querySelector('svg');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','1000');svg.setAttribute('height','560');
    const style=document.createElementNS('http://www.w3.org/2000/svg','style');
    style.textContent='text{fill:#111;font:16px Arial,sans-serif}.shape,.face{stroke:#111;stroke-width:2;fill:#eef5f0}.measure{fill:none;stroke:#111;stroke-width:1.5}.dashed{fill:none;stroke:#84304d;stroke-width:2;stroke-dasharray:6 4}.point{fill:#84304d}';
    svg.prepend(style);
    const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));
    try{
      const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
      const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=560;
      const context=canvas.getContext('2d');context.fillStyle='white';context.fillRect(0,0,1000,560);context.drawImage(img,0,0);
      return await pdf.embedPng(canvas.toDataURL('image/png'));
    }finally{URL.revokeObjectURL(url);}
  }
  for(const row of report.rows){
    const width=row.passage?258:540;
    const questionRows=[...block(row.prompt,width,11,true)];
    if(row.diagram)questionRows.push(...block('Diagram shown below. '+row.diagram.caption,width,9));
    row.choices.forEach((c,i)=>questionRows.push(...block('ABCD'[i]+'. '+c,width,10)));
    questionRows.push(...block('Your answer: '+(row.answered?row.selectedLetter+'. '+row.selected:'Unanswered'),width,10,true));
    questionRows.push(...block('Correct answer: '+row.answerLetter+'. '+row.answer,width,10,true));
    questionRows.push(...block('Explanation: '+row.explanation,width,10));
    questionRows.push(...block('Skill: '+row.skill+' | '+row.difficulty+' | Active time: '+duration(row.activeMs)+(row.flagged?' | Marked for review':''),width,9));
    const passageRows=row.passage?[...block(row.passage.title,258,11,true),...row.passage.paragraphs.flatMap(p=>block(p,258,9)),...block(row.passage.credit,258,8)]:[];
    const image=row.diagram?await diagramImage(row.diagram):null;
    const rightChunks=splitRows(questionRows,image?410:610),leftChunks=splitRows(passageRows,610);
    const count=Math.max(1,rightChunks.length,leftChunks.length);
    for(let i=0;i<count;i++){
      const page=pageHeader('Question '+row.number+' of '+totalQuestions+(i?' (continued)':''),'Form B #'+row.source+' | '+row.subject+' | '+row.status);
      if(row.passage){
        page.drawLine({start:{x:306,y:682},end:{x:306,y:62},thickness:.5,color:muted});
        drawRows(page,leftChunks[i]||[],36,678);
        // Repeat the question beside long passage continuations, so context stays adjacent.
        drawRows(page,rightChunks[i]||rightChunks[0],318,678);
      }else drawRows(page,rightChunks[i]||[],36,678);
      if(image)page.drawImage(image,{x:row.passage?318:156,y:62,width:row.passage?258:300,height:row.passage?144:168});
    }
  }
  const passages=new Map();
  for(const row of report.rows){
    if(row.subject!=='English'||!row.passage)continue;
    const key=row.passage.title;
    if(!passages.has(key))passages.set(key,{passage:row.passage,questions:[]});
    passages.get(key).questions.push(row.number);
  }
  for(const {passage,questions} of passages.values()){
    const rows=[
      ...block('Questions in this report: '+questions.sort((a,b)=>a-b).join(', '),540,10,true),
      ...passage.paragraphs.flatMap(paragraph=>block(paragraph,540,10)),
      ...block(passage.credit,540,8)
    ];
    splitRows(rows,610).forEach((chunk,i)=>{
      const page=pageHeader(i?'Reading passage (continued)':'Reading passage',passage.title);
      drawRows(page,chunk,36,678);
    });
  }
  const pages=pdf.getPages();
  pages.forEach((page,i)=>write(page,'BRCDC Homework #'+quizNumber+' | '+(i+1)+' / '+pages.length,36,28,8,false,muted));
  pdf.setTitle('BRCDC Homework Quiz #'+quizNumber+' - '+safe(report.name));pdf.setAuthor('BRCDC SHSAT Prep');
  return pdf.save();
};
