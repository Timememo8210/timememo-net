'use strict';
const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const allowedLanguages=['zh','en','both'];
let lang=new URLSearchParams(location.search).get('lang')||storage.get('scholastic-guide-language')||'zh';
if(!allowedLanguages.includes(lang))lang='zh';
function bilingual(zh,en){const outer=document.createElement('span');outer.className='bi';for(const [l,t] of [['zh-CN',zh],['en',en]]){const s=document.createElement('span');s.lang=l;s.textContent=t;outer.append(s)}return outer}
function setLanguage(value){lang=value;document.body.dataset.language=value;document.documentElement.lang=value==='en'?'en':'zh-CN';document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===value)));storage.set('scholastic-guide-language',value);const url=new URL(location.href);url.searchParams.set('lang',value);history.replaceState(null,'',url);document.title=value==='en'?'Scholastic Gold-winning Art & Jurors · TimeMemo':'Scholastic 金奖作品与评委 · TimeMemo'}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));setLanguage(lang);

const yearFilter=document.getElementById('year-filter');
function updateYear(){const year=yearFilter.value;const all=[...document.querySelectorAll('.winner-table tbody tr')];const selected=all.filter(r=>year==='all'||r.dataset.year===year);all.forEach(r=>r.hidden=!selected.includes(r));document.getElementById('sample-count').replaceChildren(bilingual('样本：'+selected.length+' 套作品集','Sample: '+selected.length+' portfolios'));document.querySelectorAll('.bar-row').forEach(b=>{const n=selected.filter(r=>r.dataset.theme===b.dataset.theme).length;const percent=n/selected.length*100;const label=Number(percent.toFixed(1));b.querySelector('.bar-count').textContent=n+' / '+selected.length+' · '+label+'%';b.querySelector('.bar-fill').style.width=percent+'%'});}yearFilter.addEventListener('change',updateYear);updateYear();
