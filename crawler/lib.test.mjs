import test from 'node:test'
import assert from 'node:assert/strict'
import { slugify, httpsUrl, classify, mergeCandidates } from './lib.mjs'
test('slugify', () => assert.equal(slugify('Cecil The Lion DAO!'), 'cecil-the-lion-dao'))
test('httpsUrl blocks unsafe targets', () => {
  for (const u of ['http://a.com', 'https://localhost/x', 'https://127.0.0.1', 'javascript:alert(1)', 'https://[::1]/']) assert.equal(httpsUrl(u), '')
  assert.equal(httpsUrl('https://catalyze.one'), 'https://catalyze.one/')
})
test('classify', () => { assert.equal(classify('a chess game'), 'Games'); assert.equal(classify('nothing here'), '') })
test('mergeCandidates dedupes by website host', () => {
  const s = t => [{ sourceType: t, collectedAt: 'x' }]
  const m = mergeCandidates([{ name: 'A', websiteUrl: 'https://www.a.com/', tags: ['x'], canisters: [], sources: s('sns') }, { name: 'a-repo', websiteUrl: 'https://a.com/', githubUrl: 'https://github.com/o/a', tags: ['y'], canisters: [], sources: s('github') }])
  assert.equal(m.length, 1); assert.equal(m[0].name, 'A'); assert.equal(m[0].githubUrl, 'https://github.com/o/a'); assert.equal(m[0].sources.length, 2)
})
