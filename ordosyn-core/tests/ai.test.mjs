import test from 'node:test';
import assert from 'node:assert/strict';
import {aiRequest,validateSuggestion} from '../worker/ai.js';
const projectId='proj_'+'a'.repeat(32);
const excerpt='DecideAI builds useful AI applications on the Internet Computer with transparent governance and user ownership. '.repeat(3);
const sample={category:'AI',summary:'DecideAI builds AI applications on Internet Computer for community participants.',tags:['AI','ICP'],confidence:0.87,evidenceQuotes:['DecideAI builds useful AI applications on the Internet Computer']};
const request=(id=projectId,token='secret')=>new Request('https://example.workers.dev/internal/ai/suggest',{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({projectId:id})});
function db(){const state={insert:0,sql:[]};return {state,prepare(sql){state.sql.push(sql);return {bind(){return {first:async()=>sql.startsWith('SELECT id,name')?{id:projectId,name:'DecideAI DAO',websiteUrl:'https://decideai.xyz',description:'ICP AI',status:'published'}:{id:'page_a',bodyText:excerpt,contentHash:'a'.repeat(64)},run:async()=>{state.insert++;return {success:true}},all:async()=>({results:[]})}}}}};}
const env=db=>({DB:db,REVIEW_TOKEN:'secret',GEMINI_API_KEY:'test',GEMINI_MODEL:'gemini-2.5-flash'});
const model=async(url,opts)=>{assert.match(url,/generativelanguage.googleapis.com/);assert.equal(opts.headers['x-goog-api-key'],'test');return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(sample)}]}}]})};};
test('authorization and no automatic edits',async()=>{const d=db();assert.equal((await aiRequest(request(projectId,'bad'),env(d),undefined,model)).status,401);assert.equal(d.state.sql.length,0);});
test('rejects forged project IDs',async()=>{const d=db();assert.equal((await aiRequest(request('not-real'),env(d),undefined,model)).status,400);});
test('validates real quoted evidence',()=>{assert.equal(validateSuggestion(sample,excerpt).category,'AI');assert.throws(()=>validateSuggestion({...sample,evidenceQuotes:['Invented fake evidence not found']},excerpt));});
test('model suggestion stored without altering publication status',async()=>{const d=db();const r=await aiRequest(request(),env(d),undefined,model);assert.equal(r.status,200);const result=await r.json();assert.equal(result.reviewRequired,true);assert.equal(result.projectStatusUnchanged,true);assert.match(result.id,/^ai_[a-f0-9]{32}$/);assert.equal(d.state.insert,1);assert.equal(d.state.sql.filter(s=>/UPDATE projects|INSERT INTO review_events/i.test(s)).length,0);});
test('unverifiable model quote is not persisted',async()=>{const d=db();const fake=async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({...sample,evidenceQuotes:['Hallucinated information']})}]}}]})});assert.equal((await aiRequest(request(),env(d),undefined,fake)).status,422);assert.equal(d.state.insert,0);});
test('GET suggestions requires review token',async()=>{const d=db();const req=new Request('https://example.workers.dev/internal/ai/suggestions?projectId='+projectId,{headers:{authorization:'Bearer secret'}});const r=await aiRequest(req,env(d));assert.equal(r.status,200);assert.deepEqual((await r.json()).records,[]);});


test('upstream failures return safe diagnostic codes',async()=>{
 const cases=[
  [400,'MODEL_BAD_REQUEST'],
  [403,'MODEL_AUTH_ERROR'],
  [404,'MODEL_NOT_FOUND'],
  [429,'MODEL_RATE_LIMITED'],
  [503,'MODEL_UPSTREAM_ERROR']
 ];
 for(const [status,code] of cases){
  const d=db();
  const fake=async()=>({ok:false,status});
  const response=await aiRequest(request(),env(d),undefined,fake);
  assert.equal(response.status,502);
  const body=await response.json();
  assert.equal(body.code,code);
  assert.equal(body.upstreamStatus,status);
  assert.equal(d.state.insert,0);
  assert.equal(JSON.stringify(body).includes('test'),false);
 }
});

test('model timeout and network failures are classified',async()=>{
 for(const [name,code] of [
  ['TimeoutError','MODEL_TIMEOUT'],
  ['TypeError','MODEL_NETWORK_ERROR']
 ]){
  const d=db();
  const fake=async()=>{const e=new Error('private upstream detail');e.name=name;throw e;};
  const response=await aiRequest(request(),env(d),undefined,fake);
  assert.equal(response.status,502);
  const body=await response.json();
  assert.equal(body.code,code);
  assert.equal(JSON.stringify(body).includes('private upstream detail'),false);
  assert.equal(d.state.insert,0);
 }
});