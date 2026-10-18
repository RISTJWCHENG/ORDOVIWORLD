import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAIRecord} from './classification.js';
const valid={id:'nuance',category:'Social',confidence:.95,model:'gemini-2.5-flash-lite',reason:'This is primarily a public blogging platform.',tags:['blogging'],inputHash:'sha256:'+'a'.repeat(64)};
test('valid AI record',()=>assert.equal(validateAIRecord(valid),true));
test('low confidence rejected',()=>assert.equal(validateAIRecord({...valid,confidence:.45}),false));
test('unlisted category rejected',()=>assert.equal(validateAIRecord({...valid,category:'Scam'}),false));
