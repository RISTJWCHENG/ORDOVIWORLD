import {test} from 'node:test';import {strict as assert} from 'node:assert';import {readFileSync} from 'node:fs';
const base=new URL('.',import.meta.url);const read=n=>readFileSync(new URL(n,base),'utf8');
test('V4 ingestion keeps V3 reject and tombstone protections',()=>{const s=read('ingest.js');assert.match(s,/search_tombstones_v3/);assert.match(s,/old.status!==/);assert.match(s,/search_project_canisters_v4/);assert.match(s,/cacheProjectLogo/)});
test('V4 search returns provenance and logo',()=>{const s=read('search.js');assert.match(s,/logoUrl/);assert.match(s,/sources/);assert.match(s,/canisters/)});
