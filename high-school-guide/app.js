(() => {
  const el = (tag, cls) => { const node = document.createElement(tag); if(cls) node.className=cls; return node; };
  const translated = (tag, pair, cls) => { const node=el(tag,cls); node.dataset.zh=pair[0]; node.dataset.en=pair[1]; return node; };
  const link = (pair,url) => { const a=translated('a',pair); a.href=url; if(url.startsWith('https:')) {a.target='_blank';a.rel='noopener noreferrer';} return a; };
  const refs = ids => { const box=el('span','refs'); ids.forEach(id=>{const source=GUIDE.sources[id-1];const a=link([`来源 ${id}`,`Source ${id}`],source[2]);a.className='source-ref';box.append(a);});return box; };
  const table=document.getElementById('comparison'), head=el('thead'), hr=el('tr');
  const corner=translated('th',['比较项目','Compare']);corner.scope='col';hr.append(corner);
  GUIDE.schools.forEach(name=>{const th=el('th');th.scope='col';th.textContent=name;hr.append(th);});head.append(hr);table.append(head);
  const body=el('tbody'); GUIDE.rows.forEach(row=>{const tr=el('tr'),th=translated('th',row.label);th.scope='row';tr.append(th);row.cells.forEach(cell=>{const td=el('td');if(cell.price){const price=el('div','price');price.textContent=cell.price;td.append(price);}td.append(translated('div',cell.t),refs(cell.s));tr.append(td);});body.append(tr);});table.append(body);
  const cards=document.getElementById('visit-cards');GUIDE.visits.forEach(item=>{const card=el('article','visit-card');const title=el('h3');title.textContent=item.name;card.append(translated('div',item.label,'label'),title,translated('p',item.event,'event'),translated('p',item.text));const address=el('p','address');address.textContent=item.address;const contact=el('p','contact');contact.textContent=item.contact;const links=el('div','links');item.links.forEach(a=>links.append(link(a,a[2])));card.append(address,contact,links,refs(item.s));cards.append(card);});
  GUIDE.testing.forEach(item=>{const card=el('article','note');card.append(translated('h3',item.title),translated('p',item.text),refs(item.s));document.getElementById('test-notes').append(card);});
  GUIDE.timeline.forEach(item=>{const row=el('article','timeline-item'),content=el('div');content.append(translated('p',item.text),refs(item.s));row.append(translated('strong',item.date),content);document.getElementById('timeline').append(row);});
  GUIDE.questions.forEach(item=>{const card=el('article','question');card.append(translated('h3',item.title),translated('p',item.text));document.getElementById('question-list').append(card);});
  GUIDE.sources.forEach((source,index)=>{const li=el('li');li.id=`source-${index+1}`;li.append(link(source,source[2]));const domain=el('small');domain.textContent=new URL(source[2]).hostname;li.append(domain);document.getElementById('source-list').append(li);});
  function setLanguage(language,update=true){
    const lang=['zh','en','both'].includes(language)?language:'zh';
    document.body.dataset.language=lang;document.documentElement.lang=lang==='en'?'en':'zh-CN';
    document.title=lang==='en'?'Portland High School Comparison · TimeMemo':'波特兰高中四校比较 · TimeMemo';
    document.querySelectorAll('[data-zh][data-en]').forEach(node=>{
      node.replaceChildren();const append=(value,isSecondary=false,isEnglish=false)=>{const span=el('span',isSecondary?'bi-secondary':'');span.lang=isEnglish?'en':'zh-CN';if(node.dataset.rich==='true'){value.split('<br>').forEach((line,i)=>{if(i)span.append(el('br'));span.append(document.createTextNode(line));});}else span.textContent=value;node.append(span);};
      append(node.dataset[lang==='en'?'en':'zh'],false,lang==='en');if(lang==='both')append(node.dataset.en,true,true);
    });
    document.querySelectorAll('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===lang)));
    if(update){const url=new URL(location.href);lang==='zh'?url.searchParams.delete('lang'):url.searchParams.set('lang',lang);history.replaceState(null,'',url);}
  }
  document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
  setLanguage(new URLSearchParams(location.search).get('lang'),false);
  window.addEventListener('popstate',()=>setLanguage(new URLSearchParams(location.search).get('lang'),false));
})();
