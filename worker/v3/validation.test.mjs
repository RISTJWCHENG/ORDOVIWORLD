import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {eligibleSNS,validateBatch,ftsQuery,safeHttps,SNS_URL} from './validation.js';
const valid={id:'sample-sns',name:'Sample SNS',slug:'sample-sns',websiteStatus:'up',websiteUrl:'https://example.org/',sources:[{sourceType:'sns',sourceUrl:SNS_URL}],canisters:[{role:'sns-root',canisterId:'aaaaa-aaaaa-aaaaa-aaaaa'}]};
test('SNS official source and canister required',()=>{assert.equal(eligibleSNS(valid),true);assert.equal(eligibleSNS({...valid,sources:[]}),false);assert.equal(eligibleSNS({...valid,status:'rejected'}),false)});
test('invalid URLs excluded',()=>{assert.equal(safeHttps('http://example.com'),'');assert.equal(safeHttps('https://localhost/'),'');assert.equal(safeHttps('https://example.com/'),'https://example.com/')});
test('batch rejects duplicates',()=>{assert.throws(()=>validateBatch({schemaVersion:3,batchId:'abcdef1234',generatedAt:new Date().toISOString(),records:[valid,valid]}),/duplicate/)});
test('fts query escapes punctuation and limits terms',()=>{assert.equal(ftsQuery('ICP + Search!'),'"ICP"* AND "Search"*');});
