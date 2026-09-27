const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const homework3Engine=require('./homework-3-engine.js');

let dataDir=process.env.BRCDC_DATA_DIR||path.join(__dirname,'data');
try {
  fs.mkdirSync(dataDir,{recursive:true,mode:0o700});
} catch(error) {
  if(error.code!=='EACCES'&&error.code!=='EROFS') throw error;
  const requested=dataDir;
  dataDir=path.join(os.tmpdir(),'brcdc-homework-3-data');
  fs.mkdirSync(dataDir,{recursive:true,mode:0o700});
  console.warn(`BRCDC warning: could not write to ${requested}; using temporary storage at ${dataDir}. Results may be lost after restart.`);
}

const db=new DatabaseSync(path.join(dataDir,'attempts.sqlite'));
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS attempts (token TEXT PRIMARY KEY, state TEXT NOT NULL)');
const find=db.prepare('SELECT state FROM attempts WHERE token = ?');
const save=db.prepare('INSERT INTO attempts(token,state) VALUES(?,?) ON CONFLICT(token) DO UPDATE SET state=excluded.state');
const minutes=Number(process.env.BRCDC_HOMEWORK_3_MINUTES||process.env.BRCDC_HOMEWORK_MINUTES||60);
if(!Number.isFinite(minutes)||minutes<=0||minutes>360) throw new Error('BRCDC_HOMEWORK_3_MINUTES must be in (0,360].');

const port=Number(process.env.PORT||4318);
const host=process.env.HOST||'127.0.0.1';
const cookieName='brcdc_homework_3';
const engine=homework3Engine;
const assets={
  '/':'homework-3.html',
  '/index.html':'homework-3.html',
  '/homework-3':'homework-3.html',
  '/homework-3/':'homework-3.html',
  '/homework-3.html':'homework-3.html',
  '/icons.js':'icons.js',
  '/diagrams.js':'diagrams.js',
  '/styles.css':'styles.css',
  '/homework-app.js':'homework-app.js',
  '/homework.css':'homework.css',
  '/homework-report.js':'homework-report.js',
  '/pdf-lib.min.js':'vendor/pdf-lib.min.js',
  '/vendor/pdf-lib.min.js':'vendor/pdf-lib.min.js'
};
const contentTypes={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};

function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));}
function stored(req){
  const token=new RegExp('(?:^|;\\s*)'+cookieName+'=([a-f0-9]{64})(?:;|$)').exec(req.headers.cookie||'')?.[1];
  const record=token&&find.get(token);
  return record?{token,state:JSON.parse(record.state)}:null;
}
function persist(record){save.run(record.token,JSON.stringify(record.state));}
async function body(req){
  let raw='';
  for await(const chunk of req){
    raw+=chunk;
    if(raw.length>4096) throw Object.assign(new Error('Request too large.'),{status:413});
  }
  try{return JSON.parse(raw||'{}');}catch{throw Object.assign(new Error('Invalid request.'),{status:400});}
}

const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  try {
    const url=new URL(req.url,'http://localhost');
    const apiPath=url.pathname.startsWith('/homework-3/api/')?url.pathname.slice('/homework-3'.length):url.pathname;
    const assetAlias=/^\/homework-3(\/.*)$/.exec(url.pathname)?.[1];
    const asset=assets[url.pathname]||(assetAlias?assets[assetAlias]:null);

    if(req.method==='GET'&&asset){
      const file=path.join(__dirname,asset);
      const contents=fs.readFileSync(file);
      res.writeHead(200,{'Content-Type':contentTypes[path.extname(file)]||'application/octet-stream'});
      res.end(contents);
      return;
    }

    if(apiPath==='/api/config'&&req.method==='GET'){
      json(res,200,{title:engine.bank.title,version:engine.bank.version,minutes,counts:engine.bank.counts});
      return;
    }

    if(apiPath==='/api/session'&&req.method==='GET'){
      const record=stored(req);
      if(!record){json(res,200,{status:'not-started',serverNow:Date.now()});return;}
      if(record.state.version!==engine.bank.version){json(res,409,{error:'This saved homework uses an older question-bank version. Start a new Quiz 3 attempt.'});return;}
      const output=engine.publicState(record.state);
      persist(record);
      json(res,200,output);
      return;
    }

    if(req.method==='POST'&&apiPath.startsWith('/api/')){
      if(req.headers['content-type']!=='application/json'){json(res,415,{error:'JSON requests only.'});return;}
      if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){json(res,403,{error:'Request origin is not allowed.'});return;}
      const input=await body(req);
      let record=stored(req);
      if(record&&record.state.version!==engine.bank.version){json(res,409,{error:'This attempt uses an older question bank. Start a new Quiz 3 attempt.'});return;}
      if(apiPath==='/api/start'){
        if(!record){
          const name=typeof input.name==='string'?input.name.trim():'';
          if(!name||name.length>100){json(res,400,{error:'Enter your name (up to 100 characters).'});return;}
          record={token:crypto.randomBytes(32).toString('hex'),state:engine.startExam(name,minutes)};
          res.setHeader('Set-Cookie',`${cookieName}=${record.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${process.env.BRCDC_SECURE_COOKIE==='1'?'; Secure':''}`);
        }
      } else if(apiPath==='/api/answer'){
        if(!record){json(res,401,{error:'Start your homework first.'});return;}
        engine.submit(record.state,input);
      } else if(apiPath==='/api/pause'||apiPath==='/api/resume'){
        if(!record){json(res,401,{error:'Start your homework first.'});return;}
        engine.setPaused(record.state,apiPath==='/api/pause');
      } else {
        json(res,404,{error:'Not found.'});
        return;
      }
      const output=engine.publicState(record.state);
      persist(record);
      json(res,200,output);
      return;
    }

    json(res,404,{error:'Not found.'});
  } catch(error) {
    if(res.headersSent){res.destroy();return;}
    json(res,error.status||500,{error:error.status?error.message:'The homework could not save this request. Reconnect and try again; do not clear your browser data.'});
  }
});

server.listen(port,host,()=>console.log(`BRCDC Homework Quiz #3: http://${host}:${server.address().port} | ${minutes} minutes`));
function stop(){server.close(()=>{db.close();process.exit(0);});}
process.on('SIGINT',stop);
process.on('SIGTERM',stop);
