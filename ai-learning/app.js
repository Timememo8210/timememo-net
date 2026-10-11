(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = text => String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeUrl = value => {
    try { const u = new URL(value, location.href); return ['https:','http:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; }
  };
  function inline(text) {
    const saved = [];
    const token = html => { saved.push(html); return '\u0000' + (saved.length - 1) + '\u0000'; };
    let out = String(text).replace(/!\[([^\]]*)\]\((?:<)?([^\s)>]+)(?:>)?\)|\[([^\]]+)\]\((?:<)?([^\s)>]+)(?:>)?\)|`([^`]+)`/g, (_,alt,img,label,url,code) => {
      if (img) return token(`<img src="${esc(safeUrl(img))}" alt="${esc(alt)}" loading="lazy">`);
      if (url) return token(`<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`);
      return token(`<code>${esc(code)}</code>`);
    });
    out = esc(out).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    return out.replace(/\u0000(\d+)\u0000/g, (_,i) => saved[Number(i)]);
  }
  function markdown(text) {
    const lines = String(text).replace(/\r/g,'').split('\n'); let result = [], i = 0;
    const tableCells = line => line.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim());
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      if (/^```/.test(line)) { const block=[]; i++; while(i<lines.length&&!/^```/.test(lines[i])) block.push(lines[i++]); i++; result.push(`<pre><code>${esc(block.join('\n'))}</code></pre>`); continue; }
      if (/^#{1,6}\s/.test(line)) { const m=line.match(/^(#{1,6})\s+(.*)/); const n=Math.min(4,Math.max(2,m[1].length));result.push(`<h${n}>${inline(m[2])}</h${n}>`);i++;continue; }
      if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {result.push('<hr>');i++;continue;}
      if (line.includes('|') && i+1<lines.length && /^\s*\|?[\s:|-]+\|\s*$/.test(lines[i+1])) {
        const head=tableCells(line);i+=2;const rows=[];
        while(i<lines.length && lines[i].trim().startsWith('|')) rows.push(tableCells(lines[i++]));
        result.push(`<div class="table-scroll"><table><thead><tr>${head.map(c=>`<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);continue;
      }
      if (/^\s*>/.test(line)) {const block=[];while(i<lines.length&&/^\s*>/.test(lines[i]))block.push(lines[i++].replace(/^\s*>\s?/,''));result.push(`<blockquote>${markdown(block.join('\n'))}</blockquote>`);continue;}
      if (/^\s*(?:[-*]|\d+[.)])\s/.test(line)) {const ordered=/^\s*\d+[.)]\s/.test(line),tag=ordered?'ol':'ul',rows=[];const pattern=ordered?/^\s*\d+[.)]\s+/:/^\s*[-*]\s+/;while(i<lines.length&&pattern.test(lines[i]))rows.push(`<li>${inline(lines[i++].replace(pattern,''))}</li>`);result.push(`<${tag}>${rows.join('')}</${tag}>`);continue;}
      const block=[line];i++;
      while(i<lines.length&&lines[i].trim()&&!/^\s*(?:#|>|[-*] |\d+[.)] |```|\|)/.test(lines[i]))block.push(lines[i++]);
      result.push(`<p>${inline(block.join('\n')).replace(/  \n/g,'<br>')}</p>`);
    }
    return result.join('\n');
  }
  const descriptions = {
    'Jeff Su':['JS','职场方法'], 'Tina Huang':['TH','学习与知识管理'],
    'Matt Wolfe':['MW','筛选每周更新'], 'Dave Ebbelaar':['DE','自动化与知识库'],
    'AI Explained':['AE','趋势与证据'], 'Andrej Karpathy':['AK','原理与学习'],
    'Google Cloud Tech':['GC','工作流与实践']
  };
  const readingLabels = {'摘要':'看摘要即可','片段':'值得精看片段','完整':'值得完整观看','图文精读':'中文图文精读'};
  let data, state, limit = 24, focusBeforeReader;
  const keys=['q','channel','topic','year','month','day','reading','sort','view'];
  const normalized = value => String(value).normalize('NFKC').toLocaleLowerCase().replace(/[‑–—]/g,'-');
  function fromUrl() {const p=new URLSearchParams(location.search);const s={};keys.forEach(k=>s[k]=p.get(k)||'');s.view=s.view==='issues'?'issues':'cards';s.sort=['newest','oldest','creator'].includes(s.sort)?s.sort:'newest';return s;}
  function updateUrl(extra={}) {const p=new URLSearchParams(location.search);keys.forEach(k=>{if(state[k]&&!(k==='view'&&state[k]==='cards')&&!(k==='sort'&&state[k]==='newest'))p.set(k,state[k]);else p.delete(k);});Object.entries(extra).forEach(([k,v])=>v?p.set(k,v):p.delete(k));history.replaceState(null,'',location.pathname+(p.size?'?'+p:'')+location.hash);}
  function options(id, values, placeholder, format=v=>v) {const selected=state[id];$(id).innerHTML=`<option value="">${placeholder}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(format(v))}</option>`).join('');state[id]=values.includes(selected)?selected:'';$(id).value=state[id];}
  function syncFilters() {
    $('search').value=state.q;
    if(!data.channels.includes(state.channel))state.channel='';
    options('topic',[...new Set(data.entries.map(e=>e.topic))],'全部主题');
    options('year',[...new Set(data.entries.map(e=>e.date.slice(0,4)))].sort().reverse(),'全部年份',v=>v+' 年');
    const yearDates=data.entries.filter(e=>!state.year||e.date.startsWith(state.year));
    options('month',[...new Set(yearDates.map(e=>e.date.slice(5,7)))].sort(),'全部月份',v=>Number(v)+' 月');
    options('day',[...new Set(yearDates.filter(e=>!state.month||e.date.slice(5,7)===state.month).map(e=>e.date.slice(8,10)))].sort(),'全部日期',v=>Number(v)+' 日');
    if(!Object.keys(readingLabels).includes(state.reading))state.reading='';
    $('reading').value=state.reading;$('sort').value=state.sort;
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
    document.querySelectorAll('[data-channel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.channel===state.channel)));
  }
  function filteredEntries() {
    const words=normalized(state.q).trim().split(/\s+/).filter(Boolean);
    return data.entries.filter(e=>(!state.channel||e.channels.includes(state.channel))&&(!state.topic||e.topic===state.topic)&&(!state.reading||e.reading===state.reading)&&(!state.year||e.date.startsWith(state.year))&&(!state.month||e.date.slice(5,7)===state.month)&&(!state.day||e.date.slice(8,10)===state.day)&&words.every(w=>e.searchText.includes(w)))
      .sort((a,b)=>state.sort==='creator'?(a.channels[0].localeCompare(b.channels[0])||b.date.localeCompare(a.date)):state.sort==='oldest'?a.date.localeCompare(b.date)||a.id.localeCompare(b.id):b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
  }
  function card(e) {
    return `<article class="knowledge-card"><div class="card-main"><div class="card-top"><span class="topic-label">${esc(e.topic)}</span><time datetime="${esc(e.date)}">${esc(e.date)}</time></div><h3><button class="title-button" data-entry="${esc(e.id)}">${esc(e.title)}</button></h3><p class="takeaway">${esc(e.takeaway)}</p><div class="byline">${e.channels.map(c=>`<span>${esc(c)}</span>`).join('')}</div></div><div class="card-bottom"><span class="reading-label ${e.reading!=='摘要'?'deep':''}">${esc(readingLabels[e.reading])}</span><a href="${esc(safeUrl(e.videoLinks[0].url))}" target="_blank" rel="noopener noreferrer" aria-label="观看原视频：${esc(e.title)}">原视频 ↗</a></div></article>`;
  }
  function render() {
    syncFilters();updateUrl();const matches=filteredEntries();const issues=data.issues.filter(issue=>matches.some(e=>e.issueId===issue.id)).sort((a,b)=>state.sort==='oldest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
    const active=[state.channel,state.topic,state.year&&state.year+'年',state.month&&Number(state.month)+'月',state.day&&Number(state.day)+'日'].filter(Boolean).join(' · ');
    $('results-count').textContent=`${matches.length} 条精华${state.view==='issues'?` · ${issues.length} 篇归档`:''}${active?' / '+active:''}`;
    $('results').className=state.view==='issues'?'issues':'cards';
    if(state.view==='cards')$('results').innerHTML=matches.slice(0,limit).map(card).join('');
    else $('results').innerHTML=issues.slice(0,limit).map(issue=>{const entries=matches.filter(e=>e.issueId===issue.id);return `<article class="issue-row"><time class="issue-date" datetime="${esc(issue.date)}">${esc(issue.date)}</time><div><h3>${esc(issue.title)}</h3><p>${entries.map(e=>esc(e.title)).join(' · ')}</p></div><button data-issue="${esc(issue.id)}">阅读当期全文 ↗</button></article>`;}).join('');
    const total=state.view==='cards'?matches.length:issues.length;$('more').hidden=total<=limit;$('more').textContent=`继续浏览 · 还有 ${Math.max(0,total-limit)} ${state.view==='cards'?'条':'篇'}`;$('empty').hidden=total>0;
  }
  function closeReader() {if($('reader').open)$('reader').close();document.body.classList.remove('reading');updateUrl({entry:'',issue:''});focusBeforeReader?.focus();}
  function openReader(kind,id,changeUrl=true) {
    const item=(kind==='entry'?data.entries:data.issues).find(x=>x.id===id);if(!item)return;
    if(!$('reader').open)focusBeforeReader=document.activeElement;
    $('reader-type').textContent=kind==='entry'?'知识精华 · '+item.topic:'历期归档 · 完整正文';
    const videos=kind==='entry'?`<div class="video-links">${item.videoLinks.map((v,i)=>`<a href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener noreferrer">${i?'相关视频 / 片段':'打开原视频'} ↗</a>`).join('')}</div>`:'';
    const action=kind==='entry'?`<div class="action-box"><b>马上尝试</b><p>${esc(item.action)}</p></div>`:'';
    const archive=kind==='issue'||item.archived;
    const notice=archive?`<p class="archive-notice">历史内容 · 整理于 ${esc(item.date)}。产品功能、价格与开放范围以当期资料为准，归档时未逐项重新核验。</p>`:'';
    $('reader-content').innerHTML=`<div class="reader-meta">${esc(item.date)}${kind==='entry'?' · '+esc(item.channels.join(' / '))+' · '+esc(readingLabels[item.reading]):''}</div><h1 id="reader-title">${esc(item.title)}</h1>${notice}${kind==='entry'?`<p class="reader-takeaway">${esc(item.takeaway)}</p>`:''}${videos}${action}<div class="markdown">${markdown(item.body)}</div><div class="reader-footer">${kind==='entry'?`<button data-issue="${esc(item.issueId)}">查看当期完整简报 ↗</button>`:'<span></span>'}<button id="copy-link">复制本页链接</button></div>`;
    if(changeUrl)updateUrl({entry:kind==='entry'?id:'',issue:kind==='issue'?id:''});
    if(!$('reader').open)$('reader').showModal();$('reader').scrollTop=0;document.body.classList.add('reading');$('close-reader').focus();
    $('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('copy-link').textContent='链接已复制';}catch{$('copy-link').textContent='请复制浏览器地址栏链接';}});
  }
  function reset() {state={q:'',channel:'',topic:'',year:'',month:'',day:'',reading:'',sort:'newest',view:state.view};limit=24;render();}
  async function init() {
    try {
      const response=await fetch('data/library.json',{cache:'no-cache'});if(!response.ok)throw new Error('HTTP '+response.status);data=await response.json();
      data.entries.forEach(e=>e.searchText=normalized([e.title,e.takeaway,e.action,e.body,e.channels.join(' '),e.topic,e.date].join(' ')));
      state=fromUrl();$('entry-count').textContent=data.entries.length;$('issue-count').textContent=data.issues.length;$('updated').textContent=data.entries.map(e=>e.date).sort().at(-1);$('schedule').textContent=data.schedule;$('footer-update').textContent='知识库更新于 '+data.updatedAt;
      $('creators').innerHTML=data.channels.map(c=>{const [initial,hint]=descriptions[c]||[c.slice(0,2),'持续关注'];return `<button type="button" class="creator" data-channel="${esc(c)}" aria-pressed="false" aria-label="筛选 ${esc(c)}"><span class="creator-count">${data.entries.filter(e=>e.channels.includes(c)).length}</span><span class="initials" aria-hidden="true">${initial}</span><span class="creator-name">${esc(c)}</span><span class="creator-hint">${hint}</span></button>`;}).join('');
      $('filters').addEventListener('submit',e=>e.preventDefault());$('search').addEventListener('input',()=>{state.q=$('search').value;limit=24;render();});
      ['topic','year','month','day','reading','sort'].forEach(id=>$(id).addEventListener('change',()=>{state[id]=$(id).value;if(id==='year'){state.month='';state.day='';}if(id==='month')state.day='';limit=24;render();}));
      document.addEventListener('click',e=>{const c=e.target.closest('[data-channel]'),v=e.target.closest('[data-view]'),entry=e.target.closest('[data-entry]'),issue=e.target.closest('[data-issue]');if(c){state.channel=state.channel===c.dataset.channel?'':c.dataset.channel;limit=24;render();}if(v){state.view=v.dataset.view;limit=24;render();}if(entry)openReader('entry',entry.dataset.entry);if(issue)openReader('issue',issue.dataset.issue);});
      $('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);$('more').addEventListener('click',()=>{limit+=24;render();});$('close-reader').addEventListener('click',closeReader);
      $('reader').addEventListener('cancel',e=>{e.preventDefault();closeReader();});$('reader').addEventListener('click',e=>{if(e.target===$('reader')){const r=$('reader').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeReader();}});
      document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('reader').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
      window.addEventListener('popstate',()=>{state=fromUrl();render();const p=new URLSearchParams(location.search);if(p.has('entry'))openReader('entry',p.get('entry'),false);else if(p.has('issue'))openReader('issue',p.get('issue'),false);else closeReader();});
      render();const params=new URLSearchParams(location.search);if(params.has('entry'))openReader('entry',params.get('entry'),false);else if(params.has('issue'))openReader('issue',params.get('issue'),false);
    } catch(error) {$('results-count').textContent='暂时无法载入知识库，请刷新重试。';$('results').innerHTML='<p>也可以先<a href="data/library.json">下载全文备份</a>。</p>';console.error(error);}
  }
  init();
})();
