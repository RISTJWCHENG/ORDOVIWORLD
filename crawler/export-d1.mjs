#!/usr/bin/env node
// Generate an additive D1 SQL import for manually approved projects.
// No credentials or remote writes are performed by this script.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const input=resolve(process.argv[2]||'data/projects.json');
const output=resolve(process.argv[3]||'stage2-approved.sql');
const store=JSON.parse(await readFile(input,'utf8'));
if(!Array.isArray(store.records)) throw new Error('Input records array missing');
const sqlString=v=>"'"+String(v??'').replaceAll("'","''").replaceAll('\0','')+"'";
const safeHttps=v=> {try {const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}};
const rows=store.records.filter(x=>x.status==='published');
const unique=new Set();
const sql=[`-- Stage 2: only explicitly published records from ${input.replaceAll('\\','/')}.`,`-- Existing records not in this import remain untouched.`,`BEGIN TRANSACTION;`];
for(const r of rows){
  const id=String(r.id||'').slice(0,120), slug=String(r.slug||id).slice(0,120);
  if(!id||!slug||!String(r.name||'').trim()) throw new Error(`Invalid published project: ${id}`);
  if(unique.has(id)) throw new Error(`Duplicate project id: ${id}`);unique.add(id);
  const category=String(r.categories?.[0]||'Other').slice(0,80);
  const vals=[id,slug,String(r.name).slice(0,250),String(r.description||'').slice(0,4000),safeHttps(r.websiteUrl),safeHttps(r.githubUrl),category,JSON.stringify(Array.isArray(r.tags)?r.tags.slice(0,40):[]),'published',String(r.sources?.[0]?.sourceType||'manual').slice(0,80)];
  // Explicit field allowlist, no write to Profile or other databases.
  sql.push(`INSERT INTO project_index (id,slug,name,description,website_url,github_url,category,tags_json,status,source,updated_at) VALUES (${vals.map(sqlString).join(',')},CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,name=excluded.name,description=excluded.description,website_url=excluded.website_url,github_url=excluded.github_url,category=excluded.category,tags_json=excluded.tags_json,source=excluded.source,updated_at=CURRENT_TIMESTAMP WHERE project_index.status='published';`);
}
sql.push('COMMIT;');
await mkdir(resolve(output,'..'),{recursive:true});
await writeFile(output,sql.join('\n')+'\n','utf8');
console.log(`Exported ${rows.length} approved records to ${output}`);
