import {ftsQuery} from './validation.js';
const cors={'access-control-allow-origin':'https://ristjwcheng.github.io','vary':'Origin','content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
export async function handleSearch(request,env){
 const u=new URL(request.url);const term=(u.searchParams.get('q')||'').trim().slice(0,150);
 const limit=Math.min(30,Math.max(1,Number.parseInt(u.searchParams.get('limit'),10)||10));
 const page=Math.min(1000,Math.max(1,Number.parseInt(u.searchParams.get('page'),10)||1));
 const category=(u.searchParams.get('category')||'').slice(0,80);
 const type=u.searchParams.get('type')||'project';
 const result=(records,count)=>new Response(JSON.stringify({records,count,page,limit,query:term}),{headers:cors});
 if(type!=='project')return result([],0);
 let rows,count;
 if(term){
  const fts=ftsQuery(term);if(!fts)return result([],0);
  const where="FROM search_fts_v3 f JOIN search_entities_v3 e ON e.id=f.entity_id WHERE search_fts_v3 MATCH ? AND e.status='published' AND e.entity_type='project' AND (?='' OR e.category=?)";
  const params=[fts,category,category];
  count=await env.DB.prepare('SELECT COUNT(*) AS n '+where).bind(...params).first();
  rows=await env.DB.prepare('SELECT e.id,e.canonical_name AS name,e.description,e.category,e.website_url,e.updated_at,bm25(search_fts_v3) AS rank '+where+' ORDER BY rank,e.id LIMIT ? OFFSET ?').bind(...params,limit,(page-1)*limit).all();
 }else{
  const where="FROM search_entities_v3 e WHERE e.status='published' AND e.entity_type='project' AND (?='' OR e.category=?)";
  count=await env.DB.prepare('SELECT COUNT(*) AS n '+where).bind(category,category).first();
  rows=await env.DB.prepare('SELECT e.id,e.canonical_name AS name,e.description,e.category,e.website_url,e.updated_at '+where+' ORDER BY e.updated_at DESC,e.id LIMIT ? OFFSET ?').bind(category,category,limit,(page-1)*limit).all();
 }
 const found=rows.results||[];
 const records=[];
 for(const p of found){
  const details=await env.DB.prepare('SELECT logo_url,logo_key,github_url,website_status,website_checked_at,category_source FROM search_project_details_v4 WHERE entity_id=?').bind(p.id).first();
  const cans=await env.DB.prepare('SELECT canister_id AS canisterId,role FROM search_project_canisters_v4 WHERE entity_id=? ORDER BY role,canister_id LIMIT 30').bind(p.id).all();
  const sources=await env.DB.prepare('SELECT source_type AS sourceType,source_url AS sourceUrl,observed_at AS collectedAt FROM search_sources_v3 WHERE entity_id=? ORDER BY observed_at DESC LIMIT 20').bind(p.id).all();
  const logoKey=details?.logo_key||'';
  const assetUrl=logoKey ? new URL('/api/assets/'+logoKey,new URL(request.url).origin).href : '';
  records.push({id:p.id,slug:p.id,name:p.name,description:p.description,websiteUrl:p.website_url,
   githubUrl:details?.github_url||'',logoKey,logoUrl:assetUrl||details?.logo_url||'',
   websiteStatus:details?.website_status||'unchecked',lastVerifiedAt:details?.website_checked_at||'',
   categorySource:details?.category_source||'',canisters:cans.results||[],sources:sources.results||[],
   categories:[p.category],tags:[],status:'published',updatedAt:p.updated_at});
 }
 return result(records,count?.n||0);
}
