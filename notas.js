/* To Do List · pestaña «Notas»: libretas y PDF anotables (estilo GoodNotes / Notability).
   Este archivo solo se descarga al abrir la pestaña Notas; las librerías de PDF/PowerPoint solo cuando hacen falta. */
(()=>{
'use strict';
const LIB={
  pdf:['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js','sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e'],
  worker:['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js','sha384-SnzOobpRMLXZ52iJvZm/C0fYw0OQemTXzTjIsdsfMcrCtCEe9qgzxTd3RSklO5x2'],
  fonts:'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/', cmaps:'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
  pdflib:['https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js','sha384-weMABwrltA6jWR8DDe9Jp5blk+tZQh7ugpCsF3JwSA53WZM9/14PjS5LAJNHNjAI'],
  pptx:['https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js','sha384-Cck14aA9cifjYolcnjebXRfWGkz5ltHMBiG4px/j8GS+xQcb7OhNQWZYyWjQ+UwQ'],
};
let pdfP=null;
function needPdf(){ return pdfP ||= (async()=>{ await loadScript(LIB.pdf[0],LIB.pdf[1]);
  const r=await fetch(LIB.worker[0],{integrity:LIB.worker[1],mode:'cors'}); if(!r.ok) throw new Error('worker');
  pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([await r.text()],{type:'text/javascript'})); return pdfjsLib; })().catch(e=>{ pdfP=null; throw e; }); }

/* ---------- constantes ---------- */
const A4=[595,842];
const TPL={blank:'En blanco',lined:'Rayas',grid:'Cuadrícula',dots:'Puntos',cornell:'Cornell'};
const PAPER={w:'#ffffff',c:'#fbf6e9',g:'#f4f4f2'};
const COLORS=['#1d1d1f','#1f5fd1','#d0312d','#1e8e3e','#f29900','#8e44ad','#ffffff'];
const HLCOLORS=['#ffe14d','#7ee081','#7cc7ff','#ff9ecb','#ffb74d'];
const WID={pen:[1.2,2.2,4],hl:[9,15,24],shape:[1.2,2.2,4],er:[8,16,32]};
const IC={
  back:'<path d="m15 5-7 7 7 7"/>', pen:'<path d="M4 20l4-1L19 8l-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/>',
  hl:'<path d="m9 15-4 4h5l2-2"/><path d="M8 13l7-7 4 4-7 7-4-4Z"/>', er:'<path d="M7 20h11"/><path d="M4.6 14.6 13 6.2a2 2 0 0 1 2.8 0l2 2a2 2 0 0 1 0 2.8L10 19H7l-2.4-2.4a1.7 1.7 0 0 1 0-2Z"/>',
  lasso:'<path d="M12 4c4.4 0 8 2.2 8 5s-3.6 5-8 5-8-2.2-8-5 3.6-5 8-5Z" stroke-dasharray="3 3"/><path d="M6 13c-1 2 0 4 2 4s2 2 1 3"/>', text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  hand:'<path d="M8 13V6a1.5 1.5 0 0 1 3 0v6M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7-2.8 0-4.2-1.3-5.6-3.8L4 13.5a1.5 1.5 0 0 1 2.6-1.5L8 14"/>',
  shape:'<circle cx="8" cy="8" r="4"/><path d="M13 13h7v7h-7z"/>', img:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 8"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  pages:'<rect x="4" y="3" width="11" height="14" rx="1.5"/><path d="M9 21h9.5A1.5 1.5 0 0 0 20 19.5V8"/>', plus:'<path d="M12 5v14M5 12h14"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', play:'<path d="M7 4v16l13-8Z"/>', pause:'<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
  more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>', star:'<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9Z"/>',
  dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', head:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>', zin:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5M11 8v6M8 11h6"/>', zout:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5M8 11h6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>', copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
};
const ic=(n,c='')=>`<svg class="nbi ${c}" viewBox="0 0 24 24">${IC[n]}</svg>`;

/* ---------- estado ---------- */
const NB={mode:'lib',id:null,doc:null,path:null,tool:ls.get('mgg.nb.tool','pen'),col:ls.get('mgg.nb.col',{pen:'#1d1d1f',hl:'#ffe14d',shape:'#1f5fd1',text:'#1d1d1f'}),wi:ls.get('mgg.nb.wi',{pen:1,hl:1,shape:1,er:1}),erMode:ls.get('mgg.nb.erm','stroke'),
  zoom:1,s:1,cur:0,undo:[],redo:[],sel:null,clip:null,saveT:null,dirty:false,q:'',folder:'*',sort:ls.get('mgg.nb.sort','upd'),rendered:new Map(),imgs:new Map(),pdfs:new Map(),rec:null,au:null,auOpen:false,penSeen:false,io:null};
const metas=()=>all('nbook');
const meta=id=>{ const it=S.items.get(id); return it&&!it.deleted?it:null; };
const docPath=id=>`${S.uid}/nb/${id}.json`;
const newFile=ext=>`${S.uid}/nb/${uuid()}.${ext}`;
const fmtB=b=>b>=1048576?(b/1048576).toLocaleString('es-ES',{maximumFractionDigits:1})+' MB':Math.max(1,Math.round(b/1024))+' KB';
const fmtT=s=>{ s=Math.max(0,Math.floor(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; };
const r1=v=>Math.round(v*10)/10;

/* ---------- ficheros (IndexedDB + Supabase) ---------- */
async function getBlob(path){ let b=await IDB.get(path); if(!b&&S.cloud){ const {data,error}=await S.cloud.storage.from(BUCKET).download(path); if(!error&&data){ b=data; IDB.put(path,b); } } return b; }
async function putFile(path,blob){ try{ await IDB.put(path,blob); }catch(e){}
  if(!S.cloud) return; for(let i=0;i<3;i++){ try{ const {error}=await S.cloud.storage.from(BUCKET).upload(path,blob,{contentType:blob.type||'application/octet-stream',upsert:true}); if(!error){ ls.set('mgg.upq.'+S.uid,upq().filter(p=>p!==path)); return; } console.warn('subida',error); }catch(e){ console.warn('subida',e); } await new Promise(r=>setTimeout(r,800*(i+1))); }
  const q=upq(); if(!q.includes(path)) ls.set('mgg.upq.'+S.uid,[...q,path]); toast('Sin conexión: se subirá más tarde'); }
async function rmFiles(paths){ paths=paths.filter(Boolean); for(const p of paths){ IDB.del(p); } ls.set('mgg.upq.'+S.uid,upq().filter(p=>!paths.includes(p))); if(S.cloud&&paths.length){ try{ await S.cloud.storage.from(BUCKET).remove(paths); }catch(e){} } }
async function loadDoc(id){ const m=meta(id); const path=docPath(id); let doc=null; const b=await IDB.get(path); if(b){ try{ doc=JSON.parse(await b.text()); }catch(e){} }
  if((!doc||(m&&(m.data.rev||0)>(doc.rev||0)))&&S.cloud){ const {data,error}=await S.cloud.storage.from(BUCKET).download(path); if(!error&&data){ try{ const d2=JSON.parse(await data.text()); if(!doc||(d2.rev||0)>=(doc.rev||0)){ doc=d2; IDB.put(path,data); } }catch(e){} } }
  if(!doc&&m&&m.data.src){ try{ const lib=await needPdf(); const b=await getBlob(m.data.src); if(b){ const d=await lib.getDocument({data:new Uint8Array(await b.arrayBuffer()),standardFontDataUrl:LIB.fonts,cMapUrl:LIB.cmaps,cMapPacked:true,isEvalSupported:false}).promise; const pages=[];
      for(let i=0;i<d.numPages;i++){ const vp=(await d.getPage(i+1)).getViewport({scale:1}); pages.push({id:uuid(),w:r1(vp.width),h:r1(vp.height),bg:{t:'pdf',file:m.data.src,n:i},els:[]}); } doc={rev:m.data.rev||0,pages,recs:[],sizes:{[m.data.src]:b.size}}; NB.pdfs.set(m.data.src,Promise.resolve(d)); } }catch(e){ console.warn(e); } }
  if(!doc&&m&&(m.data.rev||0)>0) throw new Error('missing');
  if(!doc) doc={rev:0,pages:[{id:uuid(),w:A4[0],h:A4[1],bg:{t:'tpl',tpl:'blank',paper:'w'},els:[]}],recs:[]};
  doc.recs ||= []; for(const p of doc.pages) p.els ||= []; return doc; }
const WQ=new Map();
function writeDoc(id,doc,extra={}){ doc.rev=(doc.rev||0)+1; const json=JSON.stringify(doc), rev=doc.rev; const prev=WQ.get(id)||Promise.resolve(); const p=prev.then(()=>writeDoc1(id,doc,json,rev,extra)); WQ.set(id,p.catch(()=>{})); return p; }
async function writeDoc1(id,doc,json,rev,extra){ await putFile(docPath(id),new Blob([json],{type:'application/json'}));
  const fb=docFilesBytes(doc); if(meta(id)) update(id,{rev,updated:new Date().toISOString(),n:doc.pages.length,bytes:json.length+fb,...extra}); }
function docFiles(doc){ const s=new Set(); for(const p of doc.pages){ if(p.bg.file) s.add(p.bg.file); if(p.bg.path) s.add(p.bg.path); for(const e of p.els) if(e.t==='im') s.add(e.path); } for(const r of doc.recs||[]) s.add(r.path); return [...s]; }
function docFilesBytes(doc){ let n=0; const sz=doc.sizes||{}; for(const f of docFiles(doc)) n+=sz[f]||0; return n; }

/* ---------- dibujo ---------- */
function bboxOf(e){ if(e.t==='s'){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; const p=e.p; for(let i=0;i<p.length;i+=3){ if(p[i]<x0) x0=p[i]; if(p[i]>x1) x1=p[i]; if(p[i+1]<y0) y0=p[i+1]; if(p[i+1]>y1) y1=p[i+1]; } const h=e.w/2+1; return [x0-h,y0-h,x1+h,y1+h]; }
  if(e.t==='tx'){ const [w,h]=txSize(e); return [e.x,e.y,e.x+w,e.y+h]; } return [e.x,e.y,e.x+e.w,e.y+e.h]; }
const _mx=document.createElement('canvas').getContext('2d');
const txFont=(fs,k=1)=>`${fs*k}px -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif`;
function txSize(e){ _mx.font=txFont(e.fs); const L=String(e.txt).split('\n'); return [Math.max(20,...L.map(l=>_mx.measureText(l).width))+2,L.length*e.fs*1.25]; }
function drawStroke(c,e,k,alpha=1){ const p=e.p, n=p.length/3; if(!n) return; c.save(); c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=e.c; c.fillStyle=e.c;
  if(e.k==='hl'){ c.globalAlpha=.38*alpha; c.globalCompositeOperation='multiply'; c.lineCap='butt'; c.lineWidth=e.w*k; c.beginPath(); c.moveTo(p[0]*k,p[1]*k); for(let i=3;i<p.length;i+=3) c.lineTo(p[i]*k,p[i+1]*k); if(n===1) c.lineTo(p[0]*k+.1,p[1]*k); c.stroke(); c.restore(); return; }
  c.globalAlpha=alpha; const vary=e.k==='pen'&&e.pr;
  if(n===1){ c.beginPath(); c.arc(p[0]*k,p[1]*k,Math.max(.6,e.w*k/2),0,7); c.fill(); c.restore(); return; }
  if(!vary){ c.lineWidth=e.w*k; c.beginPath(); c.moveTo(p[0]*k,p[1]*k); if(n===2) c.lineTo(p[3]*k,p[4]*k); else { for(let i=3;i<p.length-3;i+=3){ const mx=(p[i]+p[i+3])/2, my=(p[i+1]+p[i+4])/2; c.quadraticCurveTo(p[i]*k,p[i+1]*k,mx*k,my*k); } c.lineTo(p[p.length-3]*k,p[p.length-2]*k); } c.stroke(); c.restore(); return; }
  for(let i=3;i<p.length;i+=3){ const pr=(p[i-1]+p[i+2])/2; c.lineWidth=Math.max(.5,e.w*k*(.35+pr*1.3)); c.beginPath(); c.moveTo(p[i-3]*k,p[i-2]*k); c.lineTo(p[i]*k,p[i+1]*k); c.stroke(); } c.restore(); }
function drawText(c,e,k,alpha=1){ c.save(); c.globalAlpha=alpha; c.fillStyle=e.c; c.font=txFont(e.fs,k); c.textBaseline='top'; String(e.txt).split('\n').forEach((l,i)=>c.fillText(l,e.x*k,(e.y+i*e.fs*1.25)*k)); c.restore(); }
function imgOf(path,onload){ let o=NB.imgs.get(path); if(o) return o.ok?o.im:null; o={im:new Image(),ok:false}; NB.imgs.set(path,o); mediaSrc(path).then(u=>{ if(!u) return; o.im.onload=()=>{ o.ok=true; onload&&onload(); }; o.im.src=u; }); return null; }
async function imgReady(path){ const o=NB.imgs.get(path); if(o&&o.ok) return o.im; const u=await mediaSrc(path); if(!u) return null; const im=new Image(); await new Promise(r=>{ im.onload=r; im.onerror=r; im.src=u; }); NB.imgs.set(path,{im,ok:true}); return im; }
function renderInk(c,pg,k,opt={}){ const play=NB.au&&NB.au.rec&&!NB.au.el.paused||(NB.au&&NB.au.scrub), t=play?NB.au.el.currentTime*1000:0;
  for(const e of pg.els){ if(opt.skip&&opt.skip.has(e.id)) continue; const a=play&&e.rec===NB.au.rec&&e.tm>t?.18:1;
    if(e.t==='s') drawStroke(c,e,k,a); else if(e.t==='tx') drawText(c,e,k,a); else if(e.t==='im'){ const im=opt.imgs?opt.imgs.get(e.path):imgOf(e.path,()=>{ NB.rendered.delete(pg.id); paintVisible(); }); if(im){ c.save(); c.globalAlpha=a; c.drawImage(im,e.x*k,e.y*k,e.w*k,e.h*k); c.restore(); } } } }
function drawTpl(c,pg,k,W,H){ const bg=pg.bg; c.fillStyle=PAPER[bg.paper||'w']||'#fff'; c.fillRect(0,0,W,H); const t=bg.tpl; if(!t||t==='blank') return;
  c.save(); c.strokeStyle='#c9d4e3'; c.fillStyle='#b7c2d1'; c.lineWidth=Math.max(.5,.6*k); const w=pg.w, h=pg.h;
  const hl=y=>{ c.beginPath(); c.moveTo(0,y*k); c.lineTo(w*k,y*k); c.stroke(); }, vl=(x,y0=0,y1=h)=>{ c.beginPath(); c.moveTo(x*k,y0*k); c.lineTo(x*k,y1*k); c.stroke(); };
  if(t==='lined'){ for(let y=72;y<h-20;y+=24) hl(y); c.strokeStyle='#efb3b3'; vl(56); }
  else if(t==='grid'){ for(let y=20;y<h;y+=20) hl(y); for(let x=20;x<w;x+=20) vl(x); }
  else if(t==='dots'){ for(let y=20;y<h;y+=20) for(let x=20;x<w;x+=20){ c.beginPath(); c.arc(x*k,y*k,Math.max(.7,.9*k),0,7); c.fill(); } }
  else if(t==='cornell'){ const top=70, sum=h-150; for(let y=top+24;y<sum;y+=24) hl(y); c.strokeStyle='#9fb0c8'; c.lineWidth=Math.max(.8,1.1*k); hl(top); hl(sum); vl(150,top,sum); }
  c.restore(); }
async function pdfDoc(file){ let p=NB.pdfs.get(file); if(p) return p; p=(async()=>{ const lib=await needPdf(); const b=await getBlob(file); if(!b) throw new Error('No se encuentra el PDF'); return lib.getDocument({data:new Uint8Array(await b.arrayBuffer()),standardFontDataUrl:LIB.fonts,cMapUrl:LIB.cmaps,cMapPacked:true,isEvalSupported:false}).promise; })(); NB.pdfs.set(file,p); p.catch(()=>NB.pdfs.delete(file)); return p; }
async function renderBg(c,pg,k,W,H,tok){ const bg=pg.bg;
  if(bg.t==='pdf'){ c.fillStyle='#fff'; c.fillRect(0,0,W,H); const d=await pdfDoc(bg.file); if(tok&&tok.dead) return; const page=await d.getPage(bg.n+1); if(tok&&tok.dead) return; const vp=page.getViewport({scale:k}); const task=page.render({canvasContext:c,viewport:vp}); if(tok) tok.task=task; try{ await task.promise; }catch(e){ if(e&&e.name==='RenderingCancelledException') return; throw e; } return; }
  if(bg.t==='img'){ c.fillStyle='#fff'; c.fillRect(0,0,W,H); const im=await imgReady(bg.path); if(im&&!(tok&&tok.dead)) c.drawImage(im,0,0,W,H); return; }
  drawTpl(c,pg,k,W,H); }

/* ---------- biblioteca ---------- */
let usageC=null;
async function usage(){ if(!S.cloud) return null; if(usageC&&Date.now()-usageC.t<300000) return usageC.v; let tot=0;
  const sum=async(bucket,prefix)=>{ for(let off=0;;off+=1000){ const {data,error}=await S.cloud.storage.from(bucket).list(prefix,{limit:1000,offset:off}); if(error||!data) break; for(const f of data) tot+=f.metadata?.size||0; if(data.length<1000) break; } };
  try{ await sum(BUCKET,S.uid); await sum(BUCKET,S.uid+'/nb'); await sum('dash-backups',S.uid); }catch(e){ return null; } usageC={t:Date.now(),v:tot}; return tot; }
function libHTML(){ const F=setting('nbFolders',[])||[], q=NB.q.trim().toLowerCase();
  let L=metas().filter(m=>(NB.folder==='*'||(NB.folder==='★'?m.data.fav:(m.data.folder||'')===NB.folder))&&(!q||String(m.data.title||'').toLowerCase().includes(q)));
  L.sort(NB.sort==='name'?(a,b)=>String(a.data.title).localeCompare(String(b.data.title),'es',{numeric:true}):NB.sort==='new'?(a,b)=>String(b.data.created||'').localeCompare(String(a.data.created||'')):(a,b)=>String(b.data.updated||'').localeCompare(String(a.data.updated||'')));
  const chip=(k,l)=>`<button class="nbchip ${NB.folder===k?'on':''}" data-nbf="${esc(k)}">${l}</button>`;
  return `<div class="nblh"><h2>Notas</h2><input class="inp" id="nb_q" placeholder="Buscar" value="${esc(NB.q)}"><select class="inp" id="nb_sort"><option value="upd">Recientes</option><option value="new">Creación</option><option value="name">Nombre</option></select>
     <div class="nbnew"><button class="btn pri sm" id="nb_new">${ic('plus')} Nueva</button><button class="btn sm" id="nb_imp">Importar PDF / imagen</button><input type="file" id="nb_file" accept="application/pdf,image/*" multiple hidden></div></div>
   <div class="nbchips">${chip('*','Todas')}${chip('★','★ Favoritas')}${F.map(f=>chip(f,esc(f))).join('')}<button class="nbchip add" id="nb_addf">+ Carpeta</button></div>
   <div class="nbgrid">${L.map(m=>{ const d=m.data; return `<div class="nbcard" data-nbo="${m.id}"><div class="nbcov">${d.thumb?`<img src="${esc(d.thumb)}" alt="">`:`<span>${esc(TPL[d.tpl]||'')}</span>`}${d.fav?'<i class="nbfav">★</i>':''}</div>
       <div class="nbct"><b>${esc(d.title||'Sin título')}</b><span>${d.updated?fD(d.updated.slice(0,10)):''} · ${d.n||1} pág.${d.folder?' · '+esc(d.folder):''}</span></div><button class="nbmore" data-nbm="${m.id}" title="Opciones">${ic('more')}</button></div>`; }).join('')||`<p class="mut nbempty">${q?'Nada coincide con la búsqueda.':'Aún no tienes notas. Crea una libreta o importa un PDF.'}</p>`}</div>
   <div class="nbuse" id="nb_use"></div>`; }
function renderLib(){ const v=$('#view'); v.classList.add('nbv'); let root=$('#nbroot'); const keepQ=document.activeElement&&document.activeElement.id==='nb_q';
  if(!root||!root.classList.contains('lib')){ v.innerHTML='<div id="nbroot" class="nbr lib"></div>'; root=$('#nbroot'); bindLib(root); }
  root.innerHTML=libHTML(); $('#nb_sort').value=NB.sort; if(keepQ){ const q=$('#nb_q'); q.focus(); q.setSelectionRange(q.value.length,q.value.length); }
  usage().then(b=>{ const el=$('#nb_use'); if(!el) return; if(b==null){ el.innerHTML=S.cloud?'':'<span class="mut">Modo local: las notas se guardan solo en este dispositivo.</span>'; return; } const pct=Math.min(100,b/1073741824*100);
    el.innerHTML=`<div class="nbbar2"><i style="width:${Math.max(.5,pct)}%"></i></div><span>Espacio usado en tu nube: <b>${fmtB(b)}</b> de 1 GB (${pct.toLocaleString('es-ES',{maximumFractionDigits:1})} %) · notas, fotos, audios y copias</span>`; }); }
function bindLib(root){
  root.addEventListener('input',e=>{ if(e.target.id==='nb_q'){ NB.q=e.target.value; renderLib(); } });
  root.addEventListener('change',e=>{ if(e.target.id==='nb_sort'){ NB.sort=e.target.value; ls.set('mgg.nb.sort',NB.sort); renderLib(); } if(e.target.id==='nb_file'){ importFiles([...e.target.files]); e.target.value=''; } });
  root.addEventListener('click',e=>{ const f=e.target.closest('[data-nbf]'); if(f){ NB.folder=f.dataset.nbf; return renderLib(); }
    if(e.target.closest('#nb_addf')) return prompt2('Nueva carpeta','Nombre (p. ej. ONT5)',v=>{ v=v.trim(); if(!v) return; setSetting('nbFolders',[...new Set([...(setting('nbFolders',[])||[]),v])]); NB.folder=v; renderLib(); });
    if(e.target.closest('#nb_new')) return newDialog(); if(e.target.closest('#nb_imp')) return $('#nb_file').click();
    const m=e.target.closest('[data-nbm]'); if(m){ e.stopPropagation(); return cardMenu(m.dataset.nbm,m); }
    const o=e.target.closest('[data-nbo]'); if(o) return openNb(o.dataset.nbo); }); }
function newDialog(){ let tpl='lined', ori='p', paper='w';
  const prev=t=>`<canvas data-tp="${t}" width="66" height="90"></canvas>`;
  modal(`<h2>Nueva libreta</h2><label class="f">Título</label><input class="inp" id="nn_t" placeholder="Sin título" value="">
   <label class="f" style="margin-top:12px">Plantilla</label><div class="nbtpl" id="nn_tpl">${Object.entries(TPL).map(([k,l])=>`<button data-tpl="${k}" class="${k===tpl?'on':''}">${prev(k)}<span>${l}</span></button>`).join('')}</div>
   <div class="g2"><div><label class="f">Orientación</label><select class="inp" id="nn_o"><option value="p">Vertical (A4)</option><option value="l">Horizontal (A4)</option></select></div><div><label class="f">Papel</label><select class="inp" id="nn_p"><option value="w">Blanco</option><option value="c">Crema</option><option value="g">Gris claro</option></select></div></div>
   ${(setting('nbFolders',[])||[]).length?`<label class="f">Carpeta</label><select class="inp" id="nn_f"><option value="">(ninguna)</option>${setting('nbFolders',[]).map(f=>`<option ${f===NB.folder?'selected':''}>${esc(f)}</option>`).join('')}</select>`:''}
   <div class="acts"><button class="btn" data-close>Cancelar</button><button class="btn pri" id="nn_ok">Crear</button></div>`);
  const draw=()=>$$('[data-tp]').forEach(cv=>{ const c=cv.getContext('2d'), pg={w:A4[0],h:A4[1],bg:{t:'tpl',tpl:cv.dataset.tp,paper:$('#nn_p').value}}; c.clearRect(0,0,66,90); drawTpl(c,pg,66/595,66,90); }); draw();
  $('#nn_p').onchange=draw; $('#nn_tpl').onclick=e=>{ const b=e.target.closest('[data-tpl]'); if(!b) return; tpl=b.dataset.tpl; $$('[data-tpl]').forEach(x=>x.classList.toggle('on',x===b)); };
  setTimeout(()=>$('#nn_t').focus(),30); $('#nn_t').onkeydown=e=>{ if(e.key==='Enter') $('#nn_ok').click(); };
  $('#nn_ok').onclick=async()=>{ ori=$('#nn_o').value; paper=$('#nn_p').value; const title=$('#nn_t').value.trim()||'Sin título', folder=$('#nn_f')?$('#nn_f').value:(NB.folder.length>1&&NB.folder!=='★'&&NB.folder!=='*'?NB.folder:'');
    const [w,h]=ori==='l'?[A4[1],A4[0]]:A4; closeModal(); const doc={rev:0,pages:[{id:uuid(),w,h,bg:{t:'tpl',tpl,paper},els:[]}],recs:[]};
    const it=create('nbook',{title,folder,fav:false,tpl,created:new Date().toISOString(),updated:new Date().toISOString(),n:1,rev:0}); await writeDoc(it.id,doc,{thumb:await thumbOf(doc.pages[0])}); openNb(it.id,doc); }; }
async function importFiles(files){ if(!files.length) return; const pdfs=files.filter(f=>f.type==='application/pdf'||/\.pdf$/i.test(f.name)), imgs=files.filter(f=>f.type.startsWith('image/'));
  try{ for(const f of pdfs){ toast('Importando '+f.name+'…'); const lib=await needPdf(); const bytes=new Uint8Array(await f.arrayBuffer()); const d=await lib.getDocument({data:bytes.slice(),standardFontDataUrl:LIB.fonts,cMapUrl:LIB.cmaps,cMapPacked:true,isEvalSupported:false}).promise;
      const file=newFile('pdf'), pages=[]; for(let i=0;i<d.numPages;i++){ const pg=await d.getPage(i+1); const vp=pg.getViewport({scale:1}); pages.push({id:uuid(),w:r1(vp.width),h:r1(vp.height),bg:{t:'pdf',file,n:i},els:[]}); }
      await putFile(file,new Blob([bytes],{type:'application/pdf'})); NB.pdfs.set(file,Promise.resolve(d)); const doc={rev:0,pages,recs:[],sizes:{[file]:bytes.length}};
      const it=create('nbook',{title:f.name.replace(/\.pdf$/i,''),folder:NB.folder.length>1&&NB.folder!=='★'&&NB.folder!=='*'?NB.folder:'',fav:false,tpl:'pdf',src:file,created:new Date().toISOString(),updated:new Date().toISOString(),n:pages.length,rev:0});
      await writeDoc(it.id,doc,{thumb:await thumbOf(pages[0])}); if(pdfs.length===1&&!imgs.length) return openNb(it.id,doc); }
    if(imgs.length){ const pages=[], sizes={}; for(const f of imgs){ const b=await shrinkImage(f); const bm=await createImageBitmap(b); const path=newFile(b.type.includes('png')?'png':'jpg'); await putFile(path,b); sizes[path]=b.size; pages.push({id:uuid(),w:595,h:r1(595*bm.height/bm.width),bg:{t:'img',path},els:[]}); }
      const doc={rev:0,pages,recs:[],sizes}; const it=create('nbook',{title:imgs.length===1?imgs[0].name.replace(/\.[^.]+$/,''):'Imágenes',folder:'',fav:false,tpl:'img',created:new Date().toISOString(),updated:new Date().toISOString(),n:pages.length,rev:0});
      await writeDoc(it.id,doc,{thumb:await thumbOf(pages[0])}); return openNb(it.id,doc); }
    renderLib(); }catch(e){ console.error(e); toast('No se pudo importar: '+(e.message||e)); } }
async function thumbOf(pg){ try{ const W=180, k=W/pg.w, H=Math.round(pg.h*k); const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); await renderBg(c,pg,k,W,H); const imgs=new Map(); for(const e of pg.els) if(e.t==='im'){ const im=await imgReady(e.path); if(im) imgs.set(e.path,im); } renderInk(c,pg,k,{imgs}); return cv.toDataURL('image/jpeg',.7); }catch(e){ return ''; } }
function cardMenu(id,btn){ const m=meta(id); if(!m) return; const F=setting('nbFolders',[])||[];
  popMenu(btn,[['open','Abrir'],['ren','Renombrar'],['fav',m.data.fav?'Quitar de favoritas':'Añadir a favoritas'],...(F.length?[['mv','Mover a carpeta…']]:[]),['dup','Duplicar'],null,['pdf','Exportar a PDF'],['pptx','Exportar a PowerPoint'],null,['del','Eliminar',1]],async k=>{
    if(k==='open') return openNb(id);
    if(k==='ren') return prompt2('Renombrar','Título',v=>{ v=v.trim(); if(v) update(id,{title:v}); },m.data.title||'');
    if(k==='fav') return update(id,{fav:!m.data.fav});
    if(k==='mv') return popMenu(btn,[['','(ninguna)'],...F.map(f=>[f,f])],f=>update(id,{folder:f}));
    if(k==='dup') return dupNb(id);
    if(k==='pdf'||k==='pptx'){ const doc=await loadDoc(id); return k==='pdf'?exportPDF(doc,m.data.title):exportPPTX(doc,m.data.title); }
    if(k==='del') return confirm2('Eliminar «'+(m.data.title||'Sin título')+'»','Se borran la libreta, sus PDF, imágenes y grabaciones. No se puede deshacer.',async()=>{ const doc=await loadDoc(id); remove(id); await rmFiles([docPath(id),...docFiles(doc)]); usageC=null; toast('Eliminada'); }); }); }
async function dupNb(id){ const m=meta(id); if(!m) return; toast('Duplicando…'); const doc=JSON.parse(JSON.stringify(await loadDoc(id))); const map=new Map(); doc.sizes ||= {};
  for(const f of docFiles(doc)){ const b=await getBlob(f); if(!b) continue; const nf=newFile(f.split('.').pop()); await putFile(nf,b); map.set(f,nf); doc.sizes[nf]=b.size; }
  const rp=x=>map.get(x)||x; for(const p of doc.pages){ p.id=uuid(); if(p.bg.file) p.bg.file=rp(p.bg.file); if(p.bg.path) p.bg.path=rp(p.bg.path); for(const e of p.els){ e.id=uuid(); if(e.t==='im') e.path=rp(e.path); } } for(const r of doc.recs) r.path=rp(r.path); doc.rev=0;
  const it=create('nbook',{...m.data,title:(m.data.title||'')+' (copia)',created:new Date().toISOString(),updated:new Date().toISOString(),rev:0}); await writeDoc(it.id,doc); toast('Duplicada'); }
function popMenu(btn,items,cb){ $('.nbpop')?.remove(); const m=document.createElement('div'); m.className='shctx nbpop'; m.innerHTML=items.map(o=>o?`<button data-k="${esc(o[0])}" class="${o[2]?'bad':''}">${esc(o[1])}</button>`:'<hr>').join(''); document.body.appendChild(m);
  const rc=btn.getBoundingClientRect(); m.style.left=Math.max(8,Math.min(rc.left,innerWidth-m.offsetWidth-8))+'px'; m.style.top=(rc.bottom+m.offsetHeight>innerHeight-8?Math.max(8,rc.top-m.offsetHeight-4):rc.bottom+4)+'px';
  const close=()=>{ m.remove(); document.removeEventListener('pointerdown',out,true); }, out=e=>{ if(!m.contains(e.target)) close(); }; setTimeout(()=>document.addEventListener('pointerdown',out,true));
  m.onclick=e=>{ const b=e.target.closest('[data-k]'); if(!b) return; close(); cb(b.dataset.k); }; }

/* ---------- editor ---------- */
async function openNb(id,doc){ const m=meta(id); if(!m) return; NB.mode='ed'; NB.id=id; NB.doc=null; NB.undo=[]; NB.redo=[]; NB.sel=null; NB.cur=0; NB.zoom=1; NB.rendered.clear();
  const v=$('#view'); v.classList.add('nbv'); v.innerHTML='<div id="nbroot" class="nbr ed"><div class="nbload">Abriendo…</div></div>';
  try{ NB.doc=doc||await loadDoc(id); }catch(e){ NB.mode='lib'; renderLib(); if(e.message==='missing') return confirm2('No se encuentra el contenido','Esta libreta no se terminó de subir desde el dispositivo donde se creó. Ábrela allí con conexión para que se suba, o vuelve a importarla.',()=>{},'Entendido'); return toast('No se pudo abrir: '+(e.message||e)); } if(NB.id!==id||S.view!=='nb') return; buildEditor(); }
function closeNb(){ saveNow(); stopRec(); if(NB.au){ NB.au.el.pause(); NB.au=null; } const id=NB.id, doc=NB.doc; NB.mode='lib'; NB.doc=null; NB.sel=null; if(NB.io) NB.io.disconnect();
  if(id&&doc) thumbOf(doc.pages[0]).then(t=>{ if(t&&meta(id)) update(id,{thumb:t}); }); renderLib(); }
function toolBtn(t,i,title){ return `<button class="nbt ${NB.tool===t?'on':''}" data-tool="${t}" title="${title}">${ic(i)}</button>`; }
function buildEditor(){ const m=meta(NB.id), root=$('#nbroot'); if(!root) return; const mob=isMobile();
  root.className='nbr ed'+(mob?' mob':''); root.innerHTML=`
   <div class="nbtb">
     <button class="nbt" id="nb_back" title="Biblioteca">${ic('back')}</button><input class="nbtitle" id="nb_title" value="${esc(m.data.title||'')}" spellcheck="false">
     <span class="nbsp"></span>
     <div class="nbtools">${toolBtn('pen','pen','Bolígrafo (P)')}${toolBtn('hl','hl','Subrayador (H)')}${toolBtn('shape','shape','Formas (S)')}${toolBtn('er','er','Goma (E)')}${toolBtn('lasso','lasso','Lazo: seleccionar y mover (L)')}${toolBtn('text','text','Texto (T)')}${toolBtn('hand','hand','Mano: desplazar (espacio)')}
       <button class="nbt" id="nb_img" title="Insertar imagen o foto">${ic('img')}</button><input type="file" id="nb_imgf" accept="image/*" hidden></div>
     <span class="nbsp"></span>
     <button class="nbt" id="nb_undo" title="Deshacer (Ctrl+Z)">${ic('undo')}</button><button class="nbt" id="nb_redo" title="Rehacer (Ctrl+Y)">${ic('redo')}</button>
     <button class="nbt" id="nb_rec" title="Grabar audio">${ic('mic')}</button><button class="nbt" id="nb_au" title="Grabaciones">${ic('head')}</button>
     <button class="nbt" id="nb_pg" title="Páginas">${ic('pages')}</button><button class="nbt" id="nb_add" title="Añadir página detrás de la actual">${ic('plus')}</button>
     ${mob?'':`<button class="nbt" id="nb_zo" title="Alejar">${ic('zout')}</button><button class="nbt" id="nb_zi" title="Acercar">${ic('zin')}</button>`}
     <button class="nbt" id="nb_more" title="Más">${ic('more')}</button>
   </div>
   <div class="nbopts" id="nb_opts"></div>
   <div class="nbsc" id="nbsc"><div class="nbpages" id="nbpg"></div></div>
   <div class="nbaup" id="nb_aup" style="display:none"></div>
   <div class="nbselbar" id="nb_selbar" style="display:none"></div>`;
  bindEditor(); layout(true); renderOpts(); updUndo(); if(NB.auOpen) renderAudio(); }
function renderOpts(){ const el=$('#nb_opts'); if(!el) return; const t=NB.tool; let h='';
  if(t==='pen'||t==='shape'||t==='hl'||t==='text'){ const cols=t==='hl'?HLCOLORS:COLORS, cur=NB.col[t]||cols[0]; h+=cols.map(c=>`<button class="nbc ${c===cur?'on':''}" data-col="${c}" style="--c:${c}"></button>`).join('')+`<label class="nbc nbcp" title="Otro color" style="--c:${cols.includes(cur)?'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)':cur}"><input type="color" id="nb_cp" value="${cur.length===7?cur:'#000000'}"></label>`; }
  if(t==='pen'||t==='shape'||t==='hl'||t==='er'){ const W=WID[t]; h+='<span class="nbsep"></span>'+W.map((w,i)=>`<button class="nbw ${NB.wi[t]===i?'on':''}" data-wi="${i}" title="Grosor ${i+1}"><i style="width:${Math.min(22,4+i*6)}px;height:${Math.min(22,4+i*6)}px"></i></button>`).join(''); }
  if(t==='er') h+=`<span class="nbsep"></span><button class="nbtx ${NB.erMode==='stroke'?'on':''}" data-erm="stroke">Trazo entero</button><button class="nbtx ${NB.erMode==='part'?'on':''}" data-erm="part">Parcial</button>`;
  if(t==='pen') h+='<span class="nbhint">Mantén quieto al final para enderezar la forma</span>';
  if(t==='shape') h+='<span class="nbhint">Dibuja una línea, flecha, círculo, rectángulo o triángulo</span>';
  if(t==='lasso') h+='<span class="nbhint">Rodea lo que quieras mover, cambiar de color o borrar</span>'+(NB.clip?'<button class="nbtx" id="nb_paste">Pegar</button>':'');
  if(t==='text') h+=`<span class="nbsep"></span><select id="nb_fs" class="nbfs">${[10,12,14,16,20,24,32,40].map(n=>`<option ${n===(ls.get('mgg.nb.fs',16))?'selected':''}>${n}</option>`).join('')}</select><span class="nbhint">Toca la página para escribir</span>`;
  if(t==='hand') h+='<span class="nbhint">'+(NB.auOpen&&NB.doc&&NB.doc.recs.length?'Toca un trazo para oír lo que se grababa en ese momento':'Arrastra para moverte · con dos dedos también puedes hacer zoom')+'</span>';
  el.innerHTML=h; }
function updUndo(){ const u=$('#nb_undo'), r=$('#nb_redo'); if(u) u.disabled=!NB.undo.length; if(r) r.disabled=!NB.redo.length; }

/* ---------- maquetación de páginas ---------- */
function fitScale(){ const sc=$('#nbsc'); const W=(sc?sc.clientWidth:innerWidth)-(isMobile()?16:48); const mw=Math.max(...NB.doc.pages.map(p=>p.w)); return Math.min(W/mw,isMobile()?4:1.55); }
function layout(first){ const pg=$('#nbpg'); if(!pg||!NB.doc) return; NB.s=fitScale()*NB.zoom; const s=NB.s;
  const sig=NB.doc.pages.map(p=>p.id).join(',');
  if(!first&&NB.lsig===sig&&pg.children.length===NB.doc.pages.length+1){ NB.doc.pages.forEach((p,i)=>{ const d=pg.children[i]; d.style.width=Math.round(p.w*s)+'px'; d.style.height=Math.round(p.h*s)+'px'; d.querySelector('.nbpn').textContent=(i+1)+(p.mark?' ★':''); }); drawSelBox(); return; }
  NB.lsig=sig;
  const ex=new Map([...pg.children].filter(x=>x.dataset.pid).map(x=>[x.dataset.pid,x]));
  const frag=document.createDocumentFragment();
  NB.doc.pages.forEach((p,i)=>{ let d=ex.get(p.id); if(!d){ d=document.createElement('div'); d.className='nbp'; d.dataset.pid=p.id; d.innerHTML='<canvas class="bg"></canvas><canvas class="ink"></canvas><span class="nbpn"></span>'; } d.style.width=Math.round(p.w*s)+'px'; d.style.height=Math.round(p.h*s)+'px'; d.querySelector('.nbpn').textContent=(i+1)+(p.mark?' ★':''); frag.appendChild(d); ex.delete(p.id); });
  const addb=document.createElement('button'); addb.className='nbaddend'; addb.id='nb_addend'; addb.innerHTML=ic('plus')+' Añadir página'; frag.appendChild(addb);
  pg.innerHTML=''; pg.appendChild(frag);
  if(NB.io) NB.io.disconnect(); NB.io=new IntersectionObserver(es=>{ for(const e of es) e.target._vis=e.isIntersecting; paintVisible(); },{root:$('#nbsc'),rootMargin:'700px 0px'}); $$('.nbp',pg).forEach(d=>NB.io.observe(d));
  if(first){ $('#nbsc').scrollTop=0; } drawSelBox(); }
const pageEl=pid=>$(`#nbpg .nbp[data-pid="${pid}"]`);
const pageOf=pid=>NB.doc.pages.find(p=>p.id===pid);
function paintVisible(){ if(!NB.doc||gest) return; const dpr=Math.min(2.5,devicePixelRatio||1), key=NB.s.toFixed(4)+'@'+dpr; let painted=0;
  for(const d of $$('#nbpg .nbp')){ const pid=d.dataset.pid, p=pageOf(pid); if(!p) continue;
    if(!d._vis){ if(NB.rendered.has(pid)){ const t=NB.rendered.get(pid); if(t.tok) t.tok.dead=true; NB.rendered.delete(pid); for(const c of d.querySelectorAll('canvas')){ c.width=1; c.height=1; } } continue; }
    const r=NB.rendered.get(pid); if(r&&r.key===key){ if(r.inkDirty){ paintInk(d,p); r.inkDirty=false; } continue; }
    if(r&&r.tok) r.tok.dead=true; const tok={}; NB.rendered.set(pid,{key,tok}); const k=NB.s*dpr, W=Math.round(p.w*k), H=Math.round(p.h*k);
    const bg=d.querySelector('.bg'), ink=d.querySelector('.ink'); const tmp=document.createElement('canvas'); tmp.width=W; tmp.height=H;
    renderBg(tmp.getContext('2d'),p,k,W,H,tok).then(()=>{ if(tok.dead) return; bg.width=W; bg.height=H; bg.getContext('2d').drawImage(tmp,0,0); }).catch(e=>{ console.warn(e); if(tok.dead) return; bg.width=W; bg.height=H; const c=bg.getContext('2d'); c.fillStyle='#fff'; c.fillRect(0,0,W,H); c.fillStyle='#c00'; c.font=`${14*k}px sans-serif`; c.fillText('No se pudo mostrar esta página: '+String(e&&e.message||e).slice(0,80),20*k,40*k); if(!NB.errShown){ NB.errShown=1; toast('No se pudo mostrar el PDF: '+String(e&&e.message||e).slice(0,80)); } });
    ink.width=W; ink.height=H; paintInk(d,p); painted++; }
  curPage(); }
function paintInk(d,p,skip){ const ink=d.querySelector('.ink'); if(!ink||ink.width<2) return; const c=ink.getContext('2d'), k=ink.width/p.w; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,ink.width,ink.height); renderInk(c,p,k,{skip}); }
function inkDirty(pid){ const d=pageEl(pid), p=pageOf(pid); if(d&&p&&NB.rendered.has(pid)) paintInk(d,p,NB.sel&&NB.sel.pid===pid&&NB.sel.drag?new Set(NB.sel.ids):null); }
function curPage(){ const sc=$('#nbsc'); if(!sc) return; const mid=sc.getBoundingClientRect().top+sc.clientHeight/2; let best=0,bd=1e9; $$('#nbpg .nbp').forEach((d,i)=>{ const r=d.getBoundingClientRect(); const dd=r.top>mid?r.top-mid:r.bottom<mid?mid-r.bottom:0; if(dd<bd){ bd=dd; best=i; } }); NB.cur=best; }
function setZoom(z,cx,cy){ const sc=$('#nbsc'); if(!sc) return; z=Math.max(.5,Math.min(5,z)); const r=sc.getBoundingClientRect(); cx=cx??r.left+r.width/2; cy=cy??r.top+r.height/2;
  const ox=sc.scrollLeft+cx-r.left, oy=sc.scrollTop+cy-r.top, f=z/NB.zoom; NB.zoom=z; layout(); sc.scrollLeft=ox*f-(cx-r.left); sc.scrollTop=oy*f-(cy-r.top); paintVisible(); }

/* ---------- guardado y deshacer ---------- */
function snap(pid){ return JSON.stringify(pageOf(pid).els); }
function pushUndo(op){ NB.undo.push(op); if(NB.undo.length>80) NB.undo.shift(); NB.redo=[]; updUndo(); }
function commitEls(pid,before){ const after=snap(pid); if(after===before) return; pushUndo({t:'els',pid,b:before,a:after}); touched(pid); }
function commitPages(before){ pushUndo({t:'pages',b:before,a:JSON.stringify(NB.doc.pages)}); NB.rendered.clear(); layout(); paintVisible(); dirty(); }
function touched(pid){ inkDirty(pid); dirty(); }
function dirty(){ NB.dirty=true; clearTimeout(NB.saveT); NB.saveT=setTimeout(saveNow,1200); }
function saveNow(){ clearTimeout(NB.saveT); if(!NB.dirty||!NB.doc||!NB.id) return; NB.dirty=false; writeDoc(NB.id,NB.doc).catch(e=>console.warn(e)); }
function applyUndo(redo){ const A=redo?NB.redo:NB.undo, B=redo?NB.undo:NB.redo; const op=A.pop(); if(!op) return; B.push(op); NB.sel=null; drawSelBox();
  if(op.t==='els'){ const p=pageOf(op.pid); if(p){ p.els=JSON.parse(redo?op.a:op.b); touched(op.pid); } } else { NB.doc.pages=JSON.parse(redo?op.a:op.b); NB.rendered.clear(); layout(); paintVisible(); dirty(); } updUndo(); }

/* ---------- entrada: lápiz, dedos, ratón ---------- */
const ptrs=new Map(); let act=null, gest=null, spaceHand=false;
function pt(e,d,p){ const r=d.getBoundingClientRect(); return [(e.clientX-r.left)/NB.s,(e.clientY-r.top)/NB.s]; }
function liveCanvas(d){ let c=d.querySelector('.live'); const ink=d.querySelector('.ink'); if(!c){ c=document.createElement('canvas'); c.className='live'; d.appendChild(c); } if(c.width!==ink.width||c.height!==ink.height){ c.width=Math.max(2,ink.width); c.height=Math.max(2,ink.height); } return c; }
function clearLive(d){ const c=d&&d.querySelector('.live'); if(c) c.getContext('2d').clearRect(0,0,c.width,c.height); }
function bindEditor(){ const sc=$('#nbsc'), root=$('#nbroot');
  sc.addEventListener('scroll',()=>{ if(NB.scT) return; NB.scT=requestAnimationFrame(()=>{ NB.scT=0; curPage(); }); },{passive:true});
  sc.addEventListener('wheel',e=>{ if(e.ctrlKey||e.metaKey){ e.preventDefault(); setZoom(NB.zoom*Math.exp(-e.deltaY*.0025),e.clientX,e.clientY); } },{passive:false});
  sc.addEventListener('pointerdown',onDown); sc.addEventListener('pointermove',onMove); sc.addEventListener('pointerup',onUp); sc.addEventListener('pointercancel',onUp);
  sc.addEventListener('contextmenu',e=>{ if(e.target.closest('.nbp')) e.preventDefault(); });
  root.addEventListener('click',onClick); root.addEventListener('change',onChange); root.addEventListener('input',onInput);
  $('#nb_title').onchange=e=>{ const v=e.target.value.trim()||'Sin título'; update(NB.id,{title:v}); };
  $('#nb_title').onkeydown=e=>{ if(e.key==='Enter') e.target.blur(); }; }
function onDown(e){ const sc=$('#nbsc'); if(e.target.closest('.nbtxed,.nbsb,.nbaddend')) return; ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
  if(e.pointerType==='pen') NB.penSeen=true;
  const touches=[...ptrs.values()].filter(p=>p.type==='touch');
  if(e.pointerType==='touch'&&touches.length>=2){ if(act){ cancelAct(); } const [a,b]=touches; gest={d0:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2,z0:NB.zoom,sl:sc.scrollLeft,st:sc.scrollTop}; e.preventDefault(); return; }
  if(gest) return; try{ sc.setPointerCapture(e.pointerId); }catch(_){}
  const d=e.target.closest('.nbp'); let tool=NB.tool;
  if(spaceHand||e.button===1||(e.pointerType==='touch'&&NB.penSeen&&tool!=='hand')) tool='hand';
  if(tool==='hand'||!d){ act={t:'pan',id:e.pointerId,x:e.clientX,y:e.clientY,sl:sc.scrollLeft,st:sc.scrollTop,moved:false,d,e0:e}; return; }
  if(e.button===2) return; e.preventDefault();
  const pid=d.dataset.pid, p=pageOf(pid), [x,y]=pt(e,d,p);
  if(NB.sel&&NB.sel.pid===pid&&tool==='lasso'){ const h=selHit(x,y); if(h){ act={t:'seldrag',id:e.pointerId,mode:h,x0:x,y0:y,pid,d,b:snap(pid),orig:JSON.parse(JSON.stringify(selEls()))}; NB.sel.drag=true; inkDirty(pid); drawSelBox(); return; } }
  if(NB.sel){ NB.sel=null; drawSelBox(); }
  if(tool==='text') return textAt(d,p,x,y);
  if(!NB.rendered.has(pid)) paintVisible();
  const pr=e.pointerType==='pen'?(e.pressure||.5):.5;
  if(tool==='pen'||tool==='hl'||tool==='shape'){ const w=WID[tool][NB.wi[tool]||0], c=NB.col[tool]||'#000'; act={t:'draw',id:e.pointerId,tool,pid,d,p,pts:[x,y,pr],w,c,pen:e.pointerType==='pen',last:[x,y],still:Date.now(),live:liveCanvas(d)}; drawLive(); armHold(); return; }
  if(tool==='er'){ act={t:'er',id:e.pointerId,pid,d,p,b:snap(pid),r:WID.er[NB.wi.er||0]/2,changed:false,live:liveCanvas(d)}; eraseAt(x,y); return; }
  if(tool==='lasso'){ act={t:'lasso',id:e.pointerId,pid,d,p,pts:[x,y],live:liveCanvas(d)}; drawLasso(); return; } }
function coalesced(e){ try{ const l=e.getCoalescedEvents&&e.getCoalescedEvents(); if(l&&l.length) return l; }catch(_){} return [e]; }
function onMove(e){ const sc=$('#nbsc'); if(ptrs.has(e.pointerId)){ const q=ptrs.get(e.pointerId); q.x=e.clientX; q.y=e.clientY; }
  if(gest){ const T=[...ptrs.values()].filter(p=>p.type==='touch'); if(T.length<2) return; const [a,b]=T, dd=Math.hypot(a.x-b.x,a.y-b.y), mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    const z=Math.max(.5,Math.min(5,gest.z0*dd/gest.d0)); if(Math.abs(z-NB.zoom)>.02){ setZoom(z,mx,my); gest.sl=sc.scrollLeft; gest.st=sc.scrollTop; gest.mx=mx; gest.my=my; } else { sc.scrollLeft=gest.sl-(mx-gest.mx); sc.scrollTop=gest.st-(my-gest.my); } e.preventDefault(); return; }
  if(!act||act.id!==e.pointerId) return;
  if(act.t==='pan'){ const dx=e.clientX-act.x, dy=e.clientY-act.y; if(Math.abs(dx)+Math.abs(dy)>4) act.moved=true; sc.scrollLeft=act.sl-dx; sc.scrollTop=act.st-dy; return; }
  e.preventDefault();
  if(act.t==='draw'){ for(const ce of coalesced(e)){ const [x,y]=pt(ce,act.d,act.p); const l=act.last; if(Math.hypot(x-l[0],y-l[1])<.35/Math.max(.5,NB.s)) continue; act.pts.push(r1(x),r1(y),act.pen?Math.round((ce.pressure||.5)*100)/100:.5); act.last=[x,y]; if(Math.hypot(x-act.hx,y-act.hy)>3/NB.s){ armHold(); } } drawLive(); return; }
  if(act.t==='er'){ for(const ce of coalesced(e)){ const [x,y]=pt(ce,act.d,act.p); eraseAt(x,y); } return; }
  if(act.t==='lasso'){ const [x,y]=pt(e,act.d,act.p); act.pts.push(x,y); drawLasso(); return; }
  if(act.t==='seldrag'){ const [x,y]=pt(e,act.d,act.p); selTransform(x,y); } }
function onUp(e){ ptrs.delete(e.pointerId); if(gest){ if([...ptrs.values()].filter(p=>p.type==='touch').length<2){ gest=null; paintVisible(); } return; }
  if(!act||act.id!==e.pointerId) return; const a=act; act=null; clearTimeout(NB.holdT);
  if(a.t==='pan'){ if(!a.moved&&a.d&&NB.auOpen&&NB.au) seekFromTap(a.d,a.e0); return; }
  if(a.t==='draw') return finishStroke(a);
  if(a.t==='er'){ clearLive(a.d); if(a.changed) commitEls(a.pid,a.b); return; }
  if(a.t==='lasso'){ clearLive(a.d); return finishLasso(a); }
  if(a.t==='seldrag'){ NB.sel.drag=false; commitEls(a.pid,a.b); inkDirty(a.pid); drawSelBox(); } }
function cancelAct(){ if(!act) return; if(act.d) clearLive(act.d); if(act.t==='er'&&act.changed){ act.p.els=JSON.parse(act.b); inkDirty(act.pid); } if(act.t==='seldrag'){ act.p.els=JSON.parse(act.b); NB.sel.drag=false; inkDirty(act.pid); drawSelBox(); } act=null; clearTimeout(NB.holdT); }
function drawLive(){ const a=act, c=a.live.getContext('2d'), k=a.live.width/a.p.w; c.clearRect(0,0,a.live.width,a.live.height); drawStroke(c,{t:'s',k:a.tool==='hl'?'hl':'pen',pr:a.pen,c:a.c,w:a.w,p:a.pts},k); }
function armHold(){ if(!act||act.t!=='draw') return; clearTimeout(NB.holdT); act.hx=act.last[0]; act.hy=act.last[1]; if(act.tool==='hl'||act.tool==='shape') return;
  NB.holdT=setTimeout(()=>{ if(!act||act.t!=='draw') return; const r=recog(act.pts); if(r){ act.pts=r; act.snapped=true; act.pen=false; drawLive(); } },550); }
function finishStroke(a){ clearLive(a.d); let pts=a.pts; if(a.tool==='shape'&&!a.snapped){ const r=recog(pts); if(r) pts=r; }
  if(!a.snapped&&pts===a.pts) pts=simplify(pts,.25);
  const el={id:uuid(),t:'s',k:a.tool==='hl'?'hl':'pen',c:a.c,w:a.w,p:pts}; if(a.pen&&!a.snapped&&a.tool==='pen') el.pr=1;
  if(NB.rec&&NB.rec.mr&&NB.rec.mr.state==='recording'){ el.rec=NB.rec.id; el.tm=Math.round(performance.now()-NB.rec.t0-NB.rec.paused); }
  const b=snap(a.pid); a.p.els.push(el); commitEls(a.pid,b); }
function simplify(p,eps){ const n=p.length/3; if(n<4) return p; const keep=new Uint8Array(n); keep[0]=keep[n-1]=1; const st=[[0,n-1]];
  while(st.length){ const [i,j]=st.pop(); let md=0,mi=-1; const x1=p[i*3],y1=p[i*3+1],x2=p[j*3],y2=p[j*3+1], L=Math.hypot(x2-x1,y2-y1)||1e-9;
    for(let k=i+1;k<j;k++){ const d=Math.abs((x2-x1)*(y1-p[k*3+1])-(x1-p[k*3])*(y2-y1))/L; if(d>md){ md=d; mi=k; } } if(md>eps&&mi>0){ keep[mi]=1; st.push([i,mi],[mi,j]); } }
  const o=[]; for(let i=0;i<n;i++) if(keep[i]) o.push(p[i*3],p[i*3+1],p[i*3+2]); return o; }

/* ---------- reconocimiento de formas ---------- */
function recog(p){ const n=p.length/3; if(n<4) return null; const X=i=>p[i*3], Y=i=>p[i*3+1]; let L=0; for(let i=1;i<n;i++) L+=Math.hypot(X(i)-X(i-1),Y(i)-Y(i-1)); if(L<8) return null;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(let i=0;i<n;i++){ x0=Math.min(x0,X(i)); x1=Math.max(x1,X(i)); y0=Math.min(y0,Y(i)); y1=Math.max(y1,Y(i)); }
  const dse=Math.hypot(X(n-1)-X(0),Y(n-1)-Y(0)), diag=Math.hypot(x1-x0,y1-y0), P=a=>a.flatMap(([x,y])=>[r1(x),r1(y),.5]);
  if(dse>.3*L){ let md=0; const ax=X(0),ay=Y(0),bx=X(n-1),by=Y(n-1); for(let i=0;i<n;i++) md=Math.max(md,Math.abs((bx-ax)*(ay-Y(i))-(ax-X(i))*(by-ay))/(dse||1));
    if(md<.06*L+1.5){ let [sx,sy,ex,ey]=[ax,ay,bx,by]; const ang=Math.atan2(ey-sy,ex-sx), sn=Math.round(ang/(Math.PI/4))*(Math.PI/4); if(Math.abs(ang-sn)<.07){ const len=Math.hypot(ex-sx,ey-sy); ex=sx+Math.cos(sn)*len; ey=sy+Math.sin(sn)*len; } return P([[sx,sy],[ex,ey]]); }
    const sp=simplify(p,Math.max(3,.05*L)); if(sp.length/3===4){ const q=[[sp[0],sp[1]],[sp[3],sp[4]],[sp[6],sp[7]],[sp[9],sp[10]]]; const l1=Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1]); if(l1>.6*L){ const tip=q[1]; return P([q[0],tip,q[2],tip,q[3]]); } }
    return null; }
  const cx=(x0+x1)/2, cy=(y0+y1)/2, rx=(x1-x0)/2||1, ry=(y1-y0)/2||1; let err=0; for(let i=0;i<n;i++) err+=Math.abs(Math.hypot((X(i)-cx)/rx,(Y(i)-cy)/ry)-1); err/=n;
  let m=0,md=0; for(let i=0;i<n;i++){ const dd=Math.hypot(X(i)-X(0),Y(i)-Y(0)); if(dd>md){ md=dd; m=i; } } const eps=Math.max(3,.06*diag);
  const h1=simplify(p.slice(0,(m+1)*3),eps), h2=simplify(p.slice(m*3),eps); let v=[]; for(let i=0;i<h1.length;i+=3) v.push([h1[i],h1[i+1]]); for(let i=3;i<h2.length;i+=3) v.push([h2[i],h2[i+1]]);
  if(v.length>2&&Math.hypot(v[0][0]-v[v.length-1][0],v[0][1]-v[v.length-1][1])<.2*diag) v.pop();
  for(let i=0;i<v.length&&v.length>3;){ const a=v[i], b=v[(i+1)%v.length]; if(Math.hypot(a[0]-b[0],a[1]-b[1])<.12*diag) v.splice((i+1)%v.length,1); else i++; }
  if(v.length===4&&err>.06){ let axis=true; for(let i=0;i<4;i++){ const a=v[i], b=v[(i+1)%4], an=Math.abs(Math.atan2(b[1]-a[1],b[0]-a[0]))%(Math.PI/2); if(Math.min(an,Math.PI/2-an)>.3) axis=false; } return axis?P([[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]]):P([...v,v[0]]); }
  if(v.length===3&&err>.08) return P([...v,v[0]]);
  if(err<.16){ let a=rx,b=ry; if(Math.abs(rx-ry)/Math.max(rx,ry)<.18) a=b=(rx+ry)/2; const o=[]; for(let i=0;i<=48;i++){ const t=i/48*Math.PI*2; o.push([cx+a*Math.cos(t),cy+b*Math.sin(t)]); } return P(o); }
  if(v.length===4) return P([...v,v[0]]); return null; }

