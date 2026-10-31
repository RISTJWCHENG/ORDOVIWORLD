import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5175','--strictPort'],{stdio:'inherit',env:{...process.env,PUBLIC_BASE_PATH:'/'}});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:5175/')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  await page.goto('http://127.0.0.1:5175/');
  await page.locator('#auth button').first().waitFor();
  await page.evaluate(()=>{window.__modeDocument='retained';location.hash='/admin';});
  await page.locator('body.admin-mode').waitFor();
  assert.equal(await page.locator('#mast .catalog-store-title').isVisible(),true);
  assert.equal(await page.locator('#auth').isVisible(),true);assert.equal(await page.locator('.account-apps-btn').isVisible(),false);assert.equal(await page.locator('.admin-header-breadcrumb').isVisible(),true);
  assert.equal(await page.locator('#mast .navrow').isVisible(),false);
  assert.equal(await page.locator('#mast .sbar').isVisible(),false);
  assert.equal(await page.locator('footer').isVisible(),false);
  const divider=await page.locator('body').evaluate(el=>{const s=getComputedStyle(el,'::before');return {display:s.display,top:s.top,bottom:s.bottom,left:s.left};});
  if(width>=1024)assert.deepEqual(divider,{display:'block',top:'0px',bottom:'0px',left:'308px'});else assert.equal(divider.display,'none');
  assert.equal(await page.locator('body>header').evaluate(el=>getComputedStyle(el).borderBottomWidth),'0px');
  assert.ok(await page.locator('#app').evaluate(el=>el.getBoundingClientRect().width>innerWidth-50));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(context.pages().length,1);assert.equal(await page.evaluate(()=>window.__modeDocument),'retained');
  await page.locator('#mast .catalog-store-title a').click();
  await page.waitForFunction(()=>!document.body.classList.contains('admin-mode'));
  assert.equal(await page.locator('#mast .navrow').isVisible(),true);assert.equal(await page.locator('.account-apps-btn').isVisible(),true);assert.equal(await page.locator('.admin-header-breadcrumb').isVisible(),false);
  assert.equal(await page.locator('footer').isVisible(),true);
  assert.equal(await page.evaluate(()=>window.__modeDocument),'retained');
  await context.close();
 }
 console.log('In-place administrator mode: shared branding/account controls, hidden public shell, full width, same document, responsive layout and return navigation passed.');
}finally{if(browser)await browser.close();vite.kill();}
