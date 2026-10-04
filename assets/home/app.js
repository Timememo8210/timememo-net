(() => {
  'use strict';
  const catalog = window.HOME_CATALOG || [];
  const $ = s => document.querySelector(s);
  const store = {get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },set(key, value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} }};
  const names={research:['半导体研究','Semiconductor Research'],ai:['AI 与制造','AI & Manufacturing'],learning:['教育与学习','Education & Learning'],projects:['项目与创意','Projects & Design'],life:['生活与规划','Life & Planning'],portal:['资料库','Archive'],design:['主页方案','Homepage Designs']};
  let lang = store.get('timememo-home-language','zh'); if(!['zh','en'].includes(lang))lang='zh';
  let category='all';
  // The owner requests continuously enabled motion; ignore the retired saved on/off preference.
  document.body.dataset.motion='on';
  document.documentElement.dataset.motion='on';
  const dock=$('#language-dock'), languageToggle=$('#language-toggle'), languagePanel=$('#language-panel');
  let languageOpen=false;
  function toggleLanguagePanel(open, restoreFocus=false){
    languageOpen=open;
    languageToggle.setAttribute('aria-expanded',String(open));
    languagePanel.dataset.open=String(open);
    languagePanel.inert=!open;
    if(restoreFocus)languageToggle.focus({preventScroll:true});
  }
  function updateLanguageDock(){
    const visible=scrollY<96;
    if(!visible&&languageOpen)toggleLanguagePanel(false);
    dock.dataset.visible=String(visible);
    dock.inert=!visible;
    dock.setAttribute('aria-hidden',String(!visible));
  }
  languageToggle.addEventListener('click',()=>toggleLanguagePanel(!languageOpen));
  document.addEventListener('pointerdown',e=>{if(languageOpen&&!dock.contains(e.target))toggleLanguagePanel(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&languageOpen)toggleLanguagePanel(false,true)});
  dock.addEventListener('focusout',e=>{if(!dock.contains(e.relatedTarget))toggleLanguagePanel(false)});
  window.addEventListener('scroll',updateLanguageDock,{passive:true});
  window.addEventListener('pageshow',updateLanguageDock);
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
    window.dispatchEvent(new Event('home-content-change'));
  }
  function history(){const raw=store.get('timememo-home-history',[]);return Array.isArray(raw)?raw.filter(url=>typeof url==='string'&&catalog.some(p=>p.url===url)).slice(0,8):[];}
  function renderHistory(){const recent=history();$('#history-count').textContent=recent.length?`(${recent.length})`:'';$('#history-list').innerHTML=recent.length?recent.map(url=>row(catalog.find(p=>p.url===url),true)).join(''):`<p>${tr('打开一个项目后，会显示在这里。','Open a project to start your list.')}</p>`;$('#clear-history').disabled=!recent.length;}
  function setLanguage(next){lang=next;store.set('timememo-home-language',lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';translate();document.title=tr('陈晓波 · Time Memo','Xiaobo Chen · Time Memo');document.querySelector('meta[name=description]').content=tr('陈晓波 · AI 应用先行者。把 AI 用于研究、产品与制造。','Xiaobo Chen. AI builder, bringing AI into research, products and manufacturing.');document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));$('#month').setAttribute('aria-label',tr('更新月份','Updated in'));languageToggle.setAttribute('aria-label',tr('切换语言','Change language'));document.querySelector('.category-tabs').setAttribute('aria-label',tr('分类','Categories'));document.querySelector('.field-controls [role=group]').setAttribute('aria-label',tr('切换晶圆图形','Wafer diagram'));renderCatalog();renderHistory();window.dispatchEvent(new Event('home-language-change'));}
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{setLanguage(b.dataset.lang);toggleLanguagePanel(false,true)}));
  document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCatalog()}));
  $('#search').addEventListener('input',renderCatalog);$('#month').addEventListener('input',renderCatalog);$('#sort').addEventListener('change',renderCatalog);
  $('#reset').addEventListener('click',()=>{$('#search').value='';$('#month').value='';$('#sort').value='group';category='all';document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category==='all')));renderCatalog()});
  function record(e){const link=e.target.closest('a[data-track]');if(!link||!catalog.some(p=>p.url===link.dataset.track))return;store.set('timememo-home-history',[link.dataset.track,...history().filter(x=>x!==link.dataset.track)].slice(0,8));}
  document.addEventListener('click',record);document.addEventListener('auxclick',e=>{if(e.button===1)record(e)});
  $('#clear-history').addEventListener('click',()=>{store.set('timememo-home-history',[]);renderHistory()});window.addEventListener('pageshow',renderHistory);window.addEventListener('storage',renderHistory);
  setLanguage(lang);updateLanguageDock();
})();