/* ---------- goma ---------- */
function segDist(px,py,ax,ay,bx,by){ const dx=bx-ax, dy=by-ay, l=dx*dx+dy*dy; let t=l?((px-ax)*dx+(py-ay)*dy)/l:0; t=Math.max(0,Math.min(1,t)); return Math.hypot(px-ax-t*dx,py-ay-t*dy); }
function hitEl(e,x,y,r){ if(e.t==='s'){ const p=e.p, rr=r+e.w/2; if(p.length===3) return Math.hypot(x-p[0],y-p[1])<=rr; for(let i=3;i<p.length;i+=3) if(segDist(x,y,p[i-3],p[i-2],p[i],p[i+1])<=rr) return true; return false; } const b=bboxOf(e); return x>=b[0]-r&&x<=b[2]+r&&y>=b[1]-r&&y<=b[3]+r; }
function eraseAt(x,y){ const a=act, els=a.p.els, r=a.r; let ch=false;
  if(NB.erMode==='stroke'){ const keep=els.filter(e=>!hitEl(e,x,y,r)); if(keep.length!==els.length){ a.p.els=keep; ch=true; } }
  else { const out=[]; for(const e of els){ if(e.t!=='s'){ if(hitEl(e,x,y,r)){ ch=true; continue; } out.push(e); continue; } if(!hitEl(e,x,y,r)){ out.push(e); continue; } ch=true; const p=e.p, rr=r+e.w/2; let seg=[];
      const flush=()=>{ if(seg.length>=6) out.push({...e,id:uuid(),p:seg}); seg=[]; };
      for(let i=0;i<p.length;i+=3){ if(Math.hypot(p[i]-x,p[i+1]-y)<=rr){ flush(); continue; } seg.push(p[i],p[i+1],p[i+2]); } flush(); } if(ch) a.p.els=out; }
  if(ch){ a.changed=true; inkDirty(a.pid); }
  const c=a.live.getContext('2d'), k=a.live.width/a.p.w; c.clearRect(0,0,a.live.width,a.live.height); c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=1; c.beginPath(); c.arc(x*k,y*k,r*k,0,7); c.stroke(); }

