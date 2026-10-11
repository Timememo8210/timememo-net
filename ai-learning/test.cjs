// Run against a local http.server with Playwright available on NODE_PATH.
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:1440,height:1100}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base=process.env.LIBRARY_TEST_URL || 'http://127.0.0.1:18778';
  const data=await (await page.request.get(base+'/ai-learning/data/library.json')).json();
  const check=(ok,message)=>{if(!ok)throw Error(message);console.log('PASS '+message)};
  await page.goto(base+'/ai-learning/');
  await page.waitForFunction(n=>document.querySelector('#entry-count').textContent===String(n),data.entries.length);
  check(await page.locator('.knowledge-card').count()===Math.min(24,data.entries.length),'initial pagination');
  await page.screenshot({path:'/tmp/ai-library-desktop.png',fullPage:true});
  if(data.entries.length>24){await page.locator('#more').click();check(await page.locator('.knowledge-card').count()===Math.min(48,data.entries.length),'more pagination');}
  await page.locator('[data-channel="Jeff Su"]').click();
  check((await page.locator('#results-count').textContent()).startsWith(data.entries.filter(e=>e.channels.includes('Jeff Su')).length+' 条'),'creator filter');
  await page.locator('#reset').click();
  const sample=data.entries[data.entries.length-1], [year,month,day]=sample.date.split('-');
  await page.locator('#year').selectOption(year);await page.locator('#month').selectOption(month);await page.locator('#day').selectOption(day);
  check(await page.locator('.knowledge-card').count()===data.entries.filter(e=>e.date===sample.date).length,'year month day intersection');
  await page.locator('#reset').click();await page.locator('#search').fill('RAG');await page.waitForTimeout(400);
  check(await page.locator('.knowledge-card').count()>0,'full text RAG search');
  await page.locator('#search').fill('不存在的词xyz987');await page.waitForTimeout(400);check(await page.locator('#empty').isVisible(),'empty state');
  await page.locator('#empty-reset').click();await page.locator('[data-view="issues"]').click();
  check((await page.locator('#results-count').textContent()).includes(data.issues.length+' 篇'),'issue archives');
  const graph=data.entries.find(e=>e.reading==='图文精读');
  await page.goto(base+'/ai-learning/?entry='+graph.id);await page.waitForSelector('dialog[open]');
  const imgs=page.locator('dialog img');check(await imgs.count()===2,'graph notes two diagrams');
  for(const img of await imgs.all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
  check(await imgs.evaluateAll(items=>items.every(i=>i.naturalWidth>0)),'diagrams load');
  await page.locator('#reader').evaluate(el=>el.scrollTop=0);await page.screenshot({path:'/tmp/ai-library-reader.png'});
  await page.keyboard.press('Escape');check(await page.locator('dialog').isHidden(),'escape closes reader');
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/ai-learning/');
  await page.waitForFunction(n=>document.querySelector('#entry-count').textContent===String(n),data.entries.length);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no horizontal overflow');
  await page.screenshot({path:'/tmp/ai-library-mobile.png',fullPage:true});
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#catalog-results a[href="/ai-learning/"]'));
  check(await page.locator('#catalog-results a[href="/ai-learning/"]').count()===1,'homepage directory entry');
  check(await page.locator('.recent-list a[href="/ai-learning/"]').count()===1,'homepage recent entry');
  check(errors.length===0,'no JavaScript errors: '+errors.join(','));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
