// Restricted Teaching Table: signed Cloudflare Access JWT and private Git LFS files.
const base='/apps/teaching-table', repo='MrH-SWES/teaching-table-books';
const sizes=new Map([['0K',260866814],['01',219147927],['02',254660290],['03',150737463],['04',113912690],['05',142733845],['06',199036068],['07',222962162],['08',213820188]].map(([grade,size])=>['iRCM'+grade+'_NN_EN_SW.epub',size]));
const closed=(status,message)=>new Response(message,{status,headers:{'Cache-Control':'private, no-store','Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'}});
let keys,keysAt=0;
const bytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),x=>x.charCodeAt(0));
const json=s=>JSON.parse(new TextDecoder().decode(bytes(s)));
async function authorized(request,env){
 const domain=String(env.ACCESS_TEAM_DOMAIN||'').toLowerCase(),aud=String(env.ACCESS_AUD||'');
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain)||!aud)return false;
 const token=request.headers.get('Cf-Access-Jwt-Assertion')||'',parts=token.split('.');
 if(parts.length!==3||token.length>16000)return false;
 try{
  const head=json(parts[0]),p=json(parts[1]),now=Math.floor(Date.now()/1000);
  if(head.alg!=='RS256'||!head.kid||p.type!=='app'||p.iss!=='https://'+domain||
   !Array.isArray(p.aud)||!p.aud.includes(aud)||!Number.isFinite(p.exp)||p.exp<=now||
   !Number.isFinite(p.iat)||p.iat>now+60)return false;
  if(!keys||Date.now()>keysAt){const response=await fetch('https://'+domain+'/cdn-cgi/access/certs');
   if(!response.ok)return false;const data=await response.json();if(!Array.isArray(data.keys))return false;
   keys=data.keys;keysAt=Date.now()+300000;}
  const jwk=keys.find(x=>x.kid===head.kid&&x.kty==='RSA');if(!jwk)return false;
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
 }catch{return false;}
}
async function book(name,size,token){
 const p=await fetch('https://api.github.com/repos/'+repo+'/contents/books/'+name+'?ref=main',
  {headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','User-Agent':'school-teaching-table'}});
 if(!p.ok)return closed(502,'Textbook repository unavailable');
 const data=await p.json();if(data.encoding!=='base64'||!data.content)return closed(502,'Missing LFS pointer');
 const pointer=atob(data.content.replace(/\s/g,'')),oid=/^oid sha256:([0-9a-f]{64})$/m.exec(pointer)?.[1],
 pointerSize=Number(/^size (\d+)$/m.exec(pointer)?.[1]);
 if(!pointer.startsWith('version https://git-lfs.github.com/spec/v1\n')||!oid||pointerSize!==size)
  return closed(502,'Invalid LFS pointer');
 const batch=await fetch('https://github.com/'+repo+'.git/info/lfs/objects/batch',{method:'POST',
  headers:{Authorization:'Basic '+btoa('x-access-token:'+token),'Content-Type':'application/vnd.git-lfs+json',
   Accept:'application/vnd.git-lfs+json','User-Agent':'school-teaching-table'},
  body:JSON.stringify({operation:'download',transfers:['basic'],ref:{name:'refs/heads/main'},objects:[{oid,size}]})});
 if(!batch.ok)return closed(502,'LFS authorization failed');
 const payload=await batch.json(),object=payload.objects?.find(x=>x.oid===oid&&x.size===size),
 action=object?.actions?.download;
 if(object?.error||!action?.href||new URL(action.href).protocol!=='https:')return closed(502,'LFS file unavailable');
 const media=await fetch(action.href,{headers:action.header||{}});
 if(!media.ok||!media.body)return closed(502,'EPUB download failed');
 return new Response(media.body,{headers:{'Content-Type':'application/epub+zip','Content-Disposition':'inline; filename="'+name+'"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path!==base&&!path.startsWith(base+'/'))return env.ASSETS.fetch(request);
 if(!['GET','HEAD'].includes(request.method))return closed(405,'Method not allowed');
 if(!await authorized(request,env))return closed(403,'Authorized school staff only');
 if(path.startsWith(base+'/books/')){
  if(request.method!=='GET')return closed(405,'Method not allowed');
  const name=path.slice((base+'/books/').length),size=sizes.get(name);
  if(!size)return closed(404,'Unknown textbook');
  if(!env.GITHUB_BOOKS_READ_TOKEN)return closed(503,'Textbook library not configured');
  try{return await book(name,size,env.GITHUB_BOOKS_READ_TOKEN);}catch{return closed(502,'Book temporarily unavailable');}
 }
 const r=await env.ASSETS.fetch(request),safe=new Response(r.body,r);
 safe.headers.set('Cache-Control','private, no-store');return safe;
}};