/* ---------- lazo y selección ---------- */
function drawLasso(){ const a=act, c=a.live.getContext('2d'), k=a.live.width/a.p.w; c.clearRect(0,0,a.live.width,a.live.height); c.setLineDash([6,5]); c.strokeStyle='#1f5fd1'; c.lineWidth=1.5; c.beginPath(); for(let i=0;i<a.pts.length;i+=2) (i?c.lineTo:c.moveTo).call(c,a.pts[i]*k,a.pts[i+1]*k); c.stroke(); c.setLineDash([]); }
function inPoly(x,y,P){ let ins=false; for(let i=0,j=P.length-2;i<P.length;j=i,i+=2){ const xi=P[i],yi=P[i+1],xj=P[j],yj=P[j+1]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi||1e-9)+xi)) ins=!ins; } return ins; }
function finishLasso(a){ const P=a.pts; if(P.length<6) return; const ids=[];
  for(const e of a.p.els){ if(e.t==='s'){ let n=0,t=0; for(let i=0;i<e.p.length;i+=3){ t++; if(inPoly(e.p[i],e.p[i+1],P)) n++; } if(t&&n/t>=.6) ids.push(e.id); } else { const b=bboxOf(e); if(inPoly((b[0]+b[2])/2,(b[1]+b[3])/2,P)) ids.push(e.id); } }
  if(!ids.length) return; NB.sel={pid:a.pid,ids}; drawSelBox(); }
