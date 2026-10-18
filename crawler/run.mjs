#!/usr/bin/env node
// Discovery pipeline: collect -> parse -> dedupe -> classify -> site check -> store as PENDING (never auto-published).
import { readFile, writeFile } from 'node:fs/promises'
import { mergeCandidates, classify, slugify, checkSite, pool } from './lib.mjs'
import sns from './adapters/sns.mjs'
import github from './adapters/github.mjs'

const STORE = new URL('../data/projects.json', import.meta.url)
const args = process.argv.slice(2), has = f => args.includes(f)
const only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean)
const adapters = [sns, github].filter(a => !only.length || only.includes(a.name))
const now = new Date().toISOString()
const ctx = { env: process.env, fixture: has('--fixture'), now }

const prev = new Map()
try { for (const r of JSON.parse(await readFile(STORE)).records) prev.set(r.id, r) } catch {}

const cands = []
for (const a of adapters) {
  try { const c = await a.collect(ctx); console.log(`[${a.name}] ${c.length} candidates`); cands.push(...c) }
  catch (e) { console.error(`[${a.name}] failed: ${e.message}`) }    // one broken source must not stop the run
}
const merged = mergeCandidates(cands)
const records = merged.map(c => {
  const canisterHost = /^[a-z0-9]{5}-.*-cai\./.test(c.key)                 // ICP-hosted frontends: a host slug is unreadable, so use name + canister prefix
  const id = canisterHost ? `${slugify(c.name)}-${c.key.slice(0, 5)}` : slugify(c.key.replace(/^gh:https?:\/\/github\.com\//, '').replace(/^n:/, ''))
  const old = prev.get(id) || {}
  const cat = classify(`${c.name} ${c.description} ${c.tags.join(' ')}`) || (c.sources.some(s => s.sourceType === 'sns') ? 'DAO' : 'Other')
  const seenC = new Map(); c.canisters.forEach(x => seenC.set(x.canisterId, x))
  return { id, name: c.name, slug: id, description: c.description, logoUrl: c.logoUrl || '', websiteUrl: c.websiteUrl || '', githubUrl: c.githubUrl || '',
    categories: [cat], categorySource: 'heuristic', tags: c.tags,
    status: old.status || 'pending', identity: old.identity || 'discovered',   // review decisions and claims survive re-crawls
    canisters: [...seenC.values()], sources: c.sources,
    createdAt: old.createdAt || now, updatedAt: now, lastVerifiedAt: old.lastVerifiedAt || '', websiteStatus: old.websiteStatus || 'unchecked' }
})
if (!has('--no-check') && !has('--fixture')) {
  await pool(records.filter(r => r.websiteUrl), 6, async r => {
    r.websiteStatus = await checkSite(r.websiteUrl)
    if (r.websiteStatus === 'up') r.lastVerifiedAt = now
  })
}
const seen = new Set(records.map(r => r.id))
for (const [id, r] of prev) if (!seen.has(id)) records.push(r)             // keep records not seen this run (not deleted)
records.sort((a, b) => a.name.localeCompare(b.name))
await writeFile(STORE, JSON.stringify({ generatedAt: now, records }, null, 2))
const by = s => records.filter(r => r.status === s).length
console.log(`stored ${records.length} records (pending ${by('pending')}, published ${by('published')}, rejected ${by('rejected')})`)
