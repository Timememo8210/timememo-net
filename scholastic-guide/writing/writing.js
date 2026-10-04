'use strict';
const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const allowedLanguages=['zh','en','both'];
let lang=new URLSearchParams(location.search).get('lang')||storage.get('scholastic-guide-language')||'zh';
if(!allowedLanguages.includes(lang))lang='zh';
function bilingual(zh,en){const outer=document.createElement('span');outer.className='bi';for(const [l,t] of [['zh-CN',zh],['en',en]]){const s=document.createElement('span');s.lang=l;s.textContent=t;outer.append(s)}return outer}
function setLanguage(value){lang=value;document.body.dataset.language=value;document.documentElement.lang=value==='en'?'en':'zh-CN';document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===value)));storage.set('scholastic-guide-language',value);const url=new URL(location.href);url.searchParams.set('lang',value);history.replaceState(null,'',url);document.title=value==='en'?'Scholastic Writing & Winners · TimeMemo':'Scholastic 写作与获奖范文 · TimeMemo'}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));setLanguage(lang);
