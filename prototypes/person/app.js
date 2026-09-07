(() => {
  'use strict';
  renderPrototypeNav('person');
  const content = window.PROTOTYPE_CONTENT;
  const groups = window.PROJECT_GROUPS;
  const featured = [
    {p:groups[0].links[0],label:'Semiconductor',tag:'产业研究 · 制造机会',number:'18 Å',color:'#bde4e9'},
    {p:groups[0].links[4],label:'Intel × Tesla',tag:'项目研究 · 产业观察',number:'R&D',color:'#c3d4f2'},
    {p:groups[1].links[5],label:'Applied AI',tag:'AI 应用 · 企业转型',number:'AI',color:'#dcecae'},
    {p:groups[2].links[0],label:'Beyond Work',tag:'个人项目 · 保持好奇',number:'IDEA',color:'#e3e9f1'}
  ];
  document.querySelector('.work-list').innerHTML = featured.map((f,i) =>
    '<a href="'+f.p.href+'" target="_blank" rel="noopener" data-preview="'+i+'"><h3>'+f.label+
    '</h3><span>'+f.tag+'</span><i aria-hidden="true">↗</i></a>').join('');
  document.querySelector('.career-grid').innerHTML = content.career;
  document.querySelector('.education').innerHTML = content.education;
  document.querySelector('#project-directory').innerHTML = groups.map(g =>
    '<details open><summary>'+g.zh+'<span>'+g.links.length+' 个项目</span></summary><div class="directory-links">'+
    g.links.map(p=>'<a href="'+p.href+'" target="_blank" rel="noopener"><span><b>'+p.title.zh+
      '</b><small>'+p.description.zh+'</small></span><span aria-hidden="true">↗</span></a>').join('')+
    '</div></details>').join('');

  const hero = document.querySelector('.person-hero');
  const portrait = document.querySelector('.hero-portrait');
  const marquee = document.querySelector('.name-marquee > div');
  const about = document.querySelector('.about-intro');
  const statement = about.querySelector('h2');
  statement.innerHTML = statement.innerHTML.split('<br>').map(line =>
    '<span class="statement-line"><span>'+line+'</span></span>').join('');
  const lines = [...statement.querySelectorAll('.statement-line > span')];
  const curve = document.createElement('div');
  curve.className = 'hero-curve';
  curve.setAttribute('aria-hidden','true');
  hero.append(curve);
  const strip = document.querySelector('.technical-strip');
  strip.innerHTML = '<div class="strip-row"><span>PROCESS INTEGRATION — YIELD LEARNING — GLOBAL PARTNERSHIPS — </span><span aria-hidden="true">PROCESS INTEGRATION — YIELD LEARNING — GLOBAL PARTNERSHIPS — </span></div><div class="strip-row strip-outline" aria-hidden="true"><span>SEMICONDUCTOR — RESEARCH & DEVELOPMENT — </span><span>SEMICONDUCTOR — RESEARCH & DEVELOPMENT — </span></div>';
  const strips = [...strip.querySelectorAll('.strip-row')];
  const rows = [...document.querySelectorAll('[data-preview]')];
  const preview = document.querySelector('.hover-preview');
  const floating = document.querySelector('.floating-menu');
  const footer = document.querySelector('.person-contact');
  const clamp = (n,min=0,max=1) => Math.max(min,Math.min(max,n));
  let frame = 0, previousTime = 0, scroll = scrollY, previousScroll = scrollY;
  let nameOffset = 0, stripOffset = 0, loopWidth = 1, stripWidths = [1,1];
  let hover = false, pointerX = 0, pointerY = 0, previewX = 0, previewY = 0;
  let mobile = false, heroTop = 0, viewportHeight = innerHeight, heroHeight = 1;

  // Animate children, leaving measurement anchors in normal document flow.
  function revealProgress(el,start=.92,end=.28) {
    return clamp((viewportHeight*start-el.getBoundingClientRect().top)/(viewportHeight*(start-end)));
  }
  function measure() {
    mobile = matchMedia('(max-width:760px)').matches;
    viewportHeight = innerHeight;
    heroHeight = hero.offsetHeight;
    heroTop = hero.getBoundingClientRect().top + scrollY;
    loopWidth = marquee.scrollWidth/2 || 1;
    stripWidths = strips.map(el=>el.scrollWidth/2 || 1);
    render();
  }
  function render() {
    const moving = document.body.dataset.motion === 'on';
    const y = moving ? scroll : scrollY;
    const hp = moving ? clamp((y-heroTop)/heroHeight) : 0;
    hero.style.setProperty('--hero-progress',hp.toFixed(4));
    portrait.style.transform = 'translate3d(-50%,'+(hp*(mobile?65:150)).toFixed(2)+'px,0) scale('+(1+hp*.065).toFixed(4)+')';
    if(moving) {
      marquee.style.transform = 'translate3d('+(-((nameOffset%loopWidth+loopWidth)%loopWidth)).toFixed(2)+'px,0,0)';
      strips.forEach((el,i)=>{
        const width=stripWidths[i];
        const offset=(stripOffset*(i===0?1:.78)+y*(i===0?.13:-.19))%width;
        el.style.transform='translate3d('+(-(i===0?(offset+width)%width:width-(offset+width)%width)).toFixed(2)+'px,0,0)';
      });
    }
    const ap = moving ? revealProgress(about,.96,.20) : 1;
    lines.forEach((el,i)=>{
      const p=clamp((ap-i*.12)/.67);
      el.style.transform='translate3d(0,'+((1-p)*110).toFixed(2)+'%,0) rotate('+((1-p)*3).toFixed(2)+'deg)';
    });
    about.style.setProperty('--about-progress',ap.toFixed(4));
    rows.forEach((el,i)=>{
      const p=moving?revealProgress(el,.98,.56):1;
      el.style.setProperty('--row-progress',p.toFixed(4));
      el.style.setProperty('--row-direction',i%2===0?1:-1);
    });
    const fp=moving?revealProgress(footer,1,.25):1;
    footer.style.setProperty('--footer-progress',fp.toFixed(4));
    floating.classList.toggle('shown',scrollY>viewportHeight*.65);
    if(hover && moving) {
      previewX+=(pointerX-previewX)*.16;
      previewY+=(pointerY-previewY)*.16;
      preview.style.left=previewX+'px';
      preview.style.top=previewY+'px';
    }
  }
  function tick(time) {
    frame=0;
    if(document.hidden || document.body.dataset.motion!=='on') return;
    const dt=previousTime ? Math.min((time-previousTime)/1000,.05) : 1/60;
    previousTime=time;
    scroll += (scrollY-scroll)*(1-Math.exp(-dt*13));
    const delta=scroll-previousScroll;
    previousScroll=scroll;
    if(hero.getBoundingClientRect().bottom>0) nameOffset+=dt*(mobile?38:72)+delta*.32;
    const stripRect=strip.getBoundingClientRect();
    if(stripRect.bottom>0 && stripRect.top<viewportHeight) stripOffset+=dt*28;
    render();
    frame=requestAnimationFrame(tick);
  }
  function motionChanged() {
    if(frame) cancelAnimationFrame(frame);
    frame=0; previousTime=0; scroll=scrollY; previousScroll=scrollY;
    document.querySelectorAll('.magnetic').forEach(el=>el.style.transform='');
    render();
    if(!document.hidden && document.body.dataset.motion==='on') frame=requestAnimationFrame(tick);
  }

  rows.forEach(el=>{
    el.addEventListener('pointerenter',e=>{
      if(e.pointerType==='touch'||mobile) return;
      const f=featured[Number(el.dataset.preview)];
      preview.style.background=f.color;
      preview.querySelector('.hover-topic').textContent=f.p.title.zh;
      preview.querySelector('.hover-number').textContent=f.number;
      pointerX=previewX=clamp(e.clientX,155,innerWidth-155);
      pointerY=previewY=e.clientY;
      preview.style.left=previewX+'px';preview.style.top=previewY+'px';
      hover=true;preview.classList.add('is-visible');
    });
    el.addEventListener('pointermove',e=>{
      pointerX=clamp(e.clientX,155,innerWidth-155);
      pointerY=clamp(e.clientY,145,innerHeight-145);
      if(document.body.dataset.motion==='off') {
        preview.style.left=pointerX+'px';preview.style.top=pointerY+'px';
      }
    });
    el.addEventListener('pointerleave',()=>{hover=false;preview.classList.remove('is-visible');});
  });
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch'||document.body.dataset.motion==='off')return;
      const r=el.getBoundingClientRect();
      el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22)+'px,'+((e.clientY-r.top-r.height/2)*.22)+'px)';
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
  if('IntersectionObserver' in window) {
    const targets=[...document.querySelectorAll('.career-grid article,.education > p,.section-heading,.directory-section details')];
    targets.forEach((el,i)=>{el.classList.add('detail-reveal');el.style.setProperty('--delay',(i%3)*85+'ms');});
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting)e.target.classList.add('is-in');
      else if(e.boundingClientRect.top>viewportHeight)e.target.classList.remove('is-in');
    }),{threshold:.08});
    targets.forEach(el=>observer.observe(el));
  }
  document.body.classList.add('motion-ready');
  window.addEventListener('scroll',()=>{if(!frame)render();},{passive:true});
  window.addEventListener('resize',measure);
  window.addEventListener('motionchange',motionChanged);
  document.addEventListener('visibilitychange',motionChanged);
  document.fonts.ready.then(measure);
  measure();motionChanged();
})();