const selEls=()=>{ if(!NB.sel) return []; const p=pageOf(NB.sel.pid); return p?p.els.filter(e=>NB.sel.ids.includes(e.id)):[]; };
function selBox(){ const L=selEls(); if(!L.length) return null; let b=[1e9,1e9,-1e9,-1e9]; for(const e of L){ const q=bboxOf(e); b=[Math.min(b[0],q[0]),Math.min(b[1],q[1]),Math.max(b[2],q[2]),Math.max(b[3],q[3])]; } return b; }
function drawSelBox(){ $$('.nbsb').forEach(x=>x.remove()); const bar=$('#nb_selbar'); if(!NB.sel){ if(bar) bar.style.display='none'; return; } const b=selBox(), d=pageEl(NB.sel.pid); if(!b||!d){ NB.sel=null; if(bar) bar.style.display='none'; return; } const s=NB.s;
  const el=document.createElement('div'); el.className='nbsb'; Object.assign(el.style,{left:b[0]*s-4+'px',top:b[1]*s-4+'px',width:(b[2]-b[0])*s+8+'px',height:(b[3]-b[1])*s+8+'px'}); el.innerHTML='<i class="nbh"></i>'; d.appendChild(el);
  if(NB.sel.drag){ const c=liveCanvas(d), k=c.width/pageOf(NB.sel.pid).w, cx=c.getContext('2d'); cx.clearRect(0,0,c.width,c.height); renderInk(cx,{els:selEls()},k); } else clearLive(d);
  if(bar){ bar.style.display='flex'; bar.innerHTML=COLORS.slice(0,6).map(c=>`<button class="nbc" data-scol="${c}" style="--c:${c}"></button>`).join('')+`<span class="nbsep"></span><button class="nbtx" data-sa="dup">Duplicar</button><button class="nbtx" data-sa="copy">Copiar</button><button class="nbtx" data-sa="cut">Cortar</button><button class="nbtx bad" data-sa="del">Borrar</button><button class="nbt" data-sa="x" title="Quitar selección">${ic('x')}</button>`; } }
