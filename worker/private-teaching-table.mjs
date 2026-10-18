// Restricted Teaching Table: signed Cloudflare Access JWT and private Git LFS files.
const base='/apps/teaching-table', repo='MrH-SWES/teaching-table-books';
const sizes=new Map([['0K',260866814],['01',219147927],['02',254660290],['03',150737463],['04',113912690],['05',142733845],['06',199036068],['07',222962162],['08',213820188]].map(([grade,size])=>['iRCM'+grade+'_NN_EN_SW.epub',size]));
const closed=(status,message)=>new Response(message,{status,headers:{'Cache-Control':'private, no-store','Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'}});
let keys,keysAt=0;
const bytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),x=>x.charCodeAt(0));
const json=s=>JSON.parse(new TextDecoder().decode(bytes(s)));
// A failure code diagnoses configuration without disclosing identities, tokens or keys.
async function authorized(request,env){
 const rawDomain=String(env.ACCESS_TEAM_DOMAIN||'').trim();
 const domain=rawDomain.replace(/^https:\/\//i,'').replace(/\/+$/,'').toLowerCase();
 const aud=String(env.ACCESS_AUD||'').trim();
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain))return 'team-domain';
 if(!aud)return 'aud-missing';
 const header=request.headers.get('Cf-Access-Jwt-Assertion');
 // Cloudflare also sets CF_Authorization after login. Both paths require full signature validation.
 const accessCookie=(request.headers.get('Cookie')||'').split(';')
  .map(x=>x.trim()).find(x=>x.startsWith('CF_Authorization='));
 const token=header||(accessCookie?accessCookie.slice('CF_Authorization='.length):'');
 if(!token)return 'jwt-missing';
 const parts=token.split('.');
 if(parts.length!==3||token.length>16000)return 'jwt-format';
 try{
  const head=json(parts[0]),p=json(parts[1]),now=Math.floor(Date.now()/1000);
  if(head.alg!=='RS256'||!head.kid||p.type!=='app')return 'jwt-kind';
  if(p.iss!=='https://'+domain)return 'jwt-issuer';
  const audiences=Array.isArray(p.aud)?p.aud:[p.aud];
  if(!audiences.includes(aud))return 'jwt-audience';
  if(!Number.isFinite(p.exp)||p.exp<=now||!Number.isFinite(p.iat)||p.iat>now+60||
   (p.nbf!==undefined&&(!Number.isFinite(p.nbf)||p.nbf>now)))return 'jwt-time';
  // Only staff and guests authenticated by identity-provider policies.
  if(typeof p.email!=='string'||!p.email.includes('@'))return 'jwt-identity';
  if(!keys||Date.now()>keysAt){
   const response=await fetch('https://'+domain+'/cdn-cgi/access/certs');
   if(!response.ok)return 'jwks-http';
   const data=await response.json();
   if(!Array.isArray(data.keys))return 'jwks-format';
   keys=data.keys;keysAt=Date.now()+300000;
  }
  const jwk=keys.find(x=>x.kid===head.kid&&x.kty==='RSA');
  if(!jwk)return 'jwks-key';
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
  return verified?'ok':'jwt-signature';
 }catch{return 'jwt-processing';}
}
async function cover(name,token){
 const response=await fetch('https://api.github.com/repos/'+repo+'/contents/covers/'+name+'?ref=main',
  {headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','User-Agent':'school-teaching-table'}});
 if(response.status===404)return closed(404,'Cover preview not yet generated');
 if(!response.ok)return closed(502,'Cover preview unavailable');
 const data=await response.json();
 if(data.encoding!=='base64'||!data.content||data.size>125000)return closed(502,'Invalid cover preview');
 const binary=atob(data.content.replace(/\s/g,'')),out=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);
 return new Response(out,{headers:{'Content-Type':'image/webp','Cache-Control':'private, max-age=86400','X-Content-Type-Options':'nosniff'}});
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
// Minimal, authorized diagnostic: probes the selected LFS object without downloading it.
// Never returns the GitHub token, LFS signed download URL, or private metadata.
async function diagnoseBook(request,env){
 const grade=new URL(request.url).searchParams.get('grade')||'04';
 if(!/^(0K|0[1-8])$/.test(grade))return closed(400,'Invalid grade');
 const name='iRCM'+grade+'_NN_EN_SW.epub',size=sizes.get(name);
 const result={grade,stage:'start',status:0};
 const finish=()=>new Response(JSON.stringify(result),{headers:{
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'
 }});
 const token=env.GITHUB_BOOKS_READ_TOKEN;
 if(!token){result.stage='token-not-configured';return finish();}
 try{
  const pointerResponse=await fetch('https://api.github.com/repos/'+repo+'/contents/books/'+name+'?ref=main',{
   headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','User-Agent':'school-teaching-table'}});
  result.stage='github-contents';result.status=pointerResponse.status;
  if(!pointerResponse.ok)return finish();
  const data=await pointerResponse.json();
  if(data.encoding!=='base64'||!data.content){result.stage='lfs-pointer-missing';return finish();}
  const pointer=atob(data.content.replace(/\s/g,''));
  const oid=/^oid sha256:([0-9a-f]{64})$/m.exec(pointer)?.[1];
  const length=Number(/^size (\d+)$/m.exec(pointer)?.[1]);
  if(!oid||length!==size){result.stage='lfs-pointer-invalid';return finish();}
  const batch=await fetch('https://github.com/'+repo+'.git/info/lfs/objects/batch',{
   method:'POST',
   headers:{Authorization:'Basic '+btoa('x-access-token:'+token),
    'Content-Type':'application/vnd.git-lfs+json',Accept:'application/vnd.git-lfs+json',
    'User-Agent':'school-teaching-table'},
   body:JSON.stringify({operation:'download',transfers:['basic'],
    ref:{name:'refs/heads/main'},objects:[{oid,size}]})
  });
  result.stage='lfs-batch';result.status=batch.status;
  if(!batch.ok)return finish();
  const dataBatch=await batch.json();
  const object=dataBatch.objects?.find(x=>x.oid===oid&&x.size===size);
  if(object?.error){result.stage='lfs-object';result.status=object.error.code||0;return finish();}
  const action=object?.actions?.download;
  if(!action?.href||new URL(action.href).protocol!=='https:'){
   result.stage='lfs-download-action-missing';return finish();
  }
  const upstream=await fetch(action.href,{
   headers:{...(action.header||{}),Range:'bytes=0-3'}
  });
  result.stage='lfs-range';result.status=upstream.status;
  result.type=upstream.headers.get('Content-Type')?.split(';')[0]||'unknown';
  result.range=upstream.headers.get('Content-Range')?'partial':'unspecified';
  if(!upstream.ok){await upstream.body?.cancel();return finish();}
  if(!upstream.body){result.stage='lfs-empty-body';return finish();}
  const reader=upstream.body.getReader();
  const first=await reader.read();
  result.stage=first.done?'lfs-empty-stream':'lfs-first-bytes';
  result.bytesReceived=first.value?.byteLength||0;
  await reader.cancel();
  result.ok=result.bytesReceived>0;
  return finish();
 }catch(e){
  result.stage='exception';
  result.kind=e instanceof TypeError?'network-or-fetch':'processing';
  return finish();
 }
}

export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path!==base&&!path.startsWith(base+'/'))return env.ASSETS.fetch(request);
 if(!['GET','HEAD'].includes(request.method))return closed(405,'Method not allowed');
 const access=await authorized(request,env);
 if(access!=='ok')return closed(403,'Teaching Table access check: '+access);
 if(path===base+'/_diagnose-book')return diagnoseBook(request,env);
 if(path.startsWith(base+'/covers/')){
  if(request.method!=='GET')return closed(405,'Method not allowed');
  const name=path.slice((base+'/covers/').length),original=name.replace(/\.webp$/i,'.epub');
  if(!name.endsWith('.webp')||!sizes.has(original))return closed(404,'Unknown cover');
  if(!env.GITHUB_BOOKS_READ_TOKEN)return closed(503,'Cover library not configured');
  try{return await cover(name,env.GITHUB_BOOKS_READ_TOKEN);}catch{return closed(502,'Cover temporarily unavailable');}
 }
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