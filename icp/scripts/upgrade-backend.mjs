import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Actor,HttpAgent} from '@icp-sdk/core/agent';
import {IDL} from '@icp-sdk/core/candid';
import {Principal} from '@icp-sdk/core/principal';
import {pemIdentity} from '../signing-identity.mjs';
import {idlFactory} from '../interface.js';
if(!process.env.ICP_SIGNING_KEY_PATH||!/^([a-f0-9]{64})$/.test(process.env.ICP_PREVIOUS_BACKEND_SHA256||''))throw Error('Signing key path and expected previous module hash are required');
const root=new URL('../..',import.meta.url),targets=JSON.parse(await readFile(new URL('canister_ids.json',root),'utf8')),id=targets.backend.ic;
const identity=pemIdentity(process.env.ICP_SIGNING_KEY_PATH),agent=await HttpAgent.create({host:'https://icp-api.io',identity});
const management=Actor.createActor(({IDL:I})=>I.Service({
 canister_status:I.Func([I.Record({canister_id:I.Principal})],[I.Record({settings:I.Record({controllers:I.Vec(I.Principal)}),module_hash:I.Opt(I.Vec(I.Nat8))})],[]),
 install_code:I.Func([I.Record({mode:I.Variant({upgrade:I.Opt(I.Record({skip_pre_upgrade:I.Opt(I.Bool),wasm_memory_persistence:I.Opt(I.Variant({keep:I.Null,replace:I.Null}))}))}),canister_id:I.Principal,wasm_module:I.Vec(I.Nat8),arg:I.Vec(I.Nat8)})],[],[])
}),{agent,canisterId:'aaaaa-aa',effectiveCanisterId:Principal.fromText(id)});
const canister_id=Principal.fromText(id),before=await management.canister_status({canister_id}),controllers=before.settings.controllers.map(p=>p.toText()).sort(),previous=Buffer.from(before.module_hash[0]||[]).toString('hex');
if(!controllers.includes(identity.getPrincipal().toText()))throw Error('Signing identity is not a controller');
const wasm=await readFile(new URL('.icp-build/backend.wasm',root)),next=createHash('sha256').update(wasm).digest('hex');
if(previous!==process.env.ICP_PREVIOUS_BACKEND_SHA256&&previous!==next)throw Error('Installed backend differs from the reviewed previous module');
const backend=Actor.createActor(idlFactory,{agent,canisterId:id}),health=await backend.health(),count=(await backend.search('','',0n,1n)).count;
if(previous!==next){
 const arg=IDL.encode([IDL.Principal],[Principal.fromText('cvzgo-accjr-4oizt-pkxsb-ijvj7-oqdwh-eur3g-q67oq-sr354-5fehi-2qe')]);
 await management.install_code({mode:{upgrade:[{skip_pre_upgrade:[],wasm_memory_persistence:[{keep:null}]}]},canister_id,wasm_module:wasm,arg});
}
const after=await management.canister_status({canister_id});
if(Buffer.from(after.module_hash[0]||[]).toString('hex')!==next)throw Error('Upgraded module hash mismatch');
if(JSON.stringify(after.settings.controllers.map(p=>p.toText()).sort())!==JSON.stringify(controllers))throw Error('Controllers changed unexpectedly');
if(await backend.health()!==health||(await backend.search('','',0n,1n)).count!==count)throw Error('Post-upgrade public state verification failed');
await writeFile(new URL('.icp-build/backend-upgrade.json',root),JSON.stringify({canisterId:id,previousModuleHash:previous,moduleHash:next,controllers,catalogCount:String(count),upgradedAt:new Date().toISOString()},null,2)+'\n');
console.log('Backend upgraded with memory preserved; module hash, controllers, health and catalog count verified.');
