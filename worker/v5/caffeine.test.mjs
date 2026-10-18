import test from 'node:test';
import assert from 'node:assert/strict';
import {eligibleCaffeine,validateCaffeineBatch} from './caffeine.js';
const a={id:'caf-7528ebbde3da039a39aad5be',name:'Crypto Aquarium',description:'Built with caffeine.ai',websiteUrl:'https://crypto-aquarium-02r.caffeine.xyz/',builder:'caffeine',builderAttribution:'domain-evidence',evidence:['caffeine_default_live_domain'],status:'candidate'};
test('strict Caffeine eligibility',()=>{
 assert.equal(eligibleCaffeine(a),true);
 assert.equal(eligibleCaffeine({...a,name:'App'}),false);
 assert.equal(eligibleCaffeine({...a,websiteUrl:'https://example.org/'}),false);
 assert.equal(eligibleCaffeine({...a,builderAttribution:'unverified'}),false);
 assert.equal(eligibleCaffeine({...a,status:'rejected'}),false);
});
test('batch validates shape',()=>{
 const batch={schemaVersion:5,publicationPolicy:'strict-domain-auto-v51',generatedAt:new Date().toISOString(),records:[a]};
 assert.equal(validateCaffeineBatch(batch).records.length,1);
 assert.throws(()=>validateCaffeineBatch({...batch,records:[a,a]}));
});
