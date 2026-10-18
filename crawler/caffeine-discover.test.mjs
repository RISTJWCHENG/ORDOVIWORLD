import test from 'node:test';
import assert from 'node:assert/strict';
import {publicHttps,extract} from './caffeine-discover.mjs';
test('rejects unsafe URLs',()=>{for(const u of ['http://abc.caffeine.xyz','https://127.0.0.1/','https://localhost/','https://test.local/','javascript:alert(1)'])assert.equal(publicHttps(u),'')});
test('extracts public app metadata without false attribution',()=>{const html='<title>My game</title><meta name="description" content="A fun public app"><link rel="icon" href="/favicon.ico">';const a=extract(html,'https://game.caffeine.xyz/');assert.equal(a.builderAttribution,'domain-evidence');assert.equal(a.logoUrl,'https://game.caffeine.xyz/favicon.ico');const b=extract(html,'https://example.com/');assert.equal(b.builderAttribution,'unverified')});
