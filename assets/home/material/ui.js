(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const dock=$('.language-dock'),trigger=$('.language-tab'),menu=$('#language-menu');
  let lang='zh';
  try{lang=JSON.parse(localStorage.getItem('timememo-home-language')||localStorage.getItem('timememo-full-language'))||'zh';}catch{}
  const requested=new URLSearchParams(location.search).get('lang');if(['zh','en'].includes(requested))lang=requested;
  function close(restore=false){dock.classList.remove('open');trigger.setAttribute('aria-expanded','false');menu.inert=true;if(restore)trigger.focus({preventScroll:true});}
  function setLanguage(value){
    lang=value==='en'?'en':'zh';window.homeLanguage=lang;
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    document.querySelectorAll('[data-zh][data-en]').forEach(el=>{el.innerHTML=el.dataset[lang];});
    document.querySelectorAll('[data-placeholder-zh]').forEach(el=>{el.placeholder=el.dataset[lang==='zh'?'placeholderZh':'placeholderEn'];});
    document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
    document.title=lang==='zh'?'陈晓波 · Time Memo':'Xiaobo Chen · Time Memo';
    document.querySelector('meta[name=description]').content=lang==='zh'?'陈晓波 · AI 应用先行者。把 AI 用于研究、产品与制造。':'Xiaobo Chen. AI builder across research, products and manufacturing.';
    trigger.setAttribute('aria-label',lang==='zh'?'切换语言':'Change language');
    $('.section-nav').setAttribute('aria-label',lang==='zh'?'页面导航':'Page navigation');
    $('.category-tabs').setAttribute('aria-label',lang==='zh'?'分类':'Categories');
    $('#month')?.setAttribute('aria-label',lang==='zh'?'更新月份':'Updated in');
    try{localStorage.setItem('timememo-home-language',JSON.stringify(lang));}catch{}
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
    close();dispatchEvent(new Event('home-language'));
  }
  trigger.addEventListener('click',()=>{const open=!dock.classList.contains('open');dock.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open));menu.inert=!open;if(open)menu.querySelector(`[data-lang="${lang}"]`).focus({preventScroll:true});});
  document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>{const inMenu=menu.contains(el);setLanguage(el.dataset.lang);if(inMenu)trigger.focus({preventScroll:true});}));
  document.addEventListener('pointerdown',e=>{if(!dock.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dock.classList.contains('open'))close(true);});
  function updateDock(){const hidden=scrollY>96;dock.classList.toggle('scrolled',hidden);dock.inert=hidden;if(hidden)close();}
  addEventListener('scroll',updateDock,{passive:true});addEventListener('pageshow',updateDock);updateDock();setLanguage(lang);
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href^="#"]');if(!a)return;
    const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;
    event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});
  });
  const navLinks=[...document.querySelectorAll('.section-nav a')];
  const navObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>{if(a.getAttribute('href')==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}),{rootMargin:'-15% 0px -65% 0px',threshold:0});
  ['recent','directory','about','top'].forEach(id=>navObserver.observe(document.getElementById(id)));
  const fallbackTimer=setTimeout(()=>{if(!document.body.classList.contains('scene-ready'))document.body.classList.add('scene-fallback');},6000);
  addEventListener('scene-ready',()=>clearTimeout(fallbackTimer),{once:true});
  function fallbackScroll(){
    if(document.body.classList.contains('scene-ready'))return;
    const p=Math.max(0,Math.min(1,scrollY/Math.max(1,$('.runway').offsetHeight-$('.scene').offsetHeight)));
    const intro=Math.max(0,1-p*3.3),network=p>.31&&p<.77,ai=p>=.77;
    $('.intro-copy').style.opacity=intro;$('.intro-copy').inert=intro<.1;
    for(const [selector,show]of [['.network-copy',network],['.ai-copy',ai]]){const el=$(selector);el.style.opacity=show?1:0;el.style.transform='none';el.inert=!show;el.setAttribute('aria-hidden',String(!show));}
    document.body.dataset.fallbackPhase=ai?'ai':network?'network':'wafer';
    $('.scene-progress span').style.transform=`scaleY(${p})`;
    $('.scroll-hint').href=ai?'#work':network?'#applied-ai':'#intelligence';
  }
  addEventListener('scroll',fallbackScroll,{passive:true});addEventListener('pageshow',fallbackScroll);fallbackScroll();
  document.querySelectorAll('.intro-copy > *').forEach((el,index)=>el.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:950,delay:index*95+120,easing:'cubic-bezier(.2,.7,.1,1)',fill:'backwards'}));
  const artObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.classList.toggle('art-visible',isIntersecting&&!document.hidden)),{threshold:0});
  document.querySelectorAll('.project').forEach(card=>{
    artObserver.observe(card);
    card.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse')return;const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;card.style.setProperty('--card-x',`${x*100}%`);card.style.setProperty('--card-y',`${y*100}%`);card.style.setProperty('--tilt-x',`${(y-.5)*-3}deg`);card.style.setProperty('--tilt-y',`${(x-.5)*3}deg`);},{passive:true});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});
  });
  document.addEventListener('visibilitychange',()=>{document.querySelectorAll('.project').forEach(card=>{const r=card.getBoundingClientRect();card.classList.toggle('art-visible',!document.hidden&&r.top<innerHeight&&r.bottom>0);});});
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.2,.65,.1,1)'});reveal.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.project,.work-heading,.about-grid,.recent>.section-heading').forEach(el=>reveal.observe(el));
})();
