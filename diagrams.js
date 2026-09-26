/* Scalable diagrams built from the measurements supplied with the questions. */
window.examDiagram = function(d) {
  if(!d) return '';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=(x,y,value,extra='text-anchor="middle"')=>`<text x="${x}" y="${y}" ${extra}>${esc(value)}</text>`;
  let shape='';
  if(d.type==='garden') shape='<path d="M80 60 H392 V132 H272 V204 H80 Z" class="shape"/>'+text(236,38,'13 cm')+text(420,104,'3 cm')+text(176,233,'8 cm')+text(48,141,'6 cm');
  if(d.type==='homework-prism') shape='<path d="M90 60 L200 155 L405 30 Z M90 60 V160 L200 255 L405 130 V30 M200 155 V255" class="shape"/><path d="M405 30 L145 108" class="dashed"/><path d="M133 97 L150 92 L162 103" class="measure"/>'+text(64,115,'2 in')+text(130,229,'4 in')+text(280,52,'8 in');
  if(d.type==='pole'){
    for(let i=0;i<=4;i++)shape+='<path d="M'+(100+i*65)+' 40 V220 M100 '+(220-i*45)+' H360" class="measure"/>'+text(100+i*65,244,String(i))+text(80,225-i*45,String(i*4));
    shape+='<path d="M100 220 L360 40" class="dashed"/><circle cx="165" cy="175" r="5" class="point"/>'+text(204,193,'(1, 4)')+text(244,274,'Length (feet)')+text(220,22,'Weight (ounces)');
  }
  if(d.type==='boxplots'){
    const x=v=>60+(v-d.min)/(d.max-d.min)*390;
    const axisY=d.series.length===1?205:220;
    shape+=`<path d="M60 ${axisY} H450" class="measure"/>`;
    for(let v=d.min;v<=d.max;v+=d.step){
      shape+=`<path d="M${x(v)} ${axisY-6} V${axisY+6}" class="measure"/>`+text(x(v),axisY+29,v);
    }
    d.series.forEach((s,i)=>{
      const [low,q1,median,q3,high]=s.values,y=d.series.length===1?115:82+i*74;
      shape+=`<path d="M${x(low)} ${y} H${x(high)} M${x(low)} ${y-12} V${y+12} M${x(high)} ${y-12} V${y+12}" class="measure"/>`;
      shape+=`<rect x="${x(q1)}" y="${y-20}" width="${x(q3)-x(q1)}" height="40" class="shape"/>`;
      shape+=`<path d="M${x(median)} ${y-20} V${y+20}" class="measure"/>`;
      shape+=text(60,y-30,s.label,'text-anchor="start"');
    });
  }
  if(d.type==='plates'){
    shape='<circle cx="165" cy="130" r="82" class="shape"/><circle cx="365" cy="130" r="55" class="shape"/>';
    shape+='<path d="M83 130 H247 M310 130 H420" class="dashed"/>'+text(165,123,'18 in')+text(365,123,'12 in');
  }
  if(d.type==='rectangle') shape=`<rect x="80" y="65" width="250" height="120" class="shape"/>${text(205,40,d.top)}${text(350,130,d.side,'text-anchor="start"')}`;
  if(d.type==='triangle') shape=`<path d="M120 55 V205 H360 Z" class="shape"/><path d="M120 185 H140 V205" class="measure"/>${text(100,135,d.height,'text-anchor="end"')}${text(240,234,d.base)}`;
  if(d.type==='cut') {
    shape='<rect x="80" y="45" width="288" height="192" class="shape"/><path d="M240 45 H368 V141 Z" class="removed"/>';
    if(d.cuts===2) shape+='<path d="M80 141 V237 H208 Z" class="removed"/>';
    shape+=text(224,25,'18 in')+text(390,150,'12 in','text-anchor="start"')+text(294,70,'8 in')+text(344,111,'6 in')+'<path d="M353 45 V60 H368" class="measure"/>';
    if(d.cuts===2) shape+=text(143,227,'8 in')+text(99,190,'6 in')+'<path d="M80 222 H95 V237" class="measure"/>';
  }
  if(d.type==='squares') shape=`<rect x="50" y="95" width="110" height="110" class="shape"/><rect x="285" y="65" width="140" height="140" class="shape"/>${text(105,237,d.small)}${text(355,237,d.large)}`;
  if(d.type==='pyramid') shape='<path d="M245 30 L80 205 L310 245 L245 30 L410 180 L310 245 M80 205 L410 180" class="shape"/><path d="M245 30 L80 205 L310 245 Z" class="face"/><path d="M245 30 L195 225" class="dashed"/>'+text(199,130,'7 cm','text-anchor="end"')+text(171,251,'8 cm')+'<path d="M199 210 L214 214 L210 229" class="measure"/>';
  if(d.type==='line') {
    const vals=d.points.map(p=>p[0]),min=Math.min(...vals)-2,max=Math.max(...vals)+2;
    const x=v=>55+(v-min)/(max-min)*390;
    shape='<path d="M40 145 H460 M40 145 l10 -6 M40 145 l10 6 M460 145 l-10 -6 M460 145 l-10 6" class="measure"/>';
    for(let v=min;v<=max;v++) shape+=`<path d="M${x(v)} 140 V150" class="measure"/>`;
    d.points.forEach(([v,label])=>{shape+=`<circle cx="${x(v)}" cy="145" r="5" class="point"/>`+text(x(v),116,label)+text(x(v),180,d.variable&&label==='Q'?'?':v);});
  }
  if(d.type==='rectangular-box'){
    shape='<path d="M100 85 H320 V215 H100 Z M100 85 L165 40 H385 L320 85 M320 85 L385 40 V170 L320 215" class="shape"/>';
    shape+=text(205,239,'50 cm')+text(75,155,'20 cm')+text(350,31,'40 cm');
  }
  if(d.type==='similar-triangles'){
    shape='<path d="M55 215 L160 40 L265 215 Z M330 215 L390 110 L450 215 Z" class="shape"/>';
    shape+=text(160,240,'10 cm')+text(390,240,'6 cm')+text(310,166,'9 cm')+text(465,166,'9 cm');
    shape+=text(160,30,'N')+text(43,228,'M')+text(277,228,'P')+text(390,102,'Y')+text(318,228,'X')+text(462,228,'Z');
  }
  if(d.type==='telegraph-chart'){
    const years=[1870,1880,1890,1900,1910,1920],values=[12,30,55,67,75,155];
    shape='<path d="M55 38 V220 H465" class="measure"/>'+text(255,270,'Year')+text(260,24,'Messages transmitted (millions)');
    [0,50,100,150].forEach(v=>{const y=220-v;shape+=`<path d="M55 ${y} H465" class="measure"/>`+text(43,y+4,v,'text-anchor="end"');});
    years.forEach((year,i)=>{const x=78+i*65,h=values[i];shape+=`<rect x="${x}" y="${220-h}" width="32" height="${h}" class="shape"/>`+text(x+16,240,year)+text(x+16,215-h,values[i]);});
  }
  if(d.type==='telegraph-network'){
    const nodes=[['North America',80,100],['Europe',225,70],['Africa',227,175],['India',348,135],['Australia',425,205],['New Zealand',445,248]];
    shape='<path d="M80 100 L225 70 L227 175 L348 135 L425 205 L445 248 M80 100 L227 175 M225 70 L348 135" class="measure"/>';
    nodes.forEach(([label,x,y])=>{shape+=`<circle cx="${x}" cy="${y}" r="6" class="point"/>`+text(x,y-13,label);});
    shape+=text(248,28,'Telegraph links by 1902');
  }
  return `<figure class="math-diagram"><svg viewBox="0 0 500 280" role="img" aria-label="${esc(d.caption)}"><title>${esc(d.caption)}</title>${shape}</svg><figcaption>${esc(d.caption)}</figcaption></figure>`;
};
