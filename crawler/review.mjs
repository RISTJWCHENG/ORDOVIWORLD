#!/usr/bin/env node
// Moderation CLI. Only records you approve here are exported to web/public/projects.json.
//   node crawler/review.mjs list [pending|published|rejected]
//   node crawler/review.mjs approve <id...> | --source=sns [--up-only]
//   node crawler/review.mjs reject <id...>
import { readFile, writeFile } from 'node:fs/promises'
const STORE = new URL('../data/projects.json', import.meta.url), PUB = new URL('../web/public/projects.json', import.meta.url)
const [cmd = 'list', ...rest] = process.argv.slice(2)
const db = JSON.parse(await readFile(STORE)), flag = k => (rest.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1]
const ids = rest.filter(a => !a.startsWith('--'))
const pick = r => ids.includes(r.id) || (flag('source') && r.sources.some(s => s.sourceType === flag('source')) && (!rest.includes('--up-only') || r.websiteStatus === 'up'))
if (cmd === 'list') {
  const st = ids[0] || 'pending'
  for (const r of db.records.filter(r => r.status === st)) console.log(`${r.id.padEnd(32)} ${r.categories[0].padEnd(16)} ${r.websiteStatus.padEnd(9)} ${r.websiteUrl}`)
} else if (cmd === 'approve' || cmd === 'reject') {
  let n = 0
  for (const r of db.records) if (pick(r)) { r.status = cmd === 'approve' ? 'published' : 'rejected'; n++ }
  await writeFile(STORE, JSON.stringify(db, null, 2)); console.log(`${cmd}: ${n} record(s)`)
} else { console.error('unknown command'); process.exit(1) }
await writeFile(PUB, JSON.stringify({ generatedAt: new Date().toISOString(), records: db.records.filter(r => r.status === 'published') }, null, 2))
