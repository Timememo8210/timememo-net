(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const catalog=window.HOME_CATALOG;
  if(!Array.isArray(catalog)||!catalog.length){
    const note=document.createElement('p');note.className='directory-notice';note.dataset.zh='目录筛选暂时不可用，下方链接仍可打开。';note.dataset.en='Filters are temporarily unavailable. The links below still work.';
    const show=()=>{note.textContent=note.dataset[window.homeLanguage==='en'?'en':'zh'];};show();addEventListener('home-language',show);$('.filters').replaceWith(note);$('.category-tabs').hidden=true;$('#history').hidden=true;return;
  }
  const categories={research:['半导体研究','Semiconductor research'],ai:['AI 与制造','AI & manufacturing'],learning:['教育与学习','Education & learning'],projects:['项目与创意','Projects & ideas'],life:['生活与规划','Life & planning'],portal:['资料库','Archive'],design:['主页方案','Homepage designs']};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lang=()=>window.homeLanguage==='en'?'en':'zh';
  const tr=(z,e)=>lang()==='zh'?z:e;
  const storage={get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}};
  let category='all';
  const arrow='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
  function row(p,opened=false){return `<a class="project-row" href="${esc(p.url)}" data-track="${esc(p.url)}"><time datetime="${esc(p.updated)}">${opened?tr('已打开','Opened'):esc(p.updated)}</time><div><h3>${esc(p.title[lang()])}${p.private?`<span class="private-label">${tr('访问码','Access code')}</span>`:''}</h3><p>${esc(p.description[lang()])}</p></div>${arrow}</a>`;}
  function renderCatalog(){
    const query=$('#search').value.trim().toLocaleLowerCase(),month=$('#month').value,sort=$('#sort').value;
    const entries=catalog.filter(p=>(category==='all'||p.category===category)&&(!month||p.updated.startsWith(month))&&(!query||[p.title.zh,p.title.en,p.description.zh,p.description.en,p.updated,...(categories[p.category]||[])].join(' ').toLocaleLowerCase().includes(query)));
    entries.sort((a,b)=>sort==='old'?a.updated.localeCompare(b.updated):b.updated.localeCompare(a.updated));
    $('#result-count').textContent=tr(`${entries.length} 个条目`,`${entries.length} entries`);
    function panels(items,key,label,index){
      const count=Math.ceil(items.length/3);
      return Array.from({length:count},(_,page)=>`<section class="catalog-group" data-tone="${index%3}" data-group="${key}"><div class="catalog-heading"><span class="category-number">${String(index+1).padStart(2,'0')}</span><h3>${esc(label)}</h3><small>${page+1} / ${count}</small></div><div class="catalog-items">${items.slice(page*3,page*3+3).map(p=>row(p)).join('')}</div></section>`).join('');
    }
    $('#catalog-results').innerHTML=entries.length?(sort==='group'?Object.entries(categories).map(([key,label],index)=>panels(entries.filter(p=>p.category===key),key,label[lang()==='zh'?0:1],index)).join(''):panels(entries,'date',tr(sort==='old'?'最早更新':'最近更新',sort==='old'?'Oldest updates':'Latest updates'),0)):`<p class="empty-state">${tr('没有匹配内容。换个关键词，或重置筛选。','No matches. Try another keyword or reset the filters.')}</p>`;
    $('#catalog-results').scrollLeft=0;
    dispatchEvent(new Event('home-rails-update'));
  }
  function recentHistory(){const raw=storage.get('timememo-home-history',[]);return Array.isArray(raw)?[...new Set(raw.filter(url=>typeof url==='string'&&catalog.some(p=>p.url===url)))].slice(0,8):[];}
  function renderHistory(){const recent=recentHistory();$('#history-count').textContent=recent.length?`(${recent.length})`:'';$('#history-list').innerHTML=recent.length?recent.map(url=>row(catalog.find(p=>p.url===url),true)).join(''):`<p>${tr('打开一个项目后，会显示在这里。','Open a project to start your list.')}</p>`;$('#clear-history').disabled=!recent.length;}
  function renderRecent(){const entries=catalog.filter(p=>!['design','portal'].includes(p.category)).sort((a,b)=>b.updated.localeCompare(a.updated)).slice(0,6);$('.recent-list').innerHTML=entries.map(p=>row(p)).join('');const fresh=$('#fresh-link'),p=entries[0];if(fresh&&p){fresh.href=p.url;fresh.dataset.track=p.url;fresh.querySelector('.fresh-title').textContent=p.title[lang()];fresh.querySelector('.fresh-title').dataset.zh=p.title.zh;fresh.querySelector('.fresh-title').dataset.en=p.title.en;fresh.querySelector('time').textContent=p.updated.replaceAll('-','.');fresh.querySelector('time').dateTime=p.updated;}}
  function render(){renderRecent();renderCatalog();renderHistory();dispatchEvent(new Event('home-rails-update'));}
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderCatalog();}));
  $('#search').addEventListener('input',renderCatalog);$('#month').addEventListener('input',renderCatalog);$('#sort').addEventListener('change',renderCatalog);
  $('.filters').addEventListener('submit',e=>e.preventDefault());
  $('#reset').addEventListener('click',()=>{category='all';$('#search').value='';$('#month').value='';$('#sort').value='group';document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category==='all')));renderCatalog();});
  function record(event){const link=event.target.closest('a[data-track]');if(!link||!catalog.some(p=>p.url===link.dataset.track))return;storage.set('timememo-home-history',[link.dataset.track,...recentHistory().filter(url=>url!==link.dataset.track)].slice(0,8));renderHistory();dispatchEvent(new Event('home-rails-update'));}
  document.addEventListener('click',record);document.addEventListener('auxclick',e=>{if(e.button===1)record(e);});
  $('#clear-history').addEventListener('click',()=>{storage.set('timememo-home-history',[]);renderHistory();dispatchEvent(new Event('home-rails-update'));});
  addEventListener('home-language',render);addEventListener('pageshow',renderHistory);addEventListener('storage',e=>{if(e.key==='timememo-home-history')renderHistory();dispatchEvent(new Event('home-rails-update'));});render();
})();
