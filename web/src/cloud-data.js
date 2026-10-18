// Load published D1 index via Cloudflare Worker; fall back to existing static JSON.
export async function loadPublishedProjects() {
  const base = import.meta.env.BASE_URL;
  try {
    const cfgResponse = await fetch(base + 'api-config.json', {cache:'no-store'});
    if (cfgResponse.ok) {
      const cfg = await cfgResponse.json();
      if (typeof cfg.apiBaseUrl === 'string' && /^https:\/\/[a-z0-9.-]+\.workers\.dev\/?$/i.test(cfg.apiBaseUrl)) {
        const res = await fetch(cfg.apiBaseUrl.replace(/\/$/,'') + '/api/projects', {cache:'no-store'});
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.records) && data.records.length) return data;
        }
      }
    }
  } catch (error) { console.warn('Cloudflare API not available, using static catalog',error); }
  try {
    const local = await fetch(base + 'projects.json', {cache:'no-cache'});
    return local.ok ? local.json() : {records:[]};
  } catch { return {records:[]}; }
}
