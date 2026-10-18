// Load live index from Worker so Explore / Categories / Games and Search
// all read the same source of truth.
export async function loadPublishedProjects() {
  const base = import.meta.env.BASE_URL;

  try {
    const cfgResponse = await fetch(base + 'api-config.json', { cache: 'no-store' });

    if (cfgResponse.ok) {
      const cfg = await cfgResponse.json();
      const apiBaseUrl =
        typeof cfg.apiBaseUrl === 'string'
          ? cfg.apiBaseUrl.replace(/\/$/, '')
          : '';

      if (/^https:\/\/[a-z0-9.-]+\.workers\.dev$/i.test(apiBaseUrl)) {
        // Prefer the live search index because it already contains the newest
        // published records, including category data such as "Caffeine Apps".
        const liveSearch = await fetch(
          apiBaseUrl + '/api/search?page=1&limit=500',
          { cache: 'no-store' }
        );

        if (liveSearch.ok) {
          const searchData = await liveSearch.json();
          if (Array.isArray(searchData.records)) {
            return { records: searchData.records };
          }
        }

        // Fallback to /api/projects if present
        const res = await fetch(apiBaseUrl + '/api/projects', {
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.records)) {
            return data;
          }
        }
      }
    }
  } catch (error) {
    console.warn('Cloudflare API not available, using static catalog', error);
  }

  try {
    const local = await fetch(base + 'projects.json', { cache: 'no-cache' });
    return local.ok ? local.json() : { records: [] };
  } catch {
    return { records: [] };
  }
}
