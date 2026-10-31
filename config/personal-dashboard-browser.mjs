import {writeFile,mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const repo=resolve('.'),dir=resolve('.icp-build/personal-browser');await mkdir(dir,{recursive:true});
const transport=resolve(dir,'transport.js'),auth=resolve(dir,'auth-client.js'),config=resolve(dir,'vite.config.mjs');
await writeFile(auth,`let signed=true,user='user-alpha';window.__testNextUser='user-beta';const identity=()=>({getPrincipal:()=>({toText:()=>user})});export class AuthClient{isAuthenticated(){return signed}getIdentity(){return identity()}subscribe(){}async signIn(){signed=true;user=window.__testNextUser;return identity()}async signOut(){signed=false}}`);
await writeFile(transport,`export const usingIcp=true,icpApiHost='https://icp-api.io';let provider;export function setIdentityProvider(fn){provider=fn}export async function administratorAccess(){const id=await provider?.();return id?.getPrincipal().toText()==='user-alpha'?{identity:id,transport:'icp'}:null}window.__testData={profile:{name:'Alice',bio:'Explorer',role:'Explorer',avatar:'🪐',website:'',github:'',interests:[]},favorites:[{href:'#/app/test-app',name:'Saved App',logo:''}]};const data=()=>window.__testData;export async function readMyData(owner){if(location.search.includes('loaderror'))throw Error('Unavailable');if(owner==='user-beta')return {profile:{name:'Bob',bio:'',role:'Explorer',avatar:'🪐',interests:[]},favorites:[]};return structuredClone(data())}export async function saveMyProfile(profile,owner){window.__testSavedProfile={profile,owner};data().profile=profile}export async function saveMyFavorites(items,owner){window.__testSavedFavorites={items,owner};data().favorites=items}export async function deleteMyData(owner){window.__testDeleted=owner;data().profile={name:'',role:'Explorer',avatar:'🪐',interests:[]};data().favorites=[]}export async function searchIcp(){return {records:[],count:0}}export async function adminRequest(){return {authenticated:true,writesEnabled:true,projects:[]}}`);
await writeFile(config,`export default {root:${JSON.stringify(resolve(repo,'web'))},base:'/',server:{fs:{allow:[${JSON.stringify(repo)}]}},plugins:[{name:'isolated-personal-account',enforce:'pre',transform(code,id){if(id.split('?')[0]===${JSON.stringify(resolve(repo,'web/src/icp-client.js'))})return {code:${JSON.stringify('export * from '+JSON.stringify(transport)+';')},map:null};if(id.split('?')[0]===${JSON.stringify(resolve(repo,'web/src/auth.js'))})return code.replace("from '@icp-sdk/auth/client'",${JSON.stringify('from '+JSON.stringify(auth))});}}]};`);
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--config',config,'--host','127.0.0.1','--port','5176','--strictPort'],{stdio:'inherit'});let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:5176/')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});
 for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:5176/#/dashboard');await page.getByRole('heading',{name:'Welcome, Alice',exact:true}).waitFor();
 assert.equal(await page.locator('.personal-stats article').first().locator('strong').textContent(),'1');
 await page.getByRole('button',{name:'Open profile menu'}).click();
 const link=page.getByRole('link',{name:'My Dashboard',exact:true});assert.equal(await link.locator('svg').count(),0);assert.equal(await page.getByRole('link',{name:'Admin Dashboard',exact:true}).isVisible(),true);
 await page.getByRole('button',{name:'Dark',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.reload();await page.getByRole('heading',{name:'Welcome, Alice',exact:true}).waitFor();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.locator('.personal-dashboard nav').getByRole('link',{name:'Profile Settings',exact:false}).click();await page.locator('#profile-name').waitFor();assert.equal(await page.locator('label[for=profile-name]').evaluate(el=>getComputedStyle(el).color),'rgb(220, 230, 245)');
 await page.locator('#profile-name').fill('Alice Updated');await page.getByRole('button',{name:'Save Profile',exact:true}).click();await page.getByText('✓ Saved on ICP',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.__testSavedProfile.profile.name),'Alice Updated');assert.equal(await page.evaluate(()=>window.__testSavedProfile.owner),'user-alpha');
 await page.locator('.personal-dashboard nav').getByRole('link',{name:'My Favorites',exact:false}).click();await page.getByRole('link',{name:'Saved App',exact:true}).waitFor();
 await page.getByRole('button',{name:'Remove Saved App from favorites',exact:true}).click();await page.getByRole('heading',{name:'Your next discovery starts here.'}).waitFor();assert.equal(await page.evaluate(()=>window.__testSavedFavorites.items.length),0);
 await page.getByRole('button',{name:'Open profile menu'}).click();await page.getByRole('button',{name:'Light',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 await page.getByRole('button',{name:'Log out',exact:true}).click();await page.getByRole('heading',{name:'My Dashboard',exact:true}).waitFor();assert.equal(await page.locator('#profile-form').count(),0);
 await page.getByRole('button',{name:'Login',exact:true}).click();await page.locator('.personal-dashboard nav').getByRole('link',{name:'Overview',exact:false}).click();await page.getByRole('heading',{name:'Welcome, Bob',exact:true}).waitFor();assert.equal(await page.getByText('Alice Updated',{exact:true}).count(),0);
 await page.getByRole('button',{name:'Open profile menu'}).click();assert.equal(await page.getByRole('link',{name:'Admin Dashboard',exact:true}).count(),0);await page.getByRole('link',{name:'My Dashboard',exact:true}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Dashboard overflow at '+width);
 await page.goto('http://127.0.0.1:5176/?loaderror#/dashboard?tab=favorites');await page.getByText('Favorites could not be loaded. Your collection has not been cleared.',{exact:true}).waitFor();
 await page.locator('.personal-dashboard nav').getByRole('link',{name:'Profile Settings',exact:false}).click();assert.equal(await page.locator('#profile-name').isDisabled(),true);
 await context.close();
 }
 console.log('Personal dashboard: account menu, theme persistence, profile save, favorite removal, account isolation, errors and responsive layouts passed.');
}finally{if(browser)await browser.close();server.kill();await rm(config,{force:true});await rm(transport,{force:true});await rm(auth,{force:true});}
