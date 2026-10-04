(() => {
  const dock = document.querySelector('.language-dock');
  const trigger = document.querySelector('.language-tab');
  const menu = document.querySelector('#language-menu');
  let lang = 'zh';
  try { lang = JSON.parse(localStorage.getItem('timememo-demo-language')) || 'zh'; } catch {}
  function close(restore = false) {
    dock.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); menu.inert = true;
    if (restore) trigger.focus({preventScroll:true});
  }
  function setLanguage(value) {
    lang = value === 'en' ? 'en' : 'zh';
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-zh]').forEach(el => el.textContent = el.dataset[lang]);
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
    document.title = lang === 'zh' ? '陈晓波 · AI Material / 概念预览' : 'Xiaobo Chen · AI Material / Concept';
    try { localStorage.setItem('timememo-demo-language', JSON.stringify(lang)); } catch {}
    close();
  }
  trigger.addEventListener('click', () => {
    const open = !dock.classList.contains('open');
    dock.classList.toggle('open', open); trigger.setAttribute('aria-expanded', String(open)); menu.inert = !open;
    if (open) menu.querySelector(`[data-lang="${lang}"]`).focus({preventScroll:true});
  });
  menu.querySelectorAll('button').forEach(el => el.addEventListener('click', () => {setLanguage(el.dataset.lang); trigger.focus({preventScroll:true});}));
  dock.addEventListener('focusout',e=>{if(!dock.contains(e.relatedTarget))close();});
  document.addEventListener('pointerdown', e => {if (!dock.contains(e.target)) close();});
  document.addEventListener('keydown', e => {if (e.key === 'Escape' && dock.classList.contains('open')) close(true);});
  function updateDock() {
    const hidden = scrollY > 96; dock.classList.toggle('scrolled', hidden); dock.inert = hidden;
    if (hidden) close();
  }
  addEventListener('scroll', updateDock, {passive:true}); updateDock(); setLanguage(lang);
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', event => {
    const target = document.querySelector(a.getAttribute('href')); if (!target) return;
    event.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  // If WebGL or the module fails, preserve both chapters and their links.
  const fallbackTimer = setTimeout(() => {
    if (!document.body.classList.contains('scene-ready')) document.body.classList.add('scene-fallback');
  }, 8000);
  addEventListener('scene-ready', () => clearTimeout(fallbackTimer), {once:true});
  const fallbackScroll = () => {
    if (document.body.classList.contains('scene-ready')) return;
    const runway = document.querySelector('.runway'), scene = document.querySelector('.scene');
    const p = Math.max(0, Math.min(1, scrollY / Math.max(1, runway.offsetHeight - scene.offsetHeight)));
    document.querySelector('.intro-copy').style.opacity = Math.max(0, 1-p*2.8);
    const second = document.querySelector('.network-copy');
    const show = p > .42; second.style.opacity = show ? Math.min(1,(p-.42)*4) : 0; second.style.transform = 'translateY(0)'; second.setAttribute('aria-hidden',String(!show));second.inert=!show;
    document.querySelector('.scene-progress span').style.transform = `scaleY(${p})`;
  };
  addEventListener('scroll', fallbackScroll, {passive:true});
  // Entry motion starts immediately, independently of the 3D download.
  document.querySelectorAll('.intro-copy > *').forEach((el,index) => el.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:950,delay:index*95+120,easing:'cubic-bezier(.2,.7,.1,1)',fill:'backwards'}));
  const reveal = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.animate([{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],{duration:800,easing:'cubic-bezier(.2,.65,.1,1)'});reveal.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.project,.work-heading,.latest-row').forEach(el => reveal.observe(el));
})();
