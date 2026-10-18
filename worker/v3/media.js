import {safeHttps} from './validation.js';
const MIME={ 'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/avif':'avif','image/x-icon':'ico','image/vnd.microsoft.icon':'ico' };
const MAX=1024*1024;
export async function cacheProjectLogo(env,id,raw){
 const url=safeHttps(raw);
 if(!url || url.length>2000) return {url:'',key:'',mime:''};
 try {
  const host=new URL(url).hostname;
  // Hard reject addresses not suitable for server-side fetch.
  if(!/^[a-z0-9.-]+$/i.test(host)||host==='localhost'||host.endsWith('.local')||host.endsWith('.internal')||host.endsWith('.test')||host.endsWith('.invalid')||host.endsWith('.example')) return {url:'',key:'',mime:''};
  const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(6000),headers:{Accept:'image/png,image/jpeg,image/webp,image/avif,image/gif'}});
  if(!response.ok) {response.body?.cancel();return {url,key:'',mime:''}}
  const mime=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  const ext=MIME[mime];const len=Number(response.headers.get('content-length')||0);
  if(!ext||len>MAX){response.body?.cancel();return {url,key:'',mime:''}}
  const reader=response.body?.getReader();if(!reader)return {url,key:'',mime:''};
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
   if(size>MAX){await reader.cancel();return {url,key:'',mime:''}}chunks.push(value)}
  if(!size)return {url,key:'',mime:''};
  const data=new Uint8Array(size);let pos=0;for(const c of chunks){data.set(c,pos);pos+=c.byteLength}
  // Stable name; version changes are overwritten, not multiplied infinitely.
  const key=`logos/${id}.${ext}`;
  await env.FILES.put(key,data,{httpMetadata:{contentType:mime}});
  return {url,key,mime};
 }catch(e){console.warn('Logo cache unavailable',id,String(e).slice(0,120));return {url,key:'',mime:''}}
}
