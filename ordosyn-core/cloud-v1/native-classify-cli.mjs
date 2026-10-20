#!/usr/bin/env node
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {classifyNativeBatch} from './native-classify.mjs';

async function main(){
 const args=process.argv.slice(2);
 if(args.length!==4||args[0]!=='--in'||args[2]!=='--out')throw Error('Usage: node native-classify-cli.mjs --in crawl-batch.json --out classified.json');
 if(!process.env.GPT_API_KEY_ORDOSYNSEARCH)throw Error('GPT_API_KEY_ORDOSYNSEARCH is required');
 const inPath=resolve(args[1]),outPath=resolve(args[3]);
 if(inPath===outPath)throw Error('Input and output must be different');
 const batch=JSON.parse(await readFile(inPath,'utf8'));
 const result=await classifyNativeBatch(batch,{apiKey:process.env.GPT_API_KEY_ORDOSYNSEARCH});
 const out={schema:result.schema,artifacts:result.artifacts.map(({artifact,key,bytesSha256,sourceEvidence,tags})=>({artifact,key,bytesSha256,sourceEvidence,tags})),remotePersistenceVerified:false,checkpointAllowed:false,cloudWrites:0};
 await mkdir(dirname(outPath),{recursive:true});
 await writeFile(outPath,JSON.stringify(out,null,2)+'\n',{encoding:'utf8',flag:'wx',mode:0o600});
 console.log(`Native classified artifacts: ${out.artifacts.length}. Local only; no D1/R2 writes; no checkpoint.`);
}
main().catch(e=>{console.error('NATIVE_CLASSIFICATION_REJECTED:',e.message);process.exitCode=1});
