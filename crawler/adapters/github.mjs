import { fetchJson, httpsUrl, clean, hostOf, GENERIC_HOSTS } from '../lib.mjs'
// Source: GitHub REST search API (public repos tagged with the `internet-computer` topic that publish a homepage).
export default {
  name: 'github',
  async collect({ env, now }) {
    const out = [], pages = Number(env.GITHUB_PAGES || 3), minStars = Number(env.GITHUB_MIN_STARS || 2)
    const headers = { Accept: 'application/vnd.github+json', ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}) }
    for (let p = 1; p <= pages; p++) {
      const j = await fetchJson(`https://api.github.com/search/repositories?q=${encodeURIComponent('topic:internet-computer')}&sort=updated&per_page=100&page=${p}`, { headers })
      for (const it of j.items || []) {
        const site = httpsUrl(it.homepage || '')
        if (it.fork || it.archived || !site || GENERIC_HOSTS.test(hostOf(site)) || it.stargazers_count < minStars) continue
        out.push({ name: clean(it.name, 80), description: clean(it.description), websiteUrl: site, githubUrl: it.html_url, tags: (it.topics || []).filter(t => t !== 'internet-computer').slice(0, 6), canisters: [], sources: [{ sourceType: 'github', sourceUrl: it.html_url, collectedAt: now }] })
      }
      if ((j.items || []).length < 100) break
    }
    return out
  },
}