function selHit(x,y){ const b=selBox(); if(!b) return null; const s=NB.s, hs=14/s; if(Math.abs(x-b[2])<hs&&Math.abs(y-b[3])<hs) return 'scale'; if(x>=b[0]-4/s&&x<=b[2]+4/s&&y>=b[1]-4/s&&y<=b[3]+4/s) return 'move'; return null; }
function selTransform(x,y){ const a=act, p=pageOf(a.pid), b0=(()=>{ let b=[1e9,1e9,-1e9,-1e9]; for(const e of a.orig){ const q=bboxOf(e); b=[Math.min(b[0],q[0]),Math.min(b[1],q[1]),Math.max(b[2],q[2]),Math.max(b[3],q[3])]; } return b; })();
  let f=1, dx=0, dy=0; if(a.mode==='move'){ dx=x-a.x0; dy=y-a.y0; } else { const w0=b0[2]-b0[0], h0=b0[3]-b0[1]; f=Math.max(.1,Math.max((x-b0[0])/(w0||1),(y-b0[1])/(h0||1))); }
  const map=new Map(a.orig.map(e=>[e.id,e])); p.els=p.els.map(e=>{ const o=map.get(e.id); if(!o) return e; return xform(o,f,b0[0],b0[1],dx,dy); }); drawSelBox(); }
