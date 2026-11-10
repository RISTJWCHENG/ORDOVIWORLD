import {writeFile,mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const repo=resolve('.'),dir=resolve('.icp-build/personal-browser');await mkdir(dir,{recursive:true});
const transport=resolve(dir,'transport.js'),auth=resolve(dir,'auth-client.js'),config=resolve(dir,'vite.config.mjs');
await writeFile(auth,`let signed=true,user='user-alpha';window.__testNextUser='user-beta';const identity=()=>({getPrincipal:()=>({toText:()=>user})});export class AuthClient{isAuthenticated(){return signed}getIdentity(){return identity()}subscribe(){}async signIn(){signed=true;user=window.__testNextUser;return identity()}async signOut(){signed=false}}`);
await writeFile(transport,`export const usingIcp=true,icpApiHost='https://icp-api.io';let provider;export function setIdentityProvider(fn){provider=fn}export async function administratorAccess(){const id=await provider?.();return id?.getPrincipal().toText()==='user-alpha'?{identity:id,transport:'icp'}:null}window.__testData={profile:{name:'Alice',bio:'Explorer',role:'Explorer',avatar:'🪐',website:'',github:'',interests:[]},favorites:[{href:'#/app/test-app',name:'Saved App',logo:''}]};const data=()=>window.__testData;export async function readMyData(owner){if(location.search.includes('loaderror'))throw Error('Unavailable');if(owner==='user-beta')return {profile:{name:'Bob',bio:'',role:'Explorer',avatar:'🪐',interests:[]},favorites:[]};return structuredClone(data())}export async function saveMyProfile(profile,owner){window.__testSavedProfile={profile,owner};data().profile=profile}export async function saveMyFavorites(items,owner){window.__testSavedFavorites={items,owner};data().favorites=items}export async function deleteMyData(owner){window.__testDeleted=owner;data().profile={name:'',role:'Explorer',avatar:'🪐',interests:[]};data().favorites=[]}export async function searchIcp(){const records=window.__testCatalog||[{id:'personal-site',slug:'personal-site',name:'Personal Site',description:'An independent portfolio',categories:['Websites'],websiteUrl:'https://personal.example.org',source:'community',status:'published',tags:[],updatedAt:'2026-11-01T12:00:00Z'},{id:'game-app',slug:'game-app',name:'Game App',description:'A community game',categories:['Games'],websiteUrl:'https://game.example.org',source:'community',status:'published',tags:['sns','arcade'],updatedAt:'2026-10-30T12:00:00Z'}];return {records,count:records.length}}export async function readFeaturedIds(){return (await searchIcp()).records.map(r=>r.id).reverse()}export async function adminRequest(){return {authenticated:true,writesEnabled:true,projects:[]}}const voteStore=new Map();function voteResult(id,owner){const choices=voteStore.get(id)||new Map();return {id,up:[...choices.values()].filter(v=>v===1).length,down:[...choices.values()].filter(v=>v===-1).length,mine:choices.get(owner)||0}}export async function readAppVotes(ids,owner){return ids.map(id=>voteResult(id,owner))}export async function saveAppVote(id,vote,owner){if(!owner)throw Error('Sign in required');if(!voteStore.has(id))voteStore.set(id,new Map());voteStore.get(id).set(owner,vote);return voteResult(id,owner)}`);
await writeFile(config,`export default {root:${JSON.stringify(resolve(repo,'web'))},base:'/',server:{fs:{allow:[${JSON.stringify(repo)}]}},plugins:[{name:'isolated-personal-account',enforce:'pre',transform(code,id){if(id.split('?')[0]===${JSON.stringify(resolve(repo,'web/src/icp-client.js'))})return {code:${JSON.stringify('export * from '+JSON.stringify(transport)+';')},map:null};if(id.split('?')[0]===${JSON.stringify(resolve(repo,'web/src/auth.js'))})return code.replace("from '@icp-sdk/auth/client'",${JSON.stringify('from '+JSON.stringify(auth))});}}]};`);
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--config',config,'--host','127.0.0.1','--port','5176','--strictPort'],{stdio:'inherit'});let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:5176/')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});
 for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:5176/#/dashboard');await page.getByRole('heading',{name:'Welcome, Alice',exact:true}).waitFor();
 assert.equal(await page.locator('.personal-stats article').first().locator('strong').textContent(),'1');
 const defaultGradient=await page.locator('#auth .account-avatar-surface').first().getAttribute('style');
 await page.goto('http://127.0.0.1:5176/#/explore');await page.getByRole('heading',{name:'Featured Projects',exact:true}).waitFor();
 const gameCard=page.locator('[data-catalog-section=featured] .card').filter({hasText:'Game App'});
 await gameCard.locator('.catalog-vote-panel').waitFor();
 const launch=gameCard.getByRole('link',{name:'Launch application ↗',exact:true});
 const details=gameCard.getByRole('link',{name:'View App Details',exact:true});
 await launch.waitFor();await details.waitFor();
 assert.equal(await launch.getAttribute('href'),'https://game.example.org');
 assert.equal(await details.getAttribute('href'),'#/app/game-app');
 const left=await launch.boundingBox(),right=await details.boundingBox();
 assert.ok(Math.abs(left.y-right.y)<1&&Math.abs(left.width-right.width)<1&&left.x<right.x,'Card actions must share a row with equal widths');
 assert.equal(await gameCard.getByText('#sns',{exact:true}).count(),0);
 assert.equal(await gameCard.getByText('#arcade',{exact:true}).count(),1);
 const up=gameCard.locator('button[data-vote=up]'),down=gameCard.locator('button[data-vote=down]');
 await gameCard.getByText('No votes yet',{exact:true}).waitFor();
 const normalUp=await up.evaluate(el=>getComputedStyle(el).color),normalDown=await down.evaluate(el=>getComputedStyle(el).color);
 assert.notEqual(normalUp,normalDown);
 await up.click();await gameCard.locator('button[data-vote=up][aria-pressed=true]').waitFor();
 const selected=await up.evaluate(el=>{const s=getComputedStyle(el),icon=el.querySelector('svg');return {color:s.color,stroke:getComputedStyle(icon).stroke,background:s.backgroundColor,outline:s.outlineStyle};});
 assert.notEqual(selected.color,normalUp);assert.equal(selected.stroke,selected.color);assert.equal(selected.background,'rgba(0, 0, 0, 0)');assert.equal(selected.outline,'none');

 assert.equal(await gameCard.getAttribute('data-vote-up-count'),'1');
 await down.click();await gameCard.locator('button[data-vote=down][aria-pressed=true]').waitFor();
 assert.equal(await gameCard.getAttribute('data-vote-up-count'),'0');assert.equal(await gameCard.getAttribute('data-vote-down-count'),'1');
 await down.click();await gameCard.getByText('No votes yet',{exact:true}).waitFor();


 const search=page.getByRole('textbox',{name:'Search projects',exact:true});
 const exploreUrl=page.url();
 await page.getByRole('button',{name:'Focus search',exact:true}).click();
 assert.equal(await search.evaluate(el=>document.activeElement===el),true);
 assert.equal(page.url(),exploreUrl);
 await page.keyboard.press('/');
 assert.equal(await search.inputValue(),'/');
 await search.fill('');
 await search.blur();
 await page.keyboard.press('/');
 assert.equal(await search.evaluate(el=>document.activeElement===el),true);
 assert.equal(await search.inputValue(),'');

 if(width>=1024){const delta=await page.evaluate(()=>{const center=s=>{const r=document.querySelector(s).getBoundingClientRect();return r.y+r.height/2;};return center('#mast .catalog-store-title')-center('#mast .navrow a');});assert.ok(Math.abs(delta)<1,'Public header centers differ');}
 assert.deepEqual(await page.locator('.navrow a').allTextContents(),['Explore','Infrastructure','SNS','Community Apps','Websites','Submit Project','About']);
 assert.deepEqual((await page.locator('[data-catalog-section] h2').allTextContents()).slice(0,2),['Featured Projects','Newly Indexed']);assert.equal(await page.locator('.chips').getByRole('link',{name:'Websites',exact:true}).count(),0);
 const featured=page.locator('[data-catalog-section="featured"] .grid h3');
 await featured.first().waitFor();assert.deepEqual(await featured.allTextContents(),['Game App','Personal Site']);
 const about=page.locator('.navrow').getByRole('link',{name:'About',exact:true});
 await about.click();await page.getByRole('heading',{name:'How Featured Projects are ranked'}).waitFor();
 assert.equal(await about.getAttribute('aria-current'),'page');
 assert.deepEqual(await page.locator('.featured-weights li').allTextContents(),['Upvotes 50%','Saves 50%']);
 assert.match(await page.locator('.featured-weights-chart').evaluate(el=>getComputedStyle(el).backgroundImage),/conic-gradient/);
 await page.locator('.navrow').getByRole('link',{name:'Explore',exact:true}).click();
 const viewed=page.locator('[data-catalog-section="viewed"]');
 assert.equal(await viewed.count(),0);
 for(const id of ['personal-site','game-app','personal-site']){
  await page.locator(`[data-catalog-section="featured"] [data-project-id="${id}"] .catalog-app-details`).click();
  await page.locator('#app h1').filter({hasText:id==='game-app'?'Game App':'Personal Site'}).waitFor();
  await page.locator('.navrow').getByRole('link',{name:'Explore',exact:true}).click();
 }
 await viewed.getByRole('heading',{name:'Recently Viewed',exact:true}).waitFor();
 assert.deepEqual(await viewed.locator('h3').allTextContents(),['Personal Site','Game App']);
 await page.reload();
 await viewed.locator('h3').last().waitFor();
 assert.deepEqual(await viewed.locator('h3').allTextContents(),['Personal Site','Game App']);

 const quickResults=page.getByRole('region',{name:'Quick Explore results'});
 await search.fill('Game');
 const quickGame=quickResults.getByRole('link',{name:'Game App',exact:true});
 await quickGame.waitFor();
 assert.equal(await quickGame.locator('.logo').count(),1);
 assert.equal(await quickResults.getByRole('link').count(),1);
 const quickFieldBox=await search.boundingBox(),quickResultBox=await quickResults.boundingBox();
 assert.ok(quickResultBox.y>=quickFieldBox.y+quickFieldBox.height,'Quick results should sit under the search field');
 await search.fill('no-such-app');
 await quickResults.getByText('No matching apps.',{exact:true}).waitFor();
 await search.press('Escape');
 assert.equal(await quickResults.isVisible(),false);
 await search.fill('Game');
 await quickGame.click();
 await page.getByRole('heading',{name:'Game App',exact:true}).waitFor();
 assert.equal(await quickResults.isVisible(),false);
 await search.fill('Game');
 await search.press('Enter');
 await page.waitForURL('**/#/search?q=Game');
 await page.getByRole('heading',{name:'Search',exact:true}).waitFor();

 await page.locator('.navrow').getByRole('link',{name:'Websites',exact:true}).click();await page.getByRole('heading',{name:'Explore Websites',exact:true}).waitFor();await page.locator('#app .grid h3').filter({hasText:'Personal Site'}).waitFor();assert.deepEqual(await page.locator('#app .grid h3').allTextContents(),['Personal Site']);assert.equal(await page.locator('.navrow').getByRole('link',{name:'Websites',exact:true}).getAttribute('aria-current'),'page');assert.equal(await page.locator('.navrow').getByRole('link',{name:'Explore',exact:true}).getAttribute('aria-current'),null);
 await page.evaluate(()=>{window.__testCatalog=[];dispatchEvent(new Event('catalog:projects-updated'));});await page.getByRole('heading',{name:'No websites listed yet',exact:true}).waitFor();
 await page.goto('http://127.0.0.1:5176/#/dashboard');await page.getByRole('heading',{name:'Welcome, Alice',exact:true}).waitFor();

 const assertHeadingAligned=async selector=>{const geometry=await page.locator(selector).evaluate(el=>{const column=el.closest('.admin-main'),style=getComputedStyle(column);return {top:el.getBoundingClientRect().top,expected:column.getBoundingClientRect().top+parseFloat(style.paddingTop),margin:getComputedStyle(column).marginTop};});assert.equal(geometry.margin,'0px');assert.ok(Math.abs(geometry.top-geometry.expected)<1,'Personal heading has an extra top offset');};
 await assertHeadingAligned('.personal-heading');
 await page.getByRole('button',{name:'Open profile menu'}).click();
 const link=page.getByRole('link',{name:'My Dashboard',exact:true});assert.equal(await link.locator('svg').count(),0);assert.equal(await page.getByRole('link',{name:'Admin Dashboard',exact:true}).isVisible(),true);
 const dark=page.getByRole('button',{name:'Dark',exact:true}),box=await dark.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(await dark.getAttribute('aria-pressed'),'true');await page.mouse.up();
 await page.reload();await page.getByRole('heading',{name:'Welcome, Alice',exact:true}).waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.locator('.personal-dashboard nav').getByRole('link',{name:'Profile Settings',exact:false}).click();await page.locator('#profile-name').waitFor();await assertHeadingAligned('.profile-heading');assert.equal(await page.locator('label[for=profile-name]').evaluate(el=>getComputedStyle(el).color),'rgb(220, 230, 245)');
 await page.locator('#profile-photo-file').setInputFiles({name:'invalid.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});await page.getByText('Choose a JPEG, PNG or WebP image.',{exact:true}).waitFor();
 const source=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=320;c.height=180;const ctx=c.getContext('2d');ctx.fillStyle='#4c78b4';ctx.fillRect(0,0,320,180);return c.toDataURL('image/png').split(',')[1];});
 await page.locator('#profile-photo-file').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:Buffer.from(source,'base64')});await page.getByText('Photo ready. Select Save Profile to upload it to ICP.',{exact:true}).waitFor();
 await page.waitForFunction(()=>document.querySelector('#profile-avatar-preview img')?.naturalWidth===96);assert.deepEqual(await page.locator('#profile-avatar-preview img').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight})),{width:96,height:96});
 await page.locator('#profile-name').fill('Alice Updated');await page.getByRole('button',{name:'Save Profile',exact:true}).click();await page.getByText('✓ Saved on ICP',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.__testSavedProfile.profile.name),'Alice Updated');assert.equal(await page.evaluate(()=>window.__testSavedProfile.owner),'user-alpha');
 const photo=await page.evaluate(()=>window.__testSavedProfile.profile.avatar);assert.ok(photo.startsWith('data:image/jpeg;base64,'));assert.ok(photo.length<=21871);assert.equal(await page.locator('#auth .account-avatar-btn img').getAttribute('src'),photo);
 await page.goto('http://127.0.0.1:5176/#/explore');
 await page.locator('#auth .account-apps-btn svg.catalog-dots16').waitFor();
 const iconCenters=await page.evaluate(()=>['#auth .account-apps-btn svg','#auth .account-avatar-btn img'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top+r.height/2;}));
 assert.ok(Math.abs(iconCenters[0]-iconCenters[1])<1,'Launcher and photo centers differ');
 await page.goto('http://127.0.0.1:5176/#/dashboard?tab=profile');
 await page.getByRole('button',{name:'Remove photo',exact:true}).click();await page.getByRole('button',{name:'Save Profile',exact:true}).click();await page.waitForFunction(()=>window.__testSavedProfile.profile.avatar==='');assert.equal(await page.locator('#auth .account-avatar-surface').first().getAttribute('style'),defaultGradient);
 await page.locator('.personal-dashboard nav').getByRole('link',{name:'My Favorites',exact:false}).click();await page.getByRole('link',{name:'Saved App',exact:true}).waitFor();await assertHeadingAligned('.personal-heading');
 await page.getByRole('button',{name:'Remove Saved App from favorites',exact:true}).click();await page.getByRole('heading',{name:'Your next discovery starts here.'}).waitFor();assert.equal(await page.evaluate(()=>window.__testSavedFavorites.items.length),0);
 await page.getByRole('button',{name:'Open profile menu'}).click();await page.getByRole('button',{name:'Light',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');assert.equal(await page.getByRole('button',{name:'Light',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Log out',exact:true}).click();await page.getByRole('heading',{name:'My Dashboard',exact:true}).waitFor();assert.equal(await page.locator('#profile-form').count(),0);
 await page.getByRole('button',{name:'Login',exact:true}).click();await page.locator('.personal-dashboard nav').getByRole('link',{name:'Overview',exact:false}).click();await page.getByRole('heading',{name:'Welcome, Bob',exact:true}).waitFor();assert.equal(await page.getByText('Alice Updated',{exact:true}).count(),0);assert.notEqual(await page.locator('#auth .account-avatar-surface').first().getAttribute('style'),defaultGradient);assert.equal(await page.locator('#auth .account-avatar-btn img').count(),0);
 await page.getByRole('button',{name:'Open profile menu'}).click();assert.equal(await page.getByRole('link',{name:'Admin Dashboard',exact:true}).count(),0);await page.getByRole('link',{name:'My Dashboard',exact:true}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Dashboard overflow at '+width);
 await page.goto('http://127.0.0.1:5176/?loaderror#/dashboard?tab=favorites');await page.getByText('Favorites could not be loaded. Your collection has not been cleared.',{exact:true}).waitFor();
 await page.locator('.personal-dashboard nav').getByRole('link',{name:'Profile Settings',exact:false}).click();assert.equal(await page.locator('#profile-name').isDisabled(),true);
 await context.close();
 }
 console.log('Personal dashboard: account menu, theme persistence, profile save, favorite removal, account isolation, errors and responsive layouts passed.');
}finally{if(browser)await browser.close();server.kill();await rm(config,{force:true});await rm(transport,{force:true});await rm(auth,{force:true});}
