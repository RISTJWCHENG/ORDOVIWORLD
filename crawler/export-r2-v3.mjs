#!/usr/bin/env node
// Converts public SNS candidates to an immutable R2 ingestion batch; no private data.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {eligibleSNS} from '../worker/v3/validation.js';
const input=resolve(process.argv[2]||'data/projects.json');
const outfile=resolve(process.argv[3]||'data/import-v3.json');
const source=JSON.parse(await readFile(input,'utf8'));
if(!Array.isArray(source.records)) throw new Error('Missing input records array');
const eligible=source.records.filter(eligibleSNS);
const uniq=new Map();for(const x of eligible)if(!uniq.has(x.id))uniq.set(x.id,x);
const data=[...uniq.values()].sort((a,b)=>a.id.localeCompare(b.id));
const generatedAt=new Date().toISOString();
const body={schemaVersion:3,batchId:'sns-'+createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0,24),generatedAt,records:data};
await mkdir(dirname(outfile),{recursive:true});
await writeFile(outfile,JSON.stringify(body,null,2)+'\n');
console.log(`V3 export: ${source.records.length} candidates, ${data.length} eligible; ${outfile}`);