function xform(o,f,ox,oy,dx,dy){ const T=(x,y)=>[r1(ox+(x-ox)*f+dx),r1(oy+(y-oy)*f+dy)]; const e={...o};
  if(o.t==='s'){ const q=[]; for(let i=0;i<o.p.length;i+=3){ const [x,y]=T(o.p[i],o.p[i+1]); q.push(x,y,o.p[i+2]); } e.p=q; e.w=r1(o.w*f)||o.w; }
  else if(o.t==='tx'){ [e.x,e.y]=T(o.x,o.y); e.fs=Math.max(4,r1(o.fs*f)); } else { [e.x,e.y]=T(o.x,o.y); e.w=r1(o.w*f); e.h=r1(o.h*f); } return e; }
function selAction(k){ if(!NB.sel) return; const pid=NB.sel.pid, p=pageOf(pid), b=snap(pid);
  if(k==='x'){ NB.sel=null; return drawSelBox(); }
  if(k==='copy'||k==='cut'){ NB.clip=JSON.parse(JSON.stringify(selEls())); toast(k==='cut'?'Cortado':'Copiado'); if(k==='copy') return renderOpts(); }
  if(k==='del'||k==='cut'){ p.els=p.els.filter(e=>!NB.sel.ids.includes(e.id)); NB.sel=null; drawSelBox(); renderOpts(); return commitEls(pid,b); }
  if(k==='dup'){ const cp=selEls().map(e=>({...xform(e,1,0,0,14,14),id:uuid()})); p.els.push(...cp); NB.sel={pid,ids:cp.map(e=>e.id)}; commitEls(pid,b); return drawSelBox(); } }
function paste(){ if(!NB.clip) return; const p=NB.doc.pages[NB.cur], b=snap(p.id); const cp=NB.clip.map(e=>({...xform(e,1,0,0,18,18),id:uuid()})); p.els.push(...cp); NB.clip=cp; NB.tool='lasso'; NB.sel={pid:p.id,ids:cp.map(e=>e.id)}; commitEls(p.id,b); setTool('lasso'); drawSelBox(); }
function recolor(c){ if(!NB.sel) return; const pid=NB.sel.pid, p=pageOf(pid), b=snap(pid); p.els=p.els.map(e=>NB.sel.ids.includes(e.id)&&e.t!=='im'?{...e,c}:e); commitEls(pid,b); drawSelBox(); }

/* ---------- texto ---------- */
function textAt(d,p,x,y){ const hit=[...p.els].reverse().find(e=>e.t==='tx'&&hitEl(e,x,y,2)); const fs=hit?hit.fs:ls.get('mgg.nb.fs',16), col=hit?hit.c:(NB.col.text||'#1d1d1f'), s=NB.s;
  $('.nbtxed')?.blur(); const ta=document.createElement('textarea'); ta.className='nbtxed'; ta.value=hit?hit.txt:''; ta.spellcheck=true;
  const X=hit?hit.x:x, Y=hit?hit.y:y-fs*.6; Object.assign(ta.style,{left:X*s+'px',top:Y*s+'px',font:txFont(fs,s),color:col,lineHeight:'1.25'}); d.appendChild(ta);
  if(hit){ p.els=p.els.filter(e=>e!==hit); inkDirty(p.id); }
  const fit=()=>{ ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px'; ta.style.width='auto'; _mx.font=txFont(fs,s); ta.style.width=Math.max(80,Math.min(d.clientWidth-X*s-6,...ta.value.split('\n').map(l=>_mx.measureText(l).width+24)))+'px'; }; fit(); ta.oninput=fit;
  const before=hit?JSON.stringify([...p.els,hit]):snap(p.id);
  ta.onblur=()=>{ const t=ta.value.replace(/\s+$/,''); ta.remove(); if(t) p.els.push({id:hit?hit.id:uuid(),t:'tx',x:r1(X),y:r1(Y),txt:t,fs,c:col}); const after=snap(p.id); if(after!==before){ pushUndo({t:'els',pid:p.id,b:before,a:after}); touched(p.id); } else inkDirty(p.id); };
  ta.onkeydown=e=>{ if(e.key==='Escape'||(e.key==='Enter'&&(e.ctrlKey||e.metaKey))){ e.preventDefault(); ta.blur(); } e.stopPropagation(); };
  setTimeout(()=>{ ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length); },20); }

/* ---------- imágenes ---------- */
async function insertImage(f){ if(!f) return; const b=await shrinkImage(f); const bm=await createImageBitmap(b); const path=newFile(b.type.includes('png')?'png':'jpg'); await putFile(path,b); (NB.doc.sizes ||= {})[path]=b.size;
  const p=NB.doc.pages[NB.cur]||NB.doc.pages[0], w=Math.min(p.w*.6,bm.width), h=w*bm.height/bm.width; const sc=$('#nbsc'), d=pageEl(p.id), r=d.getBoundingClientRect(), sr=sc.getBoundingClientRect();
  const cy=Math.max(10,Math.min(p.h-h-10,((sr.top+sr.height/2)-r.top)/NB.s-h/2)); const el={id:uuid(),t:'im',path,x:r1((p.w-w)/2),y:r1(cy),w:r1(w),h:r1(h)};
  const bf=snap(p.id); p.els.push(el); commitEls(p.id,bf); setTool('lasso'); NB.sel={pid:p.id,ids:[el.id]}; drawSelBox(); }

/* ---------- páginas ---------- */
function addPage(after,tpl){ const before=JSON.stringify(NB.doc.pages); const ref=NB.doc.pages[after]||NB.doc.pages[NB.doc.pages.length-1]; let bg={t:'tpl',tpl:tpl||'blank',paper:'w'};
  if(ref&&ref.bg.t==='tpl'&&!tpl) bg={...ref.bg}; const w=ref?.bg.t==='tpl'?ref.w:A4[0], h=ref?.bg.t==='tpl'?ref.h:A4[1];
  NB.doc.pages.splice(after+1,0,{id:uuid(),w,h,bg,els:[]}); commitPages(before); setTimeout(()=>scrollToPage(after+1),30); }
function scrollToPage(i){ const d=$$('#nbpg .nbp')[i]; if(d) $('#nbsc').scrollTop=d.offsetTop-12; }
function pagesPanel(){ const P=NB.doc.pages; let only=false;
  const draw=()=>{ const L=$('#pp_l'); if(!L) return; L.innerHTML=P.map((p,i)=>only&&!p.mark?'':`<div class="ppi ${i===NB.cur?'on':''}" data-pi="${i}"><canvas data-th="${i}" width="90" height="${Math.round(90*p.h/p.w)}"></canvas><div class="ppa"><b>${i+1}</b>
      <button class="nbt sm ${p.mark?'on':''}" data-pa="mark" title="Marcador">${ic('star')}</button><button class="nbt sm" data-pa="up" title="Subir" ${i?'':'disabled'}>↑</button><button class="nbt sm" data-pa="down" title="Bajar" ${i<P.length-1?'':'disabled'}>↓</button><button class="nbt sm" data-pa="dup" title="Duplicar">${ic('copy')}</button><button class="nbt sm" data-pa="del" title="Eliminar" ${P.length>1?'':'disabled'}>${ic('trash')}</button></div></div>`).join('');
    $$('[data-th]',L).forEach(async cv=>{ const p=P[+cv.dataset.th]; const c=cv.getContext('2d'), k=90/p.w; try{ await renderBg(c,p,k,cv.width,cv.height); const imgs=new Map(); for(const e of p.els) if(e.t==='im'){ const im=await imgReady(e.path); if(im) imgs.set(e.path,im); } renderInk(c,p,k,{imgs}); }catch(e){} }); };
  modal(`<div class="acts top"><h2 style="margin:0;flex:1">Páginas</h2><button class="btn" data-close>Cerrar</button></div>
   <div class="row wrap" style="gap:8px;margin:8px 0 12px"><select class="inp" id="pp_tpl" style="width:auto">${Object.entries(TPL).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><button class="btn sm" id="pp_add">Añadir al final</button>
     <label class="btn ghost sm" style="cursor:pointer">Añadir PDF o imagen<input type="file" id="pp_file" accept="application/pdf,image/*" multiple hidden></label><label class="row" style="font-size:12px;gap:5px"><input type="checkbox" id="pp_only"> Solo marcadas</label></div>
   <div class="ppl" id="pp_l"></div>`,'wide'); draw();
  $('#pp_only').onchange=e=>{ only=e.target.checked; draw(); };
  $('#pp_add').onclick=()=>{ addPage(P.length-1,$('#pp_tpl').value); NB.doc.pages[NB.doc.pages.length-1].bg.paper=(P[0]&&P[0].bg.paper)||'w'; closeModal(); };
  $('#pp_file').onchange=async e=>{ const fs=[...e.target.files]; closeModal(); await appendFiles(fs); };
  $('#pp_l').onclick=e=>{ const it=e.target.closest('[data-pi]'); if(!it) return; const i=+it.dataset.pi, a=e.target.closest('[data-pa]'); const before=JSON.stringify(NB.doc.pages);
    if(!a){ closeModal(); return setTimeout(()=>scrollToPage(i),30); } const k=a.dataset.pa, Q=NB.doc.pages;
    if(k==='mark') Q[i].mark=!Q[i].mark; else if(k==='up'&&i>0) [Q[i-1],Q[i]]=[Q[i],Q[i-1]]; else if(k==='down'&&i<Q.length-1) [Q[i+1],Q[i]]=[Q[i],Q[i+1]];
    else if(k==='dup'){ const c=JSON.parse(JSON.stringify(Q[i])); c.id=uuid(); c.els.forEach(e=>e.id=uuid()); Q.splice(i+1,0,c); } else if(k==='del'&&Q.length>1) Q.splice(i,1); else return;
    commitPages(before); draw(); }; }
async function appendFiles(files){ const before=JSON.stringify(NB.doc.pages); NB.doc.sizes ||= {}; const at=NB.doc.pages.length;
  try{ for(const f of files){ if(f.type==='application/pdf'||/\.pdf$/i.test(f.name)){ const lib=await needPdf(); const bytes=new Uint8Array(await f.arrayBuffer()); const d=await lib.getDocument({data:bytes.slice(),standardFontDataUrl:LIB.fonts,cMapUrl:LIB.cmaps,cMapPacked:true,isEvalSupported:false}).promise; const file=newFile('pdf'); await putFile(file,new Blob([bytes],{type:'application/pdf'})); NB.doc.sizes[file]=bytes.length; NB.pdfs.set(file,Promise.resolve(d));
        for(let i=0;i<d.numPages;i++){ const vp=(await d.getPage(i+1)).getViewport({scale:1}); NB.doc.pages.push({id:uuid(),w:r1(vp.width),h:r1(vp.height),bg:{t:'pdf',file,n:i},els:[]}); } }
      else if(f.type.startsWith('image/')){ const b=await shrinkImage(f); const bm=await createImageBitmap(b); const path=newFile(b.type.includes('png')?'png':'jpg'); await putFile(path,b); NB.doc.sizes[path]=b.size; NB.doc.pages.push({id:uuid(),w:595,h:r1(595*bm.height/bm.width),bg:{t:'img',path},els:[]}); } }
    commitPages(before); setTimeout(()=>scrollToPage(at),50); }catch(e){ console.error(e); toast('No se pudo añadir: '+(e.message||e)); } }

/* ---------- audio ---------- */
async function toggleRec(){ if(NB.rec) return stopRec(); if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder) return toast('Este navegador no permite grabar audio');
  let stream; try{ stream=await navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ return toast('Sin permiso de micrófono'); }
  const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
  const mr=new MediaRecorder(stream,mime?{mimeType:mime,audioBitsPerSecond:48000}:{}); const chunks=[]; mr.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
  const id=uuid(); NB.rec={id,mr,stream,t0:performance.now(),paused:0,chunks,nb:NB.id};
  mr.onstop=async()=>{ stream.getTracks().forEach(t=>t.stop()); const r=NB.rec&&NB.rec.id===id?NB.rec:null; const dur=(performance.now()-(r?r.t0:performance.now()))/1000; const blob=new Blob(chunks,{type:mr.mimeType||mime||'audio/webm'});
    const doc=NB.id===(r?r.nb:null)?NB.doc:null; NB.rec=null; recUI(); if(!blob.size) return; const ext=blob.type.includes('mp4')?'m4a':blob.type.includes('ogg')?'ogg':'webm'; const path=newFile(ext); await putFile(path,blob);
    const target=doc||await loadDoc(r.nb); target.recs.push({id,path,dur:Math.round(dur),created:new Date().toISOString(),size:blob.size,name:'Grabación '+(target.recs.length+1)}); (target.sizes ||= {})[path]=blob.size;
    if(doc){ dirty(); saveNow(); if(NB.auOpen) renderAudio(); } else await writeDoc(r.nb,target); toast('Grabación guardada'); };
  mr.start(1000); recUI(); NB.recTick=setInterval(recUI,500); toast('Grabando · lo que escribas quedará sincronizado con el audio'); }
