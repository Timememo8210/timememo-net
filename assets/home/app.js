(() => {
  'use strict';
  const catalog = window.HOME_CATALOG || [];
  const $ = s => document.querySelector(s);
  const store = {get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },set(key, value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} }};
  const names={research:['半导体研究','Semiconductor Research'],ai:['AI 与制造','AI & Manufacturing'],learning:['教育与学习','Education & Learning'],projects:['项目与创意','Projects & Design'],life:['生活与规划','Life & Planning'],portal:['资料库','Archive'],design:['主页方案','Homepage Designs']};
  let lang = store.get('timememo-home-language','zh'); if(!['zh','en'].includes(lang))lang='zh';
  let category='all';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motionChoice=store.get('timememo-home-motion',null);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tr=(z,e)=>lang==='zh'?z:e;
  function translate(root=document){root.querySelectorAll('[data-zh][data-en]').forEach(el=>{el.innerHTML=el.dataset[lang]});root.querySelectorAll('[data-placeholder-zh]').forEach(el=>el.placeholder=el.dataset[lang==='zh'?'placeholderZh':'placeholderEn']);}
  function row(p,opened=false){return `<a class="project-row" href="${esc(p.url)}" data-track="${esc(p.url)}"><time datetime="${p.updated}">${opened?tr('已打开','Opened'):p.updated}</time><div><h3>${esc(p.title[lang])}${p.private?`<span class="private-label">${tr('访问码','Access code')}</span>`:''}</h3><p>${esc(p.description[lang])}</p></div><span aria-hidden="true">↗</span></a>`;}
  function renderCatalog(){
    const query=$('#search').value.trim().toLocaleLowerCase(), month=$('#month').value, sort=$('#sort').value;
    let list=catalog.filter(p=>(category==='all'||p.category===category)&&(!month||p.updated.startsWith(month))&&(!query||[p.title.zh,p.title.en,p.description.zh,p.description.en,p.updated,...names[p.category]].join(' ').toLocaleLowerCase().includes(query)));
    if(sort==='old')list.sort((a,b)=>a.updated.localeCompare(b.updated));else list.sort((a,b)=>b.updated.localeCompare(a.updated));
    $('#result-count').textContent=tr(`${list.length} 个条目`,`${list.length} entries`);
    $('#catalog-results').innerHTML=list.length?(sort==='group'?Object.entries(names).map(([key,label])=>{const entries=list.filter(p=>p.category===key);return entries.length?`<section class="catalog-group"><h3>${esc(label[lang==='zh'?0:1])} <small>(${entries.length})</small></h3><div>${entries.map(p=>row(p)).join('')}</div></section>`:''}).join(''):`<div class="catalog-group"><h3>${tr(sort==='old'?'最早更新':'最近更新',sort==='old'?'Oldest updates':'Latest updates')}</h3><div>${list.map(p=>row(p)).join('')}</div></div>`):`<p class="empty-state">${tr('没有匹配内容。试试其他关键词，或重置筛选。','No matches. Try another keyword or reset the filters.')}</p>`;
  }
  function history(){const raw=store.get('timememo-home-history',[]);return Array.isArray(raw)?raw.filter(url=>typeof url==='string'&&catalog.some(p=>p.url===url)).slice(0,8):[];}
  function renderHistory(){const recent=history();$('#history-count').textContent=recent.length?`(${recent.length})`:'';$('#history-list').innerHTML=recent.length?recent.map(url=>row(catalog.find(p=>p.url===url),true)).join(''):`<p>${tr('打开一个项目后，会显示在这里。','Open a project to start your list.')}</p>`;$('#clear-history').disabled=!recent.length;}
  function updateMotion(){const enabled=!reduced.matches&&motionChoice!=='off';document.body.dataset.motion=enabled?'on':'off';document.documentElement.dataset.motion=enabled?'on':'off';$('#motion').textContent=tr(enabled?'暂停动效':'开启动效',enabled?'Pause motion':'Enable motion');$('#motion').setAttribute('aria-pressed',String(!enabled));$('#motion').disabled=reduced.matches;$('#motion').title=reduced.matches?tr('遵循系统减少动态效果设置','Following your system’s reduced motion setting'):'';window.dispatchEvent(new Event('home-motion-change'));}
  function setLanguage(next){lang=next;store.set('timememo-home-language',lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';translate();document.title=tr('陈晓波 · Time Memo','Xiaobo Chen · Time Memo');document.querySelector('meta[name=description]').content=tr('陈晓波 · 半导体研发、制造与商业。研究、项目与学习记录。','Xiaobo Chen. Semiconductor R&D, manufacturing and business. Research, projects and learning.');document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));$('#month').setAttribute('aria-label',tr('更新月份','Updated in'));document.querySelector('.site-header nav').setAttribute('aria-label',tr('主导航','Main navigation'));document.querySelector('.category-tabs').setAttribute('aria-label',tr('分类','Categories'));document.querySelector('.field-controls [role=group]').setAttribute('aria-label',tr('切换晶圆图形','Wafer diagram'));renderCatalog();renderHistory();updateMotion();}
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
  $('#motion').addEventListener('click',()=>{motionChoice=document.body.dataset.motion==='on'?'off':'on';store.set('timememo-home-motion',motionChoice);updateMotion()});reduced.addEventListener('change',updateMotion);
  document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCatalog()}));
  $('#search').addEventListener('input',renderCatalog);$('#month').addEventListener('input',renderCatalog);$('#sort').addEventListener('change',renderCatalog);
  $('#reset').addEventListener('click',()=>{$('#search').value='';$('#month').value='';$('#sort').value='group';category='all';document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category==='all')));renderCatalog()});
  function record(e){const link=e.target.closest('a[data-track]');if(!link||!catalog.some(p=>p.url===link.dataset.track))return;store.set('timememo-home-history',[link.dataset.track,...history().filter(x=>x!==link.dataset.track)].slice(0,8));}
  document.addEventListener('click',record);document.addEventListener('auxclick',e=>{if(e.button===1)record(e)});
  $('#clear-history').addEventListener('click',()=>{store.set('timememo-home-history',[]);renderHistory()});window.addEventListener('pageshow',renderHistory);window.addEventListener('storage',renderHistory);
  setLanguage(lang);
})();
