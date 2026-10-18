import { readFile } from 'node:fs/promises'
import { fetchJson, httpsUrl, clean } from '../lib.mjs'
// Source: public SNS API (https://sns-api.internetcomputer.org/openapi.json, GET /api/v2/snses, cursor via repeated `after`).
const BASE = 'https://sns-api.internetcomputer.org/api/v2/snses'
const toCandidate = (r, at) => ({
  name: clean(r.name, 80), description: clean(r.description), websiteUrl: httpsUrl(r.url || ''), logoUrl: httpsUrl(r.logo || ''),
  tags: ['sns'],
  canisters: [r.root_canister_id && { canisterId: r.root_canister_id, role: 'sns-root' }, r.ledger_canister_id && { canisterId: r.ledger_canister_id, role: 'ledger' }].filter(Boolean),
  sources: [{ sourceType: 'sns', sourceUrl: BASE, collectedAt: at }],
})
export default {
  name: 'sns',
  async collect({ fixture, now }) {
    const rows = []
    if (fixture) rows.push(...JSON.parse(await readFile(new URL('../fixtures/sns-sample.json', import.meta.url))).data)
    else {
      const seen = new Set(); let after = []
      for (let page = 0; page < 30; page++) {
        const q = new URLSearchParams({ limit: '100' }); after.forEach(a => q.append('after', a))
        const j = await fetchJson(`${BASE}?${q}`)
        const fresh = (j.data || []).filter(r => !seen.has(r.root_canister_id))
        if (!fresh.length) break                      // guard: stop if the cursor did not advance
        fresh.forEach(r => seen.add(r.root_canister_id)); rows.push(...fresh)
        if (!j.next_cursor) break
        const i = j.next_cursor.lastIndexOf(',')       // cursor looks like "<name>,<root_canister_id>"
        after = [j.next_cursor.slice(0, i), j.next_cursor.slice(i + 1)]
      }
    }
    // Only SNSes whose decentralization swap committed; aborted/pending swaps are not live projects.
    return rows.filter(r => r.swap_lifecycle?.lifecycle === 'LIFECYCLE_COMMITTED' && clean(r.name)).map(r => toCandidate(r, now))
  },
}
