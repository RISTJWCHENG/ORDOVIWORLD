import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
test('strict SNS auto-index excludes github-only and flagged candidates',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ord-v2-'));
 try{
 const official={sourceType:'sns',sourceUrl:'https://sns-api.internetcomputer.org/api/v2/snses'};
 const item={id:'valid-sns',name:'Valid SNS',slug:'valid-sns',websiteUrl:'https://example.org/',websiteStatus:'up',status:'pending',sources:[official],canisters:[{role:'sns-root',canisterId:'aaaaa-aaabbb-cccddd'}]};
 const data={records:[item,{...item,id:'github-only',sources:[{sourceType:'github'}]},{...item,id:'rejected',status:'rejected'}]};
 const inFile=join(dir,'input.json'),out=join(dir,'sql.sql'),report=join(dir,'report.json');
 await writeFile(inFile,JSON.stringify(data));
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('./auto-index.mjs',import.meta.url)),inFile,out,report],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const r=JSON.parse(await readFile(report,'utf8'));assert.equal(r.eligible,1);assert.equal(r.blocked,2);
 const sql=await readFile(out,'utf8');assert.match(sql,/valid-sns/);assert.doesNotMatch(sql,/github-only/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
