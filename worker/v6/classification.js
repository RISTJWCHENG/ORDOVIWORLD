
const PREFIX='imports/v3/ai-v6-';
const CATEGORIES=new Set(['Games','DeFi','AI','Social','NFT','DAO','Developer Tools','Infrastructure','Other']);
const maxBytes=600000;
const clean=x=>typeof x==='string'?x.trim():'';
const isAIEvent=e=>e?.bucket==='ordoviworld' && ['PutObject','CopyObject','CompleteMultipartUpload'].includes(e?.action) && typeof e?.object?.key==='string' && e.object.key.startsWith(PREFIX) && e.object.key.endsWith('.json');

export function validateAIRecord(r){
 if(!r||typeof r!=='object'||!/^[-a-z0-9_]{3,120}$/i.test(clean(r.id)))return false;
 if(!CATEGORIES.has(r.category)||!Number.isFinite(r.confidence)||r.confidence<0.9||r.confidence>1)return false;
 if(!/^sha256:[a-f0-9]{64}$/i.test(clean(r.inputHash)))return false;
 if(!/^gemini-[a-z0-9.-]{3,90}$/i.test(clean(r.model)))return false;
 if(clean(r.reason).length<18||clean(r.reason).length>600)return false;
 if(!Array.isArray(r.tags)||r.tags.length>12||r.tags.some(t=>typeof t!=='string'||t.length>55))return false;
 return true;
}

async function applyOne(env,r){
 const old=await env.DB.prepare("SELECT e.status,e.source_type,e.category,e.canonical_name AS name,e.description,e.website_url AS website,d.category_source AS categorySource FROM search_entities_v3 e LEFT JOIN search_project_details_v4 d ON d.entity_id=e.id WHERE e.id=?").bind(r.id).first();
 if(!old||old.status!=='published'||old.source_type!=='sns'||!['','heuristic','ai-gemini-v6',null].includes(old.categorySource))return false;
 const payload=JSON.stringify({name:old.name,description:old.description,website:old.website});
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload));
 const actualHash='sha256:'+Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
 if(actualHash!==r.inputHash)return false;
 const tomb=await env.DB.prepare('SELECT entity_id FROM search_tombstones_v3 WHERE entity_id=?').bind(r.id).first();
 if(tomb)return false;
 const pin=await env.DB.prepare('SELECT locked FROM search_ai_classifications_v6 WHERE entity_id=?').bind(r.id).first();
 if(pin?.locked)return false;
 const legacy=await env.DB.prepare('SELECT status,source FROM project_index WHERE id=?').bind(r.id).first();
 if(legacy && (legacy.status!=='published'||!['sns-auto-v2','sns-auto-v3'].includes(legacy.source)))return false;
 const sql=[
  env.DB.prepare("INSERT INTO search_ai_classifications_v6(entity_id,category,reasoning,tags_json,model,input_hash,confidence,source) VALUES(?,?,?,?,?,?,?,'gemini') ON CONFLICT(entity_id) DO UPDATE SET category=excluded.category,reasoning=excluded.reasoning,tags_json=excluded.tags_json,model=excluded.model,input_hash=excluded.input_hash,confidence=excluded.confidence,updated_at=CURRENT_TIMESTAMP WHERE search_ai_classifications_v6.locked=0").bind(r.id,r.category,r.reason,JSON.stringify(r.tags),r.model,r.inputHash,r.confidence),
  env.DB.prepare("UPDATE search_entities_v3 SET category=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='published' AND source_type='sns'").bind(r.category,r.id),
  env.DB.prepare("UPDATE search_project_details_v4 SET category_source='ai-gemini-v6',updated_at=CURRENT_TIMESTAMP WHERE entity_id=? AND (category_source IN ('','heuristic','ai-gemini-v6') OR category_source IS NULL)").bind(r.id),
  env.DB.prepare("UPDATE project_index SET category=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='published' AND source IN ('sns-auto-v2','sns-auto-v3')").bind(r.category,r.id)
 ];
 await env.DB.batch(sql);
 return true;
}

async function ingestAI(env,key){
 const obj=await env.FILES.get(key);
 if(!obj||obj.size>maxBytes)throw new Error('Missing or oversized AI batch');
 const etag=obj.etag||'';
 const prior=await env.DB.prepare('SELECT etag FROM search_ai_batches_v6 WHERE object_key=?').bind(key).first();
 if(prior?.etag===etag)return {skipped:true};
 const b=JSON.parse(await obj.text());
 if(b?.schemaVersion!==6||b?.kind!=='ai-classification'||!Array.isArray(b.records)||b.records.length>40)throw new Error('Invalid AI batch');
 let accepted=0,rejected=0;
 for(const r of b.records){
  if(!validateAIRecord(r)){rejected++;continue}
  if(await applyOne(env,r))accepted++;else rejected++;
 }
 await env.DB.prepare('INSERT INTO search_ai_batches_v6(object_key,etag,accepted_count,rejected_count) VALUES(?,?,?,?) ON CONFLICT(object_key) DO UPDATE SET etag=excluded.etag,accepted_count=excluded.accepted_count,rejected_count=excluded.rejected_count,processed_at=CURRENT_TIMESTAMP').bind(key,etag,accepted,rejected).run();
 console.log('V6 Gemini classify',key,JSON.stringify({accepted,rejected}));
 return {accepted,rejected};
}

// Keeps previous Gemini judgments when an SNS daily re-crawl refreshes V3 rows.
// Caffeine Apps and manual decisions are outside this update scope.
async function restoreAI(env){
 const rows=await env.DB.prepare("SELECT a.entity_id AS id,a.category,a.input_hash,e.canonical_name AS name,e.description,e.website_url AS website FROM search_ai_classifications_v6 a JOIN search_entities_v3 e ON e.id=a.entity_id JOIN search_project_details_v4 d ON d.entity_id=e.id WHERE a.locked=0 AND e.status='published' AND e.source_type='sns' AND d.category_source IN ('','heuristic','ai-gemini-v6') AND NOT EXISTS(SELECT 1 FROM search_tombstones_v3 t WHERE t.entity_id=e.id) LIMIT 300").all();
 for(const row of rows.results||[]){
  const body=JSON.stringify({name:row.name,description:row.description,website:row.website});
  const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body));
  const hash='sha256:'+Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join('');
  if(hash!==row.input_hash)continue; // Stale AI decisions must not overwrite updated crawler facts.
  await env.DB.batch([
   env.DB.prepare("UPDATE search_entities_v3 SET category=? WHERE id=? AND source_type='sns' AND status='published'").bind(row.category,row.id),
   env.DB.prepare("UPDATE project_index SET category=? WHERE id=? AND source IN ('sns-auto-v2','sns-auto-v3') AND status='published'").bind(row.category,row.id),
   env.DB.prepare("UPDATE search_project_details_v4 SET category_source='ai-gemini-v6' WHERE entity_id=? AND category_source IN ('','heuristic','ai-gemini-v6')").bind(row.id)
  ]);
 }
}
export function wrapAIQueueHandler(existingQueue){
 return async function queueHandlerV6(batch,env,ctx){
 const normal=[];
 for(const msg of batch.messages){
  if(!isAIEvent(msg.body)){normal.push(msg);continue}
  try {await ingestAI(env,msg.body.object.key);msg.ack()}
  catch(error){console.error('V6 import failure',String(error));msg.retry()}
 }
 if(normal.length){
  await existingQueue({...batch,messages:normal},env,ctx);
  try {await restoreAI(env)}catch(error){console.error('V6 classification reconcile failure',String(error))}
 }
}

}
