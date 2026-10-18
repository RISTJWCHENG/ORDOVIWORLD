import {searchProjectsV3} from './cloud-search.js';
import { loadPublishedProjects } from './cloud-data.js'
import { renderProfile, initProfile } from './profile.js'

const CATS=['Games','DeFi','AI','Social','NFT','DAO','Developer Tools','Infrastructure','Other'],GENRES=['Casual','Strategy','Puzzle','Multiplayer','Adventure','Other'];
// ALL RECORDS ARE FICTIONAL DEMO DATA
const DEMO=[
['Demo Orbit Wallet','Sample wallet listing used to demonstrate DeFi cards and filters.',['DeFi'],['wallet','tokens']],
['Demo Nebula Swap','Placeholder exchange record showing search by tags.',['DeFi'],['swap','liquidity']],
['Demo Pulsar Chat','Fictional social app to demonstrate the Social category.',['Social'],['chat','messaging'],{id:'claimed'}],
['Demo Comet Notes','Example AI notes assistant record.',['AI'],['notes','assistant','llm']],
['Demo Quasar DAO','Sample governance tool listing.',['DAO'],['voting','governance'],{id:'verified',ver:'2026-10-01'}],
['Demo Starforge SDK','Pretend developer toolkit for building canister frontends.',['Developer Tools'],['sdk','typescript'],{gh:'https://github.com/example/starforge'}],
['Demo Gravity Index','Fictional indexer record under Infrastructure.',['Infrastructure'],['indexer','api']],
['Demo Lunar Gallery','Example NFT gallery listing.',['NFT'],['art','collectibles']],
['Demo Asteroid Rush','Fictional casual arcade game used to demonstrate game cards.',['Games'],['arcade','casual'],{genre:'Casual',play:1}],
['Demo Cosmic Chess','Fictional strategy game record without a verified launch URL.',['Games'],['board','strategy'],{genre:'Strategy'}],
['Demo Rift Runners','Fictional multiplayer game record.',['Games'],['multiplayer','pvp'],{genre:'Multiplayer',play:1}],
['Demo Starfall Puzzle','Fictional puzzle game record.',['Games'],['puzzle','relaxing'],{genre:'Puzzle'}]
].map((a,i)=>{const slug=a[0].toLowerCase().replace(/[^a-z0-9]+/g,'-'),x=a[4]||{};return{name:a[0],desc:a[1],cats:a[2],tags:a[3],slug,url:'https://example.com/'+slug,play:x.play?'https://example.com/'+slug+'/play':'',gh:x.gh||'',genre:x.genre||'',idn:x.id||'discovered',demo:true,cans:[],srcs:[{t:'demo',u:'',at:'2026-10-01'}],ver:x.ver||'',upd:'2026-10-'+String(i+2).padStart(2,'0')}});
let P=DEMO;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IDN={discovered:'Automatically discovered',claimed:'Developer claimed',verified:'Verified identity'};
const safe=u=>{try{return new URL(u).protocol==='https:'}catch(e){return false}};
const ext=(u,t,p)=>u?`<a class="btn ${p?'p':''}" href="${esc(u)}" target="_blank" rel="noopener noreferrer nofollow">${t} ↗</a>`:`<span class="btn off" title="No verified URL">${t}</span>`;
const logo=(p,s=48)=>`<div class="logo" style="width:${s}px;height:${s}px" aria-hidden="true">${safe(p.logoUrl)?`<img class="ordosyn-project-logo" src="${esc(p.logoUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}<span class="ordosyn-logo-initial">${esc(p.name.replace('Demo ','')[0])}</span></div>`;
document.addEventListener('error',e=>{if(e.target?.classList?.contains('ordosyn-project-logo'))e.target.remove()},true);
const card=(p,big)=>`<article class="card glass">${big?'<div class="cover" aria-hidden="true"></div>':''}<div class="row">${logo(p)}<div><h3><a href="#/app/${p.slug}">${esc(p.name)}</a></h3><p class="mute" style="font-size:12px">${esc(p.cats.join(', '))}${p.genre?' · '+p.genre:''}</p></div></div><p class="mute" style="font-size:14px">${esc(p.desc)}</p><div class="row" style="flex-wrap:wrap;gap:4px">${p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}${p.demo?'<span class="tag demo">Demo data</span>':''}</div><div class="acts">${big?ext(p.play,'Play Now',1):ext(p.url,'Visit Website',1)}<a class="btn" href="#/app/${p.slug}">Project Details</a></div></article>`;
const grid=(l,big)=>`<div class="grid">${l.map(p=>card(p,big)).join('')}</div>`;
const chips=(items,cur,key,extra='')=>`<div class="chips" role="group" aria-label="Filters"><a class="btn ${!cur?'on':''}" href="#${extra}" data-k="${key}" data-v="">All</a>${items.map(c=>`<a class="btn ${cur===c?'on':''}" href="#" data-k="${key}" data-v="${esc(c)}" aria-pressed="${cur===c}">${esc(c)}</a>`).join('')}</div>`;
const sbar=(v='')=>`<form class="sbar" role="search" id="sf"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input name="q" value="${esc(v)}" aria-label="Search projects" aria-keyshortcuts="/" placeholder="Explore the Internet Computer Universe." autocomplete="off"><kbd aria-hidden="true">/</kbd></form>`;
const NAV=[['/explore','Explore'],['/games','Games'],['/categories','Categories'],['/search?sort=updated','Newly Indexed'],['/submit','Submit Project']];
const navRow=()=>`<nav class="navrow" aria-label="Main">${NAV.map(([h,t])=>`<a href="#${h}">${t}</a>`).join('')}</nav>`;
const noteHTML=()=>P===DEMO?'<p class="note">All listings are fictional demo data until the crawler has collected and you have approved real projects.</p>':'<p class="note">Collected automatically from public sources and reviewed before publishing. A listing is not an endorsement or a security audit.</p>';
const sec=(t,h)=>`<section><h2>${t}</h2>${h}</section>`;
function query(h){const q={};(h.split('?')[1]||'').split('&').filter(Boolean).forEach(s=>{const[k,v]=s.split('=');q[k]=decodeURIComponent(v||'')});return q}
function find(o){const t=(o.q||'').toLowerCase().split(/\s+/).filter(Boolean);let r=P.filter(p=>(!o.cat||p.cats.includes(o.cat))&&(!o.genre||p.genre===o.genre)).map(p=>{let s=0;for(const w of t){const h=x=>x.toLowerCase().includes(w);let m=0;if(p.name.toLowerCase()===w)m+=10;else if(h(p.name))m+=6;if(p.cats.some(h)||p.tags.some(h))m+=4;if(h(p.desc))m+=2;if(!m){s=0;break}s+=m}return{p,s:t.length?s:1}}).filter(x=>x.s>0);
const S=o.sort;r.sort(S==='alpha'?(a,b)=>a.p.name.localeCompare(b.p.name):S==='updated'?(a,b)=>b.p.upd.localeCompare(a.p.upd):(a,b)=>b.s-a.s||a.p.name.localeCompare(b.p.name));return r.map(x=>x.p)}
function pager(n,pg,size,base){const pages=Math.ceil(n/size);if(pages<2)return'';return`<nav class="pg" aria-label="Pagination"><a class="btn ${pg<=1?'off':''}" href="#${base}&page=${pg-1}">‹ Prev</a>Page ${pg} of ${pages}<a class="btn ${pg>=pages?'off':''}" href="#${base}&page=${pg+1}">Next ›</a></nav>`}
const V={
profile(){return renderProfile()},
home(){const rec=[...P].sort((a,b)=>b.upd.localeCompare(a.upd)).slice(0,3);return`<div style="max-width:760px;margin:0 auto">${noteHTML()}</div>`+
sec('Explore Categories',`<div class="chips">${CATS.map(c=>`<a class="btn" href="#/explore?cat=${encodeURIComponent(c)}">${c}</a>`).join('')}</div>`)+sec('Featured Projects',grid(P.filter(p=>p.idn!=='discovered').concat(P.slice(0,3)).slice(0,3)))+sec('Trending Projects','<p class="mute" style="font-size:14px;margin-bottom:12px">Demo ordering only. Real trending needs real usage data.</p>'+grid(P.slice(3,6)))+sec('Recently Discovered',grid(rec))+sec('Discover ICP Games',grid(P.filter(p=>p.genre).slice(0,3),1))+sec('Join the Ecosystem','<div class="glass card" style="flex-direction:row;align-items:center;flex-wrap:wrap"><p class="mute" style="flex:1">Building on ICP? Submit your project for review. Basic listings are free.</p><a class="btn p" href="#/submit">Submit Project</a></div>')},
search(q){const pg=+q.page||1,sort=q.sort||'relevance',all=find({...q,sort}),sl=all.slice((pg-1)*6,pg*6),b=`/search?q=${encodeURIComponent(q.q||'')}&cat=${encodeURIComponent(q.cat||'')}&sort=${sort}`;
return`<div class="page"><h1>Search</h1><div class="row" style="margin-top:20px;flex-wrap:wrap;gap:16px">${chips(CATS,q.cat,'cat')}<label style="margin-left:auto;display:flex;gap:8px;align-items:center;margin:0">Sort <select id="sort" style="width:auto"><option value="relevance">Relevance</option><option value="alpha"${sort==='alpha'?' selected':''}>A–Z</option><option value="updated"${sort==='updated'?' selected':''}>Recently updated</option></select></label></div><div style="margin-top:24px" aria-live="polite" id="remote-search-results"><p class="mute" style="font-size:14px;margin-bottom:12px">${all.length} result${all.length===1?'':'s'}${q.q?` for “${esc(q.q)}”`:''}</p>${all.length?grid(sl)+pager(all.length,pg,6,b):'<p class="glass card mute" style="padding:40px;text-align:center">No projects match yet. Try a different keyword or clear the filters.</p>'}</div></div>`},
explore(q){const pg=+q.page||1,all=find({cat:q.cat,sort:'alpha'});return`<div class="page" id="cats"><h1>Explore</h1>${noteHTML()}${chips(CATS,q.cat,'cat')}<div style="margin-top:24px">${all.length?grid(all.slice((pg-1)*9,pg*9))+pager(all.length,pg,9,`/explore?cat=${encodeURIComponent(q.cat||'')}`):'<p class="glass card mute" style="padding:40px;text-align:center">No projects in this category yet.</p>'}</div></div>`},
games(q){const l=find({cat:'Games',genre:q.genre,sort:'alpha'});return`<div class="page"><h1>ICP Games</h1>${noteHTML()}${chips(GENRES,q.genre,'genre')}<p class="mute" style="font-size:14px;margin:12px 0 24px">“Play Now” appears only when a verified launch URL exists. Games open in a new tab, not an iframe.</p>${l.length?grid(l,1):'<p class="glass card mute" style="padding:40px;text-align:center">No games in this genre yet.</p>'}</div>`},
app(slug){const p=P.find(x=>x.slug===slug);if(!p)return'<p style="padding:80px 0;text-align:center">Project not found. <a href="#/explore" style="text-decoration:underline">Browse all projects</a></p>';const rel=P.filter(x=>x!==p&&x.cats.some(c=>p.cats.includes(c))).slice(0,3);
return`<div class="page"><div class="cover" style="height:110px" aria-hidden="true"></div><div class="row" style="margin-top:24px;flex-wrap:wrap;gap:16px">${logo(p,64)}<div><h1 style="font-size:26px;font-weight:600">${esc(p.name)}</h1><div class="row" style="gap:6px;margin-top:6px"><span class="tag">${IDN[p.idn]}</span>${p.demo?'<span class="tag demo">Demo data</span>':''}</div></div><div class="row" style="margin-left:auto">${ext(p.play||p.url,'Launch application',1)}${ext(p.gh,'GitHub')}</div></div><p class="mute" style="max-width:760px;margin-top:24px">${esc(p.desc)}</p><p class="note" style="max-width:760px;margin:24px 0">Being listed does not mean this project is safe, audited, or endorsed. “Verified identity” only means ownership was proven.</p><dl><div><dt>Category & tags</dt><dd>${esc(p.cats.join(', '))} · ${p.tags.map(t=>'#'+esc(t)).join(' ')}</dd></div><div><dt>Official website</dt><dd>${esc(p.url)}</dd></div><div><dt>Related canister IDs</dt><dd>${p.cans.length?p.cans.map(c=>esc(c.id)+' ('+esc(c.role)+')').join(', '):'None recorded'}</dd></div><div><dt>Data sources</dt><dd>${p.srcs.map(x=>esc(x.t)+', collected '+esc(String(x.at).slice(0,10))).join('; ')||'None'}</dd></div><div><dt>Last website check</dt><dd>${p.ver?esc(p.ver.slice(0,10))+' ('+esc(p.websiteStatus||'up')+')':'Not checked'}</dd></div><div><dt>Developer claim</dt><dd>${{discovered:'Unclaimed',claimed:'Claimed, pending proof review',verified:'Claimed and verified'}[p.idn]}</dd></div></dl>${rel.length?sec('Related projects',grid(rel)):''}</div>`},
submit(){return`<div class="page"><h1>Submit a project</h1><p class="mute" style="margin-bottom:24px">Submissions go to a review queue. Nothing is published automatically.</p><form class="f" id="sub" novalidate>${[['name','Project name'],['website','Official website','url'],['description','Description','area'],['category','Category','sel'],['logo','Logo URL','url',1],['github','GitHub URL','url',1],['canister','Canister ID','text',1],['contact','Contact email (private)','email']].map(([n,l,t='text',o])=>`<div><label for="${n}">${l}${o?' <span class="mute">(optional)</span>':''}</label>${t==='area'?`<textarea id="${n}" name="${n}" rows="4"></textarea>`:t==='sel'?`<select id="${n}" name="${n}">${CATS.map(c=>`<option>${c}</option>`).join('')}</select>`:`<input id="${n}" name="${n}" type="${t}">`}<p class="err" id="e-${n}" role="alert"></p></div>`).join('')}<input name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none"><button class="btn p" style="justify-content:center">Submit for review</button><p id="res" role="status" class="glass card" hidden></p></form></div>`},
categories(){return`<div class="page"><h1>Categories</h1><div class="grid">${CATS.map(c=>`<a class="card" href="#/explore?cat=${encodeURIComponent(c)}"><h3>${c}</h3><p class="mute">${P.filter(p=>p.cats.includes(c)).length} listing${P.filter(p=>p.cats.includes(c)).length===1?'':'s'}</p></a>`).join('')}</div></div>`},
about(){return`<div class="page" style="max-width:760px"><h1>About Ordovician Search</h1><p style="font-size:18px">Making the Internet Computer ecosystem easier to discover, explore, and grow.</p><h2 style="margin-top:32px;font-size:20px">Discovery is not endorsement</h2><p class="mute" style="margin-top:8px">Some listings are found automatically from public sources, with the source and collection time recorded. Others are claimed by developers, and a few have a verified identity. None of these labels means a project is safe or audited.</p></div>`},
admin(){return`<div class="page"><h1>Admin (demo shell)</h1><p class="note">Demo only. No login and no privileged actions. Real moderation must be enforced by a backend on every request.</p><div class="grid">${['Pending submissions','Discovered project queue','Duplicate review','Developer claims','Broken link monitor','Source sync status'].map(t=>`<div class="glass card"><h2 style="font-size:16px">${t}</h2><p class="mute" style="font-size:14px">Backend not connected</p><button class="btn" disabled>Approve / reject (disabled)</button></div>`).join('')}</div></div>`}};
const app=document.getElementById('app');
const mast=document.getElementById('mast');
(()=>{const C=['#2F6BFF','#E5484D','#E8920C','#12A594','#8E4EC6','#E93D82','#3E63DD','#30A46C','#F76B15','#0091FF','#D6409F','#5B5BD6','#E54D2E','#00A2C7','#46A758','#CE2C31'];let k=0;
mast.innerHTML=`<h1><a href="#/" aria-label="Ordosyn, home">${[...'Ordosyn'].map(c=>c===' '?' ':`<span aria-hidden="true" style="color:${C[k++]}">${c}</span>`).join('')}</a></h1><p class="mute">Discover the next generation of apps, games, and decentralized experiences built on the Internet Computer.</p>${sbar()}${navRow()}`})();

