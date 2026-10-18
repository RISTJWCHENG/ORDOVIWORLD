#!/usr/bin/env node
// Revalidate Caffeine candidate metadata for auto-publication; only public default Live domains.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {eligibleCaffeine} from '../worker/v5/caffeine.js';
const input=resolve(process.argv[2]||'data/caffeine-candidates-v5.json');
const output=resolve(process.argv[3]||'data/caffeine-import-v51.json');
const data=JSON.parse(await readFile(input,'utf8'));
if(data.schemaVersion!==5 || !Array.isArray(data.records))throw Error('Not a V5 candidate report');
const eligible=data.records.filter(eligibleCaffeine);
const filtered={...data,generatedAt:new Date().toISOString(),records:eligible,publicationPolicy:'strict-domain-auto-v51'};
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(filtered,null,2)+'\n');
console.log(`Caffeine V5.1: ${data.records.length} candidates, ${eligible.length} eligible. ${output}`);
