(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('#wafer');
  const ctx = canvas.getContext('2d');
  const portal = document.querySelector('.portal-feature');
  const orbit = document.querySelector('.portal-orbit');
  const name = document.querySelector('.hero-name');
  const note = document.querySelector('.hero-note');
  const controls = document.querySelector('.field-controls');
  const portrait = document.querySelector('.portrait img');
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const ease = 'cubic-bezier(.16,1,.3,1)';
  const active = () => document.body.dataset.motion === 'on' && !document.hidden;
  const animations = new Set();
  const visibleReveals = new Set();
  const observed = new Set();
  let width = 0, height = 0, frame = 0, last = 0, phase = 0;
  let field = 0, morph = 0, heroVisible = true, portalVisible = false, portraitVisible = false;
  let scrollTarget = 0, scrollPosition = 0, entrance = 1, dirty = true;
  let pointer = {x: 0, y: 0}, smooth = {x: 0, y: 0};
  let heroTop = 0, portraitTop = 0, portraitHeight = 0, portalTop = 0, portalHeight = 0;

  // Render geometry once. Each frame composites textures instead of rebuilding hundreds of paths.
  const textureSize = 768, textureRadius = 374;
  const textures = [0, 1, 2].map(mode => {
    const layer = document.createElement('canvas');
    layer.width = layer.height = textureSize;
    const c = layer.getContext('2d');
    if (!c) return layer;
    c.translate(textureSize / 2, textureSize / 2);
    c.beginPath(); c.arc(0, 0, textureRadius, 0, Math.PI * 2); c.clip();
    c.strokeStyle = '#d7f56f'; c.fillStyle = '#d7f56f'; c.lineWidth = 1.9;
    const cell = mode === 1 ? 120 : 72;
    for (let x = -420; x < 420; x += cell) {
      for (let y = -420; y < 420; y += cell) {
        if (mode === 0) {
          c.globalAlpha = .43; c.strokeRect(x + 3, y + 3, cell - 6, cell - 6);
          c.globalAlpha = .14; c.strokeRect(x + 9, y + 9, cell - 18, cell - 18);
        } else if (mode === 1) {
          c.globalAlpha = .16; c.fillRect(x + 16, y + 16, cell - 32, cell - 32);
          c.globalAlpha = .8; c.strokeRect(x + 16, y + 16, cell - 32, cell - 32);
          c.globalAlpha = .4;
          for (let pin = 30; pin < 90; pin += 15) {
            c.fillRect(x + pin, y + 9, 3, 7); c.fillRect(x + 9, y + pin, 7, 3);
          }
        } else {
          c.globalAlpha = .55;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + 46, y);
          c.lineTo(x + 46, y + 46); c.lineTo(x + cell, y + 46); c.stroke();
          c.globalAlpha = .85; c.beginPath(); c.arc(x + 46, y + 46, 4, 0, Math.PI * 2); c.fill();
        }
      }
    }
    return layer;
  });

  function disc(x, y, radius, angle, satellite = false) {
    if (!ctx) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = '#102751'; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.clip();
    for (let mode = 0; mode < 3; mode++) {
      const alpha = clamp(1 - Math.abs(morph - mode));
      if (alpha > .002) {
        ctx.globalAlpha = alpha;
        const size = radius * textureSize / textureRadius;
        ctx.drawImage(textures[mode], -size / 2, -size / 2, size, size);
      }
    }
    // A moving scan line makes motion legible even when most of the wafer is outside a phone viewport.
    const scan = Math.sin(phase * .75) * radius * .82;
    const glow = ctx.createLinearGradient(0, scan - 26, 0, scan + 6);
    glow.addColorStop(0, '#d7f56f00'); glow.addColorStop(1, '#d7f56f24');
    ctx.globalAlpha = 1; ctx.fillStyle = glow; ctx.fillRect(-radius, scan - 26, radius * 2, 32);
    ctx.strokeStyle = '#d7f56f'; ctx.lineWidth = satellite ? 1 : 1.6;
    ctx.globalAlpha = .8; ctx.beginPath(); ctx.moveTo(-radius, scan); ctx.lineTo(radius, scan); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = .65; ctx.strokeStyle = '#d7f56f'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(0, 0, radius * .95, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, radius * .985, -.18, .12); ctx.stroke();
    ctx.restore();
  }

  function draw() {
    if (!ctx || !width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const mobile = width <= 700;
    const reveal = 1 - Math.pow(1 - entrance, 3);
    const radius = (mobile ? width * .56 : Math.min(width * .25, height * .45)) * (.75 + reveal * .25);
    const x = width * (mobile ? 1.02 : .84) + smooth.x * 62 - scrollPosition * (mobile ? 38 : 95);
    const y = height * (mobile ? .49 : .4) + smooth.y * 40 + Math.sin(phase * .6) * 12 + scrollPosition * 90;
    const angle = phase * .19 + scrollPosition * 1.3;
    disc(x, y, radius, angle);
    disc(width * (mobile ? .04 : .42) - smooth.x * 20 + scrollPosition * 45,
      height * 1.07 - scrollPosition * 40, Math.min(width, height) * .22, -phase * .24 - scrollPosition, true);
    for (let i = 0; i < 5; i++) {
      const a = phase * .33 + i * Math.PI * 2 / 5 + scrollPosition;
      const px = x + Math.cos(a) * radius * 1.1, py = y + Math.sin(a) * radius * 1.1;
      ctx.fillStyle = i % 2 ? '#102751' : '#d7f56f';
      ctx.beginPath(); ctx.arc(px, py, i % 2 ? 8 : 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  function play(el, keyframes, options = {}) {
    if (!active() || !el.animate) return;
    const animation = el.animate(keyframes, {duration: 850, easing: ease, ...options});
    animations.add(animation);
    const done = () => animations.delete(animation);
    animation.onfinish = done; animation.oncancel = done;
  }

  function intro() {
    if (!heroVisible || !active()) return;
    entrance = 0;
    document.querySelectorAll('.hero h1 span').forEach((el, i) => play(el,
      [{transform: 'translate3d(0,65px,0) rotate(3deg)', opacity: 0, clipPath: 'inset(100% 0 0 0)'},
       {transform: 'translate3d(0,0,0) rotate(0)', opacity: 1, clipPath: 'inset(0 0 0 0)'}],
      {duration: 1200, delay: i * 120, fill: 'backwards'}));
    play(document.querySelector('.hero-role'), [{opacity: 0, transform: 'translateY(24px)'}, {opacity: 1, transform: 'none'}], {delay: 250, fill: 'backwards'});
    play(note, [{opacity: 0, translate: '0 24px'}, {opacity: 1, translate: '0 0'}], {delay: 330, fill: 'backwards'});
    play(controls, [{opacity: 0, translate: '0 55px', rotate: '5deg'}, {opacity: 1, translate: '0 0', rotate: '0deg'}], {duration: 1000, delay: 180, fill: 'backwards'});
  }

  function reveal(el, index = 0) {
    el.dataset.revealed = 'true';
    if (!active()) return;
    const row = el.classList.contains('project-row');
    play(el, [{opacity: .05, translate: row ? '38px 18px' : '0 48px'}, {opacity: 1, translate: '0 0'}],
      {duration: row ? 760 : 1000, delay: Math.min(index, 4) * 65, fill: 'backwards'});
  }
  const revealObserver = new IntersectionObserver(entries => {
    let index = 0;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        visibleReveals.add(entry.target);
        if (entry.target.dataset.revealed !== 'true') reveal(entry.target, index++);
      } else {
        visibleReveals.delete(entry.target);
        // Replay on a later visit to a chapter, not on tiny viewport-boundary oscillations.
        if (entry.boundingClientRect.top > innerHeight + 50) entry.target.dataset.revealed = 'false';
      }
    }
  }, {threshold: .08});

  function observeContent() {
    for (const el of observed) if (!el.isConnected) {observed.delete(el); visibleReveals.delete(el); revealObserver.unobserve(el);}
    // Cancel detached filtering results instead of retaining their animation objects.
    for (const a of animations) if (!a.effect?.target?.isConnected) a.cancel();
    document.querySelectorAll('.section-heading, .recent-list .project-row, .portal-feature, .catalog-group > h3, .catalog-group .project-row, .about-copy > h3, .education-row, .company').forEach(el => {
      if (observed.has(el)) return;
      observed.add(el); el.dataset.revealed = 'false'; revealObserver.observe(el);
    });
    measure(); wake();
  }

  function measure() {
    width = hero.clientWidth; height = hero.clientHeight;
    heroTop = hero.getBoundingClientRect().top + scrollY;
    const r = portrait.getBoundingClientRect();
    portraitTop = r.top + scrollY; portraitHeight = r.height;
    portalTop = portal.getBoundingClientRect().top + scrollY; portalHeight = portal.offsetHeight;
    if (ctx) {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.round(width * dpr), h = Math.round(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    scrollTarget = clamp((scrollY - heroTop) / Math.max(height, 1)); dirty = true;
  }

  function layers() {
    const on = active(), p = on ? scrollPosition : 0;
    if (heroVisible || !on) {
      name.style.transform = `translate3d(${-p * (width <= 700 ? 22 : 65)}px,${-p * 62}px,0)`;
      note.style.transform = `translate3d(0,${-p * 90}px,0)`;
      controls.style.transform = `translate3d(0,${p * 55}px,0) rotate(${-2 + p * 5}deg)`;
    }
    if (portalVisible || !on) {
      const travel = on ? clamp((scrollY + innerHeight - portalTop) / (innerHeight + portalHeight)) : .5;
      orbit.style.transform = `translate3d(0,${(travel - .5) * 45}px,0) rotate(${-25 + (on ? phase * 12 + travel * 50 : 0)}deg)`;
    }
    if (portraitVisible || !on) {
      const travel = on ? clamp((scrollY + innerHeight - portraitTop) / (innerHeight + portraitHeight)) : .5;
      portrait.style.transform = on ? `translate3d(0,${(travel - .5) * 24}px,0) scale(1.025)` : 'none';
    }
    dirty = false;
  }

  function tick(time) {
    frame = 0;
    if (!active()) return;
    const dt = last ? Math.min((time - last) / 1000, .05) : 1 / 60;
    last = time; phase += dt;
    const mix = 1 - Math.exp(-dt * 11);
    scrollPosition += (scrollTarget - scrollPosition) * mix;
    smooth.x += (pointer.x - smooth.x) * (1 - Math.exp(-dt * 7));
    smooth.y += (pointer.y - smooth.y) * (1 - Math.exp(-dt * 7));
    morph += (field - morph) * (1 - Math.exp(-dt * 8));
    entrance = clamp(entrance + dt / 1.1);
    if (heroVisible) draw();
    if (dirty || heroVisible || portalVisible || Math.abs(scrollTarget - scrollPosition) > .0001) layers();
    if (heroVisible || portalVisible || Math.abs(scrollTarget - scrollPosition) > .0001) frame = requestAnimationFrame(tick);
    else last = 0;
  }
  function wake() { if (active() && !frame) frame = requestAnimationFrame(tick); }

  function sync(event) {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    if (!active()) {
      animations.forEach(a => a.cancel()); animations.clear();
      morph = field; entrance = 1; smooth = {x: 0, y: 0}; scrollPosition = scrollTarget;
      layers(); draw();
    } else {
      if (event?.detail?.changed) {intro(); let i = 0; visibleReveals.forEach(el => reveal(el, i++));}
      for (const a of animations) if (a.playState === 'paused') a.play();
      dirty = true; wake();
    }
  }

  new ResizeObserver(() => {measure(); if (!active()) {layers(); draw();} wake();}).observe(hero);
  new ResizeObserver(() => {measure(); wake();}).observe(document.querySelector('main'));
  new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === hero) heroVisible = entry.isIntersecting;
    }
    dirty = true; wake();
  }).observe(hero);
  // Dedicated observers keep the frame loop asleep when no animated illustration is in view.
  new IntersectionObserver(entries => {portalVisible = entries[0].isIntersecting; dirty = true; wake();}).observe(portal);
  new IntersectionObserver(entries => {portraitVisible = entries[0].isIntersecting; dirty = true; wake();}).observe(portrait);
  window.addEventListener('scroll', () => {
    scrollTarget = clamp((scrollY - heroTop) / Math.max(height, 1)); dirty = true; wake();
  }, {passive: true});
  window.addEventListener('resize', () => {measure(); wake();}, {passive: true});
  hero.addEventListener('pointermove', e => {
    if (!active() || e.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    pointer = {x: (e.clientX - rect.left) / width - .5, y: (e.clientY - rect.top) / height - .5}; wake();
  }, {passive: true});
  hero.addEventListener('pointerleave', () => {pointer = {x: 0, y: 0};});
  document.querySelectorAll('[data-field]').forEach(button => button.addEventListener('click', () => {
    field = Number(button.dataset.field);
    document.querySelectorAll('[data-field]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    if (!active()) {morph = field; draw();}
    else {play(button, [{translate: '0 0'}, {translate: '0 -5px', offset: .3}, {translate: '0 0'}], {duration: 450}); wake();}
  }));
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', () => {measure(); sync();});
  window.addEventListener('home-motion-change', sync);
  window.addEventListener('home-content-change', observeContent);
  document.fonts.ready.then(() => {measure(); wake();});
  // All content is visible without JS, with motion disabled, and after an interrupted animation.
  document.body.classList.add('motion-ready'); observeContent(); measure(); draw(); intro(); wake();
})();