function stopRec(){ if(!NB.rec) return; clearInterval(NB.recTick); try{ NB.rec.mr.stop(); }catch(e){} }
function recUI(){ const b=$('#nb_rec'); if(!b) return; if(NB.rec){ b.classList.add('rec'); b.innerHTML=ic('mic')+`<span>${fmtT((performance.now()-NB.rec.t0)/1000)}</span>`; } else { clearInterval(NB.recTick); b.classList.remove('rec'); b.innerHTML=ic('mic'); } }
function renderAudio(){ const el=$('#nb_aup'); if(!el) return; if(!NB.auOpen){ el.style.display='none'; return; } el.style.display='';
  const R=NB.doc.recs; const cur=NB.au&&NB.au.rec; const a=NB.au&&NB.au.el;
  el.innerHTML=R.length?`<div class="aur">${R.map(r=>`<button class="nbchip ${cur===r.id?'on':''}" data-aur="${r.id}">${esc(r.name||'Grabación')} · ${fmtT(r.dur||0)}</button>`).join('')}</div>
    ${cur?`<div class="aup"><button class="nbt" id="au_pp">${ic(a&&!a.paused?'pause':'play')}</button><span id="au_t">${fmtT(a?a.currentTime:0)}</span><input type="range" id="au_s" min="0" max="1000" value="0"><span>${fmtT((R.find(r=>r.id===cur)||{}).dur||0)}</span>
      <select id="au_sp" class="nbfs"><option value="1">1×</option><option value="1.5">1,5×</option><option value="2">2×</option><option value=".75">0,75×</option></select><button class="nbtx" id="au_ren">Renombrar</button><button class="nbtx bad" id="au_del">Borrar</button></div>`:'<p class="mut" style="margin:6px 0 0;font-size:12px">Elige una grabación. Mientras suena, lo escrito después se ve atenuado; con la mano (✋) toca un trazo para saltar a ese momento.</p>'}`
    :'<p class="mut" style="margin:0;font-size:12px">Aún no hay grabaciones. Pulsa el micrófono para grabar mientras escribes o dibujas.</p>';
  if(a&&$('#au_sp')) $('#au_sp').value=String(a.playbackRate); auTick(); renderOpts(); }
async function playRec(id,at){ const r=NB.doc.recs.find(x=>x.id===id); if(!r) return; if(!NB.au||NB.au.rec!==id){ if(NB.au) NB.au.el.pause(); const b=await getBlob(r.path); if(!b) return toast('No se encuentra el audio'); const el=new Audio(URL.createObjectURL(b)); el.preload='auto';
    NB.au={rec:id,el}; el.ontimeupdate=()=>{ auTick(); fadeTick(); }; el.onplay=el.onpause=el.onended=()=>{ renderAudio(); repaintAll(); }; }
  if(at!=null){ NB.au.el.currentTime=Math.max(0,at); } renderAudio(); }
function auTick(){ const a=NB.au&&NB.au.el, s=$('#au_s'), t=$('#au_t'); if(!a||!s) return; const r=NB.doc.recs.find(x=>x.id===NB.au.rec); const dur=a.duration&&isFinite(a.duration)?a.duration:(r&&r.dur)||1; if(!NB.au.drag) s.value=Math.round(a.currentTime/dur*1000); t.textContent=fmtT(a.currentTime); }
let fadeT=0; function fadeTick(){ const n=performance.now(); if(n-fadeT<200) return; fadeT=n; repaintAll(); }
function repaintAll(){ for(const p of NB.doc.pages) if(p.els.some(e=>e.rec)) inkDirty(p.id); }
function seekFromTap(d,e){ const p=pageOf(d.dataset.pid), [x,y]=pt(e,d,p); const hit=[...p.els].reverse().find(el=>el.rec&&hitEl(el,x,y,6)); if(!hit) return; playRec(hit.rec,Math.max(0,hit.tm/1000-1)).then(()=>NB.au&&NB.au.el.play()); }

/* ---------- exportar ---------- */
async function compositePage(p,k,withBg){ const W=Math.round(p.w*k), H=Math.round(p.h*k); const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); if(withBg) await renderBg(c,p,k,W,H);
  const imgs=new Map(); for(const e of p.els) if(e.t==='im'){ const im=await imgReady(e.path); if(im) imgs.set(e.path,im); } const keep=NB.au; NB.au=null; renderInk(c,p,k,{imgs}); NB.au=keep; return cv; }
