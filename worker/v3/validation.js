export const SNS_URL='https://sns-api.internetcomputer.org/api/v2/snses';
export const V3_SCHEMA=3;
export function safeHttps(raw) {
 try { const u=new URL(raw); if(u.protocol!=='https:' || u.username || u.password || !u.hostname.includes('.') ||
  /(^localhost$|\.localhost$|\.local$|\.internal$)/i.test(u.hostname) ||
  /^(?:\d{1,3}\.){3}\d{1,3}$/.test(u.hostname)) return '';
  return u.href;
 } catch { return '' }
}
export function eligibleSNS(r) {
 if(!r||typeof r!=='object') return false;
 if(!/^[a-z0-9][a-z0-9-]{1,119}$/.test(r.id||'')) return false;
 if(typeof r.name!=='string' || r.name.trim().length<2 || r.name.length>250) return false;
 if(r.status==='rejected'||r.status==='archived') return false;
 if(r.websiteStatus!=='up'||!safeHttps(r.websiteUrl)) return false;
 return Array.isArray(r.sources)&&r.sources.some(s=>s?.sourceType==='sns'&&s.sourceUrl===SNS_URL)&&
  Array.isArray(r.canisters)&&r.canisters.some(c=>c?.role==='sns-root'&&/^[a-z0-9-]{10,70}$/.test(c.canisterId||''));
}
export function validateBatch(payload) {
 if(!payload||payload.schemaVersion!==3||!Array.isArray(payload.records)||payload.records.length>100||!payload.records.length ||
 typeof payload.batchId!=='string'||!/^[-a-zA-Z0-9_]{8,120}$/.test(payload.batchId)||
 !Number.isFinite(Date.parse(payload.generatedAt))) throw new Error('Invalid V3 batch format');
 const seen=new Set();
 for(const r of payload.records) {
  if(!r||typeof r.id!=='string'||seen.has(r.id)) throw new Error('Missing or duplicate entity IDs');
  seen.add(r.id);
 }
 return payload;
}
export function ftsQuery(raw) {
 const words=(String(raw||'').match(/[\p{L}\p{N}]+/gu)||[]).slice(0,8);
 return words.map(w=>'"'+w.slice(0,50)+'"*').join(' AND ');
}