function route(){const h=location.hash.slice(1)||'/',path=h.split('?')[0],q=query(h),seg=path.split('/')[1]||'home';
const mi=mast.querySelector('input');if(mi)mi.value=seg==='search'?(q.q||''):'';app.innerHTML=(seg==='app'?V.app(path.split('/')[2]):(V[seg]||(()=>'<p style="padding:80px 0;text-align:center">Nothing here. <a href="#/" style="text-decoration:underline">Back home</a></p>'))(q));
if(seg==='search') void remoteSearch(q,location.hash);
document.title=seg==='home'?'Ordovician Search — Explore the Internet Computer Universe':'Ordovician Search · '+seg;window.scrollTo({top:0,left:0,behavior:'instant'});
document.querySelectorAll('.navrow a').forEach(a=>a.classList.toggle('on',a.getAttribute('href').split('?')[0]==='#/'+seg))}
app.addEventListener('click',e=>{const a=e.target.closest('[data-k]');if(!a)return;e.preventDefault();const q=query(location.hash.slice(1)),path=location.hash.slice(1).split('?')[0]||'/';q[a.dataset.k]=a.dataset.v;delete q.page;location.hash=path+'?'+Object.entries(q).filter(([,v])=>v).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')});
app.addEventListener('change',e=>{if(e.target.id!=='sort')return;const q=query(location.hash.slice(1));q.sort=e.target.value;delete q.page;location.hash='/search?'+Object.entries(q).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;
if(f.id==='sf'){location.hash='/search?q='+encodeURIComponent(f.q.value.trim());return}
if(f.id==='sub'){const d=Object.fromEntries(new FormData(f)),x={};if(d.company)return;
if(d.name.trim().length<2)x.name='Enter the project name.';if(!safe(d.website))x.website='Enter a full https:// URL.';if(d.description.trim().length<20)x.description='Describe the project in at least 20 characters.';
if(d.github&&!safe(d.github))x.github='Enter a full https:// URL.';if(d.logo&&!safe(d.logo))x.logo='Enter a full https:// URL.';if(d.canister&&!/^([a-z0-9]{5}-){4}cai$|^([a-z0-9]{5}-){2,}[a-z0-9]{3}$/.test(d.canister))x.canister='Canister IDs look like xxxxx-xxxxx-xxxxx-xxxxx-cai.';if(!/^\S+@\S+\.\S+$/.test(d.contact))x.contact='Enter a valid email. It stays private.';
['name','website','description','github','logo','canister','contact'].forEach(n=>document.getElementById('e-'+n).textContent=x[n]||'');
const r=document.getElementById('res');if(Object.keys(x).length){r.hidden=true;return}
r.hidden=false;r.textContent='This standalone demo has no backend, so nothing was saved or submitted.'}});
addEventListener('hashchange',route);
addEventListener('ordovician:auth-changed', () => { if (location.hash.startsWith('#/profile')) route() });
initProfile();
async function remoteSearch(q, startedHash) {
  const term = String(q.q || '').trim();
  const page = Math.max(1, Math.floor(Number(q.page) || 1));
  try {
    const result = await searchProjectsV3(term, q.cat || '', page, 6);
    if (!result || location.hash !== startedHash) return;
    const target = document.getElementById('remote-search-results');
    if (!target) return;
    const items = (Array.isArray(result.records) ? result.records : []).map(fromRecord);
    for (const p of items) {
      if (!P.some(existing => existing.slug === p.slug)) P.push(p);
    }
    const total = Math.max(0, Number(result.count) || 0);
    const base = `/search?q=${encodeURIComponent(term)}&cat=${encodeURIComponent(q.cat || '')}&sort=${encodeURIComponent(q.sort || 'relevance')}`;

    // Keep user input OUT of HTML strings to prevent mojibake, broken templates and injection.
    target.replaceChildren();
    const summary = document.createElement('p');
    summary.className = 'mute';
    summary.style.cssText = 'font-size:14px;margin-bottom:12px';
    summary.textContent = `${total} indexed result${total === 1 ? '' : 's'}${term ? ` for "${term}"` : ''}`;
    target.appendChild(summary);

    const content = document.createElement('div');
    content.innerHTML = items.length
      ? grid(items) + pager(total, page, 6, base)
      : '<p class="glass card mute" style="padding:40px;text-align:center">No matching indexed projects yet. Check the spelling or try a shorter keyword.</p>';
    target.appendChild(content);
  } catch (err) {
    console.warn('Remote search unavailable; using the local catalog.', err);
  }
}
// Real data: only records you approved (web/public/projects.json). Falls back to labeled demo data when none exist.
const fromRecord=r=>({name:String(r.name||'').slice(0,80),desc:String(r.description||''),cats:r.categories&&r.categories.length?r.categories.filter(c=>CATS.includes(c)):['Other'],tags:(r.tags||[]).slice(0,5).map(String),slug:String(r.slug||'').replace(/[^a-z0-9-]/g,''),url:safe(r.websiteUrl)?r.websiteUrl:'',play:'',gh:safe(r.githubUrl)?r.githubUrl:'',genre:'',idn:['claimed','verified'].includes(r.identity)?r.identity:'discovered',ver:r.lastVerifiedAt||'',websiteStatus:r.websiteStatus||'unchecked',logoUrl:safe(r.logoUrl)?r.logoUrl:'',upd:String(r.updatedAt||'').slice(0,10),demo:false,cans:(r.canisters||[]).map(c=>({id:String(c.canisterId),role:String(c.role)})),srcs:(r.sources||[]).map(x=>({t:String(x.sourceType),u:x.sourceUrl,at:String(x.collectedAt)}))});
loadPublishedProjects().then(r=>r.ok?r.json():null).then(j=>{const l=((j&&j.records)||[]).filter(r=>r.status==='published'&&r.slug).map(fromRecord);if(l.length)P=l}).catch(()=>{}).finally(route);
addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){const i=document.querySelector('.sbar input');if(i){e.preventDefault();i.focus()}}});