function saveBlob(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
const fname=t=>String(t||'Notas').replace(/[\\/:*?"<>|]+/g,'_').trim()||'Notas';
const canvasBytes=(cv,type,q)=>new Promise(r=>cv.toBlob(b=>b.arrayBuffer().then(x=>r(new Uint8Array(x))),type,q));
async function exportPDF(doc,title){ toast('Preparando PDF…'); try{ await loadScript(LIB.pdflib[0],LIB.pdflib[1]); const {PDFDocument,rgb}=PDFLib; const out=await PDFDocument.create(); const srcs=new Map();
    for(const p of doc.pages){ const hasInk=p.els.length>0;
      if(p.bg.t==='pdf'){ let src=srcs.get(p.bg.file); if(!src){ const b=await getBlob(p.bg.file); src=await PDFDocument.load(new Uint8Array(await b.arrayBuffer()),{ignoreEncryption:true}); srcs.set(p.bg.file,src); }
        const [cp]=await out.copyPages(src,[p.bg.n]); const rot=((cp.getRotation().angle%360)+360)%360;
        if(rot===0){ out.addPage(cp); if(hasInk){ const cb=cp.getCropBox(); const png=await out.embedPng(await canvasBytes(await compositePage(p,2.5,false),'image/png')); cp.drawImage(png,{x:cb.x,y:cb.y,width:cb.width,height:cb.height}); } continue; }
        const pg=out.addPage([p.w,p.h]); const jpg=await out.embedJpg(await canvasBytes(await compositePage(p,2.5,true),'image/jpeg',.9)); pg.drawImage(jpg,{x:0,y:0,width:p.w,height:p.h}); continue; }
      const pg=out.addPage([p.w,p.h]);
      if(p.bg.t==='img'){ const b=await getBlob(p.bg.path); const by=new Uint8Array(await b.arrayBuffer()); const im=b.type.includes('png')?await out.embedPng(by):await out.embedJpg(by); pg.drawImage(im,{x:0,y:0,width:p.w,height:p.h}); }
      else { const hex=PAPER[p.bg.paper||'w']; if(hex!=='#ffffff'){ const n=parseInt(hex.slice(1),16); pg.drawRectangle({x:0,y:0,width:p.w,height:p.h,color:rgb((n>>16)/255,((n>>8)&255)/255,(n&255)/255)}); }
        if(p.bg.tpl&&p.bg.tpl!=='blank'){ const tcv=document.createElement('canvas'); const k=2; tcv.width=Math.round(p.w*k); tcv.height=Math.round(p.h*k); const tc=tcv.getContext('2d'); drawTpl(tc,{...p,bg:{...p.bg,paper:'w'}},k,tcv.width,tcv.height);
          const id=tc.getImageData(0,0,tcv.width,tcv.height); for(let i=0;i<id.data.length;i+=4){ if(id.data[i]>250&&id.data[i+1]>250&&id.data[i+2]>250) id.data[i+3]=0; } tc.putImageData(id,0,0); const png=await out.embedPng(await canvasBytes(tcv,'image/png')); pg.drawImage(png,{x:0,y:0,width:p.w,height:p.h}); } }
      if(hasInk){ const png=await out.embedPng(await canvasBytes(await compositePage(p,2.5,false),'image/png')); pg.drawImage(png,{x:0,y:0,width:p.w,height:p.h}); } }
    const bytes=await out.save(); saveBlob(new Blob([bytes],{type:'application/pdf'}),fname(title)+'.pdf'); toast('PDF listo'); }catch(e){ console.error(e); toast('No se pudo exportar: '+(e.message||e)); } }
async function exportPPTX(doc,title){ toast('Preparando PowerPoint…'); try{ await loadScript(LIB.pptx[0],LIB.pptx[1]); const P=new PptxGenJS(); const p0=doc.pages[0]; const LW=p0.w/72, LH=p0.h/72; P.defineLayout({name:'NB',width:LW,height:LH}); P.layout='NB'; P.title=title||'Notas';
    for(const p of doc.pages){ const cv=await compositePage(p,2,true); const data=cv.toDataURL('image/jpeg',.9); const f=Math.min(LW/(p.w/72),LH/(p.h/72)), w=p.w/72*f, h=p.h/72*f; const sl=P.addSlide(); sl.background={color:'FFFFFF'}; sl.addImage({data,x:(LW-w)/2,y:(LH-h)/2,w,h}); }
    const blob=await P.write({outputType:'blob'}); saveBlob(blob,fname(title)+'.pptx'); toast('PowerPoint listo'); }catch(e){ console.error(e); toast('No se pudo exportar: '+(e.message||e)); } }

/* ---------- acciones de la barra ---------- */
function setTool(t){ NB.tool=t; ls.set('mgg.nb.tool',t); $$('[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t)); if(t!=='lasso'&&NB.sel){ NB.sel=null; drawSelBox(); } $('#nbsc')?.setAttribute('data-tool',t); renderOpts(); }
function onClick(e){ const t=e.target.closest('[data-tool]'); if(t) return setTool(t.dataset.tool);
  const c=e.target.closest('[data-col]'); if(c){ NB.col[NB.tool]=c.dataset.col; ls.set('mgg.nb.col',NB.col); return renderOpts(); }
  const w=e.target.closest('[data-wi]'); if(w){ NB.wi[NB.tool]=+w.dataset.wi; ls.set('mgg.nb.wi',NB.wi); return renderOpts(); }
  const em=e.target.closest('[data-erm]'); if(em){ NB.erMode=em.dataset.erm; ls.set('mgg.nb.erm',NB.erMode); return renderOpts(); }
  const sc=e.target.closest('[data-scol]'); if(sc) return recolor(sc.dataset.scol);
  const sa=e.target.closest('[data-sa]'); if(sa) return selAction(sa.dataset.sa);
  const ar=e.target.closest('[data-aur]'); if(ar) return playRec(ar.dataset.aur);
  const id=(e.target.closest('button')||{}).id;
  if(id==='nb_back') return closeNb(); if(id==='nb_undo') return applyUndo(false); if(id==='nb_redo') return applyUndo(true);
  if(id==='nb_img') return $('#nb_imgf').click(); if(id==='nb_pg') return pagesPanel(); if(id==='nb_add'||id==='nb_addend') return addPage(id==='nb_addend'?NB.doc.pages.length-1:NB.cur);
  if(id==='nb_zi') return setZoom(NB.zoom*1.2); if(id==='nb_zo') return setZoom(NB.zoom/1.2); if(id==='nb_paste') return paste();
  if(id==='nb_rec') return toggleRec(); if(id==='nb_au'){ NB.auOpen=!NB.auOpen; $('#nb_au').classList.toggle('on',NB.auOpen); if(!NB.auOpen&&NB.au){ NB.au.el.pause(); NB.au=null; repaintAll(); } return renderAudio(); }
  if(id==='au_pp'){ const a=NB.au&&NB.au.el; if(a){ a.paused?a.play():a.pause(); } return; }
  if(id==='au_del'){ const r=NB.doc.recs.find(x=>x.id===NB.au.rec); return confirm2('Borrar grabación',r.name||'',()=>{ NB.au.el.pause(); NB.au=null; NB.doc.recs=NB.doc.recs.filter(x=>x!==r); for(const p of NB.doc.pages) for(const el of p.els) if(el.rec===r.id){ delete el.rec; delete el.tm; } rmFiles([r.path]); dirty(); renderAudio(); repaintAll(); }); }
  if(id==='au_ren'){ const r=NB.doc.recs.find(x=>x.id===NB.au.rec); return prompt2('Renombrar grabación','Nombre',v=>{ v=v.trim(); if(v){ r.name=v; dirty(); renderAudio(); } },r.name||''); }
  if(id==='nb_more') return popMenu(e.target.closest('button'),[['pdf','Exportar a PDF'],['pptx','Exportar a PowerPoint'],['pdf1','Exportar esta página a PDF'],null,['ren','Renombrar'],['fav',meta(NB.id)?.data.fav?'Quitar de favoritas':'Añadir a favoritas'],['fit','Ajustar al ancho']],k=>{
    const m=meta(NB.id); saveNow(); if(k==='pdf') return exportPDF(NB.doc,m.data.title); if(k==='pptx') return exportPPTX(NB.doc,m.data.title); if(k==='pdf1') return exportPDF({...NB.doc,pages:[NB.doc.pages[NB.cur]]},m.data.title+' - p'+(NB.cur+1));
    if(k==='ren') return prompt2('Renombrar','Título',v=>{ v=v.trim(); if(v){ update(NB.id,{title:v}); $('#nb_title').value=v; } },m.data.title||''); if(k==='fav') return update(NB.id,{fav:!m.data.fav}); if(k==='fit'){ NB.zoom=1; layout(); paintVisible(); } }); }
function onChange(e){ if(e.target.id==='nb_imgf'){ insertImage(e.target.files[0]); e.target.value=''; } if(e.target.id==='nb_cp'){ NB.col[NB.tool]=e.target.value; ls.set('mgg.nb.col',NB.col); renderOpts(); if(NB.sel) recolor(e.target.value); }
  if(e.target.id==='nb_fs') ls.set('mgg.nb.fs',+e.target.value); if(e.target.id==='au_sp'&&NB.au) NB.au.el.playbackRate=+e.target.value; }
function onInput(e){ if(e.target.id==='au_s'&&NB.au){ const a=NB.au.el, r=NB.doc.recs.find(x=>x.id===NB.au.rec); const dur=a.duration&&isFinite(a.duration)?a.duration:(r&&r.dur)||1; a.currentTime=e.target.value/1000*dur; NB.au.scrub=true; repaintAll(); NB.au.scrub=false; } }
document.addEventListener('keydown',e=>{ if(S.view!=='nb'||NB.mode!=='ed'||S.modal) return; const tg=e.target; if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.tagName==='SELECT')) return; const k=e.key.toLowerCase(), ctrl=e.ctrlKey||e.metaKey;
  if(ctrl&&k==='z'){ e.preventDefault(); return applyUndo(e.shiftKey); } if(ctrl&&k==='y'){ e.preventDefault(); return applyUndo(true); }
  if(ctrl&&k==='c'&&NB.sel){ e.preventDefault(); return selAction('copy'); } if(ctrl&&k==='x'&&NB.sel){ e.preventDefault(); return selAction('cut'); } if(ctrl&&k==='v'&&NB.clip){ e.preventDefault(); return paste(); } if(ctrl&&k==='d'&&NB.sel){ e.preventDefault(); return selAction('dup'); }
  if((k==='delete'||k==='backspace')&&NB.sel){ e.preventDefault(); return selAction('del'); } if(k==='escape'){ if(NB.sel){ NB.sel=null; drawSelBox(); } return; }
  if(ctrl&&(k==='+'||k==='=')){ e.preventDefault(); return setZoom(NB.zoom*1.2); } if(ctrl&&k==='-'){ e.preventDefault(); return setZoom(NB.zoom/1.2); } if(ctrl&&k==='0'){ e.preventDefault(); NB.zoom=1; layout(); return paintVisible(); }
  if(ctrl||e.altKey) return; const map={p:'pen',h:'hl',s:'shape',e:'er',l:'lasso',t:'text'}; if(map[k]){ e.preventDefault(); return setTool(map[k]); }
  if(k===' '&&!spaceHand){ spaceHand=true; $('#nbsc')?.setAttribute('data-tool','hand'); e.preventDefault(); } });
document.addEventListener('keyup',e=>{ if(e.key===' '&&spaceHand){ spaceHand=false; $('#nbsc')?.setAttribute('data-tool',NB.tool); } });
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') saveNow(); });
addEventListener('pagehide',saveNow);
let rsT; addEventListener('resize',()=>{ if(S.view!=='nb'||NB.mode!=='ed') return; clearTimeout(rsT); rsT=setTimeout(()=>{ layout(); paintVisible(); },150); });

/* ---------- estilos ---------- */
const css=document.createElement('style'); css.textContent=`
#view.nbv{padding-bottom:0}
.nbr.lib{padding:4px 2px 30px;flex:1;min-height:0;overflow:auto}
.nblh{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px} .nblh h2{margin:0 8px 0 0;font-size:20px;letter-spacing:.02em} .nblh #nb_q{max-width:260px} .nblh #nb_sort{width:auto} .nbnew{display:flex;gap:8px;margin-left:auto}
.nbi{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
.btn .nbi{width:15px;height:15px;margin-right:4px;vertical-align:-3px}
.nbchips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px} .nbchip{padding:5px 12px;border-radius:999px;border:1px solid var(--line2);font-size:12px;background:var(--surface,#fff);color:var(--ink);cursor:pointer;white-space:nowrap} .nbchip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)} .nbchip.add{border-style:dashed;color:var(--mut)}
.nbgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:18px}
.nbcard{position:relative;cursor:pointer;border-radius:10px;padding:8px;transition:background .15s} .nbcard:hover{background:var(--hover,rgba(0,0,0,.04))}
.nbcov{aspect-ratio:3/4;border-radius:6px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.14),0 6px 18px rgba(0,0,0,.06);overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative} .nbcov img{width:100%;height:100%;object-fit:cover;object-position:top} .nbcov span{color:var(--mut);font-size:11px}
.nbfav{position:absolute;top:6px;right:7px;color:#f2b400;font-style:normal;font-size:15px;text-shadow:0 1px 2px rgba(0,0,0,.2)}
.nbct{margin-top:8px;display:flex;flex-direction:column;gap:2px;padding-right:22px} .nbct b{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} .nbct span{font-size:11px;color:var(--mut)}
.nbmore{position:absolute;right:4px;bottom:10px;border:0;background:none;color:var(--mut);cursor:pointer;padding:4px;border-radius:6px} .nbmore:hover{background:var(--hover,rgba(0,0,0,.06));color:var(--ink)}
.nbempty{grid-column:1/-1;padding:40px 0;text-align:center}
.nbuse{margin-top:28px;font-size:12px;color:var(--mut);display:flex;flex-direction:column;gap:6px;max-width:520px} .nbbar2{height:6px;border-radius:3px;background:var(--line);overflow:hidden} .nbbar2 i{display:block;height:100%;background:var(--ink)}
.nbtpl{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px} .nbtpl button{display:flex;flex-direction:column;align-items:center;gap:4px;border:2px solid transparent;border-radius:8px;padding:5px;background:none;cursor:pointer;font-size:11px;color:var(--ink)} .nbtpl button.on{border-color:var(--ink)} .nbtpl canvas{box-shadow:0 0 0 1px var(--line2);border-radius:3px}
.nbr.ed{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;background:var(--bg)}
.nbr.ed.mob{position:fixed;inset:0;z-index:40;padding-top:env(safe-area-inset-top)}
.nbtb{display:flex;align-items:center;gap:2px;padding:6px 6px;border-bottom:1px solid var(--line);background:var(--surface,#fff);overflow-x:auto;scrollbar-width:none;flex:none} .nbtb::-webkit-scrollbar{display:none}
.nbtitle{border:0;background:none;font:600 14px var(--font);color:var(--ink);min-width:80px;width:16ch;padding:6px 6px;border-radius:6px} .nbtitle:focus{outline:1px solid var(--line2)}
.nbsp{flex:1;min-width:6px} .nbtools{display:flex;gap:2px;align-items:center}
.nbt{display:inline-flex;align-items:center;gap:4px;justify-content:center;min-width:34px;height:34px;border:0;border-radius:8px;background:none;color:var(--ink);cursor:pointer;flex:none;padding:0 6px;font-size:12px} .nbt:hover{background:var(--hover,rgba(0,0,0,.06))} .nbt.on{background:var(--ink);color:var(--bg)} .nbt:disabled{opacity:.3;cursor:default} .nbt.sm{min-width:26px;height:26px}
.nbt.rec{background:#d0312d;color:#fff;animation:nbrp 1.4s infinite} @keyframes nbrp{50%{background:#e9605b}}
.nbopts{display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid var(--line);background:var(--surface,#fff);min-height:42px;overflow-x:auto;scrollbar-width:none;flex:none}
.nbc{width:24px;height:24px;border-radius:50%;border:2px solid var(--surface,#fff);box-shadow:0 0 0 1px var(--line2);background:var(--c);cursor:pointer;flex:none;padding:0;position:relative} .nbc.on{box-shadow:0 0 0 2px var(--ink)} .nbcp input{opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer}
.nbw{width:32px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:7px;background:none;cursor:pointer;flex:none} .nbw i{display:block;border-radius:50%;background:var(--ink)} .nbw.on{background:var(--hover,rgba(0,0,0,.08));box-shadow:inset 0 0 0 1px var(--line2)}
.nbtx{border:1px solid var(--line2);background:var(--surface,#fff);border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer;color:var(--ink);white-space:nowrap;flex:none} .nbtx.on{background:var(--ink);color:var(--bg);border-color:var(--ink)} .nbtx.bad{color:var(--bad)}
.nbsep{width:1px;height:22px;background:var(--line2);margin:0 4px;flex:none} .nbhint{font-size:11.5px;color:var(--mut);margin-left:6px;white-space:nowrap} .nbfs{width:auto;padding:3px 6px;border:1px solid var(--line2);border-radius:6px;background:var(--surface,#fff);color:var(--ink);font-size:12px}
.nbsc{flex:1;min-height:0;overflow:auto;background:#e9e9ec;touch-action:none;position:relative;overscroll-behavior:contain} .nbsc[data-tool="hand"]{cursor:grab} .nbsc[data-tool="text"] .nbp{cursor:text} .nbsc[data-tool="pen"] .nbp,.nbsc[data-tool="hl"] .nbp,.nbsc[data-tool="shape"] .nbp{cursor:crosshair}
.nbpages{display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px 8px 30px;width:max-content;min-width:100%;box-sizing:border-box}
.nbp{position:relative;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18),0 8px 24px rgba(0,0,0,.08);flex:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.nbp canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.nbpn{position:absolute;right:-2px;bottom:-18px;font-size:10.5px;color:#8a8a8e}
.nbaddend{display:flex;align-items:center;gap:6px;border:1px dashed #b5b5bb;background:none;color:#6c6c72;border-radius:8px;padding:10px 18px;cursor:pointer;font-size:12.5px;margin-top:6px}
.nbsb{position:absolute;border:1.5px dashed #1f5fd1;background:rgba(31,95,209,.05);pointer-events:none;border-radius:3px} .nbsb .nbh{position:absolute;right:-8px;bottom:-8px;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #1f5fd1}
.nbselbar{position:absolute;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;gap:6px;align-items:center;background:var(--surface,#fff);border:1px solid var(--line2);border-radius:12px;padding:6px 8px;box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:5;max-width:calc(100% - 20px);overflow-x:auto}
.nbr.ed{position:relative}
.nbtxed{position:absolute;z-index:4;border:1px dashed #1f5fd1;background:rgba(255,255,255,.85);resize:none;overflow:hidden;padding:0 2px;margin:0;outline:none;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;min-height:1.3em}
.nbaup{border-top:1px solid var(--line);background:var(--surface,#fff);padding:8px 10px calc(8px + env(safe-area-inset-bottom));flex:none} .aur{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none} .aup{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px;flex-wrap:wrap} .aup input[type=range]{flex:1;min-width:120px}
.nbload{padding:40px;text-align:center;color:var(--mut)}
.ppl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;max-height:62vh;overflow:auto;padding:4px}
.ppi{display:flex;gap:8px;align-items:flex-start;padding:6px;border-radius:8px;cursor:pointer;border:1px solid transparent} .ppi.on{border-color:var(--ink)} .ppi:hover{background:var(--hover,rgba(0,0,0,.04))} .ppi canvas{box-shadow:0 0 0 1px var(--line2);background:#fff;flex:none}
.ppa{display:flex;flex-direction:column;gap:2px;align-items:flex-start} .ppa b{font-size:12px;padding-left:4px}
.nbpop{z-index:96}
.nbr.ed.mob .nbtb{flex-wrap:wrap;row-gap:2px;overflow:visible} .nbr.ed.mob .nbtools{order:10;width:100%;justify-content:space-between;border-top:1px solid var(--line);padding-top:4px} .nbr.ed.mob .nbsp{display:none} .nbr.ed.mob .nbtitle{flex:1;width:auto;min-width:60px}
.nbr.ed.mob .nbt{min-width:32px;height:32px;padding:0 4px}
@media (max-width:820px){ .nblh #nb_q{max-width:none;flex:1} .nbnew{margin-left:0;width:100%} .nbnew .btn{flex:1;justify-content:center} .nbgrid{grid-template-columns:repeat(2,1fr);gap:10px} .nbhint{display:none} }
`; document.head.appendChild(css);

/* ---------- API para la app ---------- */
window.NBdbg=()=>NB;
window.NBX={
  render(){ const v=$('#view'); v.classList.add('nbv'); if(S.nbOpen){ const id=S.nbOpen; S.nbOpen=null; return openNb(id); }
    if(NB.mode==='ed'&&NB.id&&meta(NB.id)){ if($('#nbroot.ed')){ if(NB.doc){ const t=$('#nb_title'); if(t&&document.activeElement!==t) t.value=meta(NB.id).data.title||''; } return; } return openNb(NB.id); }
    NB.mode='lib'; renderLib(); },
  leave(){ if(NB.mode==='ed'){ saveNow(); stopRec(); if(NB.au){ NB.au.el.pause(); NB.au=null; } } },
  open:id=>openNb(id),
};
})();
