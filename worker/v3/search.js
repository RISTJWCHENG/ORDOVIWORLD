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
 return result((rows.results||[]).map(p=>({id:p.id,slug:p.id,name:p.name,description:p.description,websiteUrl:p.website_url,categories:[p.category],tags:[],status:'published',updatedAt:p.updated_at})),count?.n||0);
}
