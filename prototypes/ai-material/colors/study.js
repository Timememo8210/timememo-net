(() => {
  'use strict';
  const palettes = {
    ember: {code:'A',zh:'墨蓝 · 暖橙',en:'Ink · Ember',noteZh:'深色保留质感，暖橙带来温度。最适合个人主页，专业但不冷。',noteEn:'Deep ink, with a warm ember accent. My first pick for a personal site: professional and approachable.',tagZh:'首选',tagEn:'First pick',colors:['#121B28','#FFAB86','#FAF3EC']},
    glacier: {code:'B',zh:'深青 · 冰蓝',en:'Petrol · Glacier',noteZh:'更鲜明的冷色，银色晶圆与冰蓝光线更突出。想更酷一点，选这套。',noteEn:'Richer cool tones make the silver wafer and icy light stand out. The stronger technology direction.',tagZh:'更酷',tagEn:'Cooler',colors:['#092E39','#66E1E8','#EDF8F7']},
    porcelain: {code:'C',zh:'瓷白 · 群青',en:'Porcelain · Cobalt',noteZh:'最明亮，也最利于阅读。群青只做点缀，晶圆仍是主角。',noteEn:'The brightest, most readable direction. Cobalt is a small accent, with the wafer still in focus.',tagZh:'最明亮',tagEn:'Brightest',colors:['#F5F4EE','#334BDA','#FFFEFA']},
    amethyst: {code:'D',zh:'深紫 · 杏色',en:'Plum · Apricot',noteZh:'更有个人风格，杏色让深紫不沉闷。适合偏设计感的表达。',noteEn:'A more expressive, personal direction. Apricot keeps the deep plum from feeling heavy.',tagZh:'更个性',tagEn:'Expressive',colors:['#30263F','#F8BB91','#FBF1ED']},
    silver: {code:'0',zh:'当前银灰',en:'Current silver',noteZh:'统一、克制，但冷色相近，容易显得偏灰。作为对照保留。',noteEn:'Unified and restrained, but the similar cool tones can feel flat. Kept here as the baseline.',tagZh:'原版对照',tagEn:'Baseline',colors:['#17202B','#C4E4FF','#F2F5F9']}
  };
  const params=new URLSearchParams(location.search);
  let selected=Object.hasOwn(palettes,params.get('palette'))?params.get('palette'):'ember';
  let lang=params.get('lang')==='en'?'en':'zh';
  const grid=document.querySelector('#contact-grid');
  for(const [key,p] of Object.entries(palettes)){
    const button=document.createElement('button');button.className=`contact-card theme-${key}`;button.dataset.palette=key;
    button.innerHTML=`<span class="miniature"><span class="mini-copy"><small>AI BUILDER</small><strong data-zh="陈晓波" data-en="Xiaobo&#10;Chen">陈晓波</strong><i></i></span><img src="assets/${key}-wafer.webp" width="900" height="900" alt="" loading="lazy"><span class="mini-bottom"></span></span><span class="contact-caption"><b>${p.code} / <span data-zh="${p.zh}" data-en="${p.en}">${p.zh}</span></b><small data-zh="${p.tagZh}" data-en="${p.tagEn}">${p.tagZh}</small></span>`;
    grid.append(button);
  }
  function updateURL(){const url=new URL(location.href);url.searchParams.set('palette',selected);url.searchParams.set('lang',lang);history.replaceState(null,'',url);}
  function selectionCopy(){
    const p=palettes[selected];document.querySelector('#selected-title').textContent=`${p.code} / ${p[lang]}`;
    document.querySelector('#selected-description').textContent=p[lang==='zh'?'noteZh':'noteEn'];
    const codes=document.querySelector('#color-codes');codes.replaceChildren(...p.colors.map(color=>{const el=document.createElement('span');el.textContent=color;el.style.setProperty('--chip',color);return el;}));
  }
  function setPalette(key){
    selected=Object.hasOwn(palettes,key)?key:'ember';
    document.querySelector('#site-preview').className=`site-preview theme-${selected}`;
    document.querySelector('#ending-grid').className=`ending-grid theme-${selected}`;
    document.querySelector('#wafer-art').src=`assets/${selected}-wafer.webp`;
    document.querySelectorAll('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===selected)));
    selectionCopy();updateURL();
  }
  function setLanguage(value){
    lang=value==='en'?'en':'zh';document.documentElement.lang=lang==='en'?'en':'zh-CN';
    document.title=lang==='en'?'Color studies · AI Material':'配色对照 · AI Material';
    document.querySelectorAll('[data-zh]').forEach(e=>{e.textContent=e.dataset[lang];});
    document.querySelectorAll('[data-alt-zh]').forEach(e=>{e.alt=e.dataset[lang==='zh'?'altZh':'altEn'];});
    document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
    selectionCopy();updateURL();
  }
  document.querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>{
    setPalette(b.dataset.palette);
    if(b.classList.contains('contact-card'))document.querySelector('#selected-title').scrollIntoView({block:'start',behavior:'instant'});
  }));
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
  setPalette(selected);setLanguage(lang);
})();
