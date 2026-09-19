(() => {
  'use strict';

  const publicProjects = [
    {
      href: '/amy-psychology/',
      zh: 'Amy 名校在线课程比较',
      en: 'Amy University Course Guide',
      zhDescription: '心理学课程、费用、时间与学习路径比较。',
      enDescription: 'Psychology courses, schedules, costs and learning paths.'
    },
    {
      href: '/harvard-summer-school/',
      zh: '哈佛大学夏校指南',
      en: 'Harvard Summer School Guide',
      zhDescription: '高中生项目、线上课程与申请信息。',
      enDescription: 'Programs, online courses and application guidance.'
    },
    {
      href: '/youth-ai-stem/',
      zh: '青少年 AI 与 STEM 学习',
      en: 'Youth AI & STEM Learning',
      zhDescription: '面向青少年的 AI 学习路线与实践入口。',
      enDescription: 'An applied AI learning path for young learners.'
    },
    {
      href: '/amy-project/',
      zh: 'MindSpark Boxes 创意项目',
      en: 'MindSpark Boxes Project',
      zhDescription: '创意、课程与暑期项目规划。',
      enDescription: 'Ideas, courses and a summer project plan.'
    },
    {
      href: '/amy-project-r2/',
      zh: 'Amy 项目 R2',
      en: 'Amy Project R2',
      zhDescription: '更新版行为激活设计实验。',
      enDescription: 'A revised behavioral-activation design experiment.'
    },
    {
      href: '/trefleur/',
      zh: 'TREFLEUR 品牌预览',
      en: 'TREFLEUR Brand Preview',
      zhDescription: '高尔夫运动服品牌与首个系列。',
      enDescription: 'A golf apparel brand and its first collection.'
    }
  ];

  const projectList = document.querySelector('.public-list');
  projectList.innerHTML = publicProjects.map((project, index) => `
    <a href="${project.href}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div>
        <h3><span class="lang lang-zh">${project.zh}</span><span class="lang lang-en">${project.en}</span></h3>
        <p><span class="lang lang-zh">${project.zhDescription}</span><span class="lang lang-en">${project.enDescription}</span></p>
      </div>
      <span aria-hidden="true">↗</span>
    </a>`).join('');

  const body = document.body;
  const html = document.documentElement;
  const languageButtons = [...document.querySelectorAll('[data-language]')];
  const motionToggle = document.querySelector('.motion-toggle');

  function pinScrollPosition(top, frames = 3) {
    const previousBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, top);
    html.style.scrollBehavior = previousBehavior;
    if (frames > 0) requestAnimationFrame(() => pinScrollPosition(top, frames - 1));
  }

  function setLanguage(language) {
    const next = language === 'en' ? 'en' : 'zh';
    const keepChapter = Math.max(current, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    body.dataset.language = next;
    html.lang = next === 'en' ? 'en' : 'zh-CN';
    languageButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === next));
    });
    document.title = next === 'en' ? 'TimeMemo · New Homepage Preview' : 'TimeMemo · 新主页预览';
    try { localStorage.setItem('timememo-home-language', next); } catch (_) {}
    updateMotionLabel();

    const restoreChapter = () => {
      target = keepChapter;
      position = keepChapter;
      const destination = mobile
        ? chapterStarts[keepChapter] - navHeight
        : stageTop + keepChapter * height;
      pinScrollPosition(destination, 4);
      render();
    };

    if (matchMedia('(max-width: 760px)').matches) {
      requestAnimationFrame(() => {
        resize();
        restoreChapter();
        setTimeout(restoreChapter, 180);
      });
    } else {
      requestAnimationFrame(restoreChapter);
      setTimeout(restoreChapter, 180);
    }
  }

  languageButtons.forEach(button => {
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });

  let savedLanguage = 'zh';
  try { savedLanguage = localStorage.getItem('timememo-home-language') || 'zh'; } catch (_) {}

  /* The homepage always starts with motion on; visitors can pause it at any time. */
  body.dataset.motion = 'on';
  html.dataset.motion = 'on';

  function updateMotionLabel() {
    const paused = body.dataset.motion === 'off';
    motionToggle.innerHTML = paused
      ? '<span class="lang lang-zh">开启动效</span><span class="lang lang-en">Resume motion</span>'
      : '<span class="lang lang-zh">暂停动效</span><span class="lang lang-en">Pause motion</span>';
    motionToggle.setAttribute('aria-pressed', String(paused));
  }

  motionToggle.addEventListener('click', () => {
    body.dataset.motion = body.dataset.motion === 'on' ? 'off' : 'on';
    html.dataset.motion = body.dataset.motion;
    updateMotionLabel();
    motionChanged();
  });

  const stage = document.querySelector('.home-stage');
  const sticky = document.querySelector('.home-sticky');
  const track = document.querySelector('.home-panels');
  const panels = [...document.querySelectorAll('.home-panel')];
  const nav = document.querySelector('.site-nav');
  const chapterNav = document.querySelector('.chapter-nav');
  const counter = document.querySelector('.chapter-counter');
  const progress = document.querySelector('.page-progress span');
  const arrows = [...document.querySelectorAll('[data-step]')];
  const goButtons = [...document.querySelectorAll('[data-go]')];
  const fieldButtons = [...document.querySelectorAll('[data-field]')];
  const canvas = document.querySelector('#memo-field');
  const ctx = canvas.getContext('2d');

  const clamp = (number, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, number));
  let width = 0;
  let height = 0;
  let navHeight = 0;
  let stageTop = 0;
  let mobile = false;
  let chapterStarts = [];
  let rawProgress = 0;
  let target = 0;
  let position = 0;
  let current = -1;
  let frame = 0;
  let lastTime = 0;
  let phase = 0;
  let field = 0;
  let fieldValue = 0;
  let opening = 0;
  let pointer = { x: 0, y: 0 };
  let smoothPointer = { x: 0, y: 0 };

  function resize() {
    const wasMobile = mobile;
    mobile = matchMedia('(max-width: 760px)').matches;
    navHeight = nav.offsetHeight;
    html.style.setProperty('--nav-height', `${navHeight}px`);
    width = innerWidth;
    height = mobile ? panels[0].offsetHeight : sticky.offsetHeight;

    const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    stage.style.height = mobile ? 'auto' : `${height * panels.length}px`;
    stageTop = scrollY + stage.getBoundingClientRect().top - navHeight;
    chapterStarts = panels.map(panel => scrollY + panel.getBoundingClientRect().top);
    readScroll();

    if (wasMobile !== mobile || body.dataset.motion === 'off') {
      position = target;
    }
    render();
    draw();
  }

  function readScroll() {
    if (mobile) {
      let closest = 0;
      panels.forEach((panel, index) => {
        const panelDistance = Math.abs(chapterStarts[index] - scrollY - navHeight);
        const closestDistance = Math.abs(chapterStarts[closest] - scrollY - navHeight);
        if (panelDistance < closestDistance) closest = index;
      });
      rawProgress = closest;
      target = closest;
    } else {
      rawProgress = clamp((scrollY - stageTop) / Math.max(height, 1), 0, panels.length - 1);
      /*
       * Keep one complete desktop chapter selected. The old prototype followed
       * fractional scroll positions, which could leave a panel permanently
       * shifted and clip the beginning or end of a title.
       */
      target = Math.round(rawProgress);
    }

    if (body.dataset.motion === 'off') position = target;
    if (!frame) {
      render();
      draw();
    }
  }

  function render() {
    const moving = body.dataset.motion === 'on';
    if (!mobile) {
      track.style.transform = `translate3d(${(-position * width).toFixed(2)}px,0,0)`;
    } else {
      track.style.transform = '';
    }

    panels.forEach((panel, index) => {
      const distance = mobile ? 0 : clamp(index - position, -1.5, 1.5);
      const visibility = mobile || !moving ? 1 : clamp(1 - Math.abs(distance));
      panel.style.setProperty('--distance', distance.toFixed(4));
      panel.style.setProperty('--panel-visibility', visibility.toFixed(4));
    });

    const next = mobile ? target : Math.round(position);
    if (next !== current) {
      current = next;
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
      arrows.forEach(button => {
        button.disabled = Number(button.dataset.step) < 0 ? current === 0 : current === panels.length - 1;
      });
      goButtons.forEach(button => {
        button.setAttribute('aria-current', Number(button.dataset.go) === current ? 'page' : 'false');
      });
    }

    const progressValue = mobile
      ? (current + 1) / panels.length
      : (rawProgress + 1) / panels.length;
    progress.style.transform = `scaleX(${clamp(progressValue).toFixed(4)})`;
    chapterNav.style.color = current === 0 || current === 3 ? '#fff' : '#102751';
  }

  function go(index) {
    const next = clamp(index, 0, panels.length - 1);
    const behavior = body.dataset.motion === 'off' ? 'instant' : 'smooth';
    window.scrollTo({
      top: mobile ? chapterStarts[next] - navHeight : stageTop + next * height,
      behavior
    });
  }

  goButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      go(Number(button.dataset.go));
    });
  });

  arrows.forEach(button => {
    button.addEventListener('click', () => go(current + Number(button.dataset.step)));
  });

  fieldButtons.forEach(button => {
    button.addEventListener('click', () => {
      field = Number(button.dataset.field);
      fieldButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      if (body.dataset.motion === 'off') fieldValue = field;
      draw();
    });
  });

  sticky.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const rect = sticky.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / Math.max(width, 1) - .5;
    pointer.y = (event.clientY - rect.top) / Math.max(height, 1) - .5;
  });

  sticky.addEventListener('pointerleave', () => {
    pointer = { x: 0, y: 0 };
  });

  function drawDisc(x, y, radius, angle) {
    const ink = '#102751';
    const accent = '#d5f36c';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.clip();

    for (let mode = 0; mode < 3; mode += 1) {
      const weight = clamp(1 - Math.abs(fieldValue - mode));
      if (weight < .01) continue;
      const cell = Math.max(22, radius * (mode === 1 ? .29 : .19));
      ctx.globalAlpha = weight;
      ctx.lineWidth = Math.max(.8, radius * .003);
      ctx.strokeStyle = accent;

      for (let gridX = -radius; gridX < radius; gridX += cell) {
        for (let gridY = -radius; gridY < radius; gridY += cell) {
          if (gridX * gridX + gridY * gridY > radius * radius * 1.2) continue;
          if (mode === 1) {
            ctx.globalAlpha = weight * .18;
            ctx.fillStyle = accent;
            ctx.fillRect(gridX + 5, gridY + 5, cell - 10, cell - 10);
            ctx.globalAlpha = weight * .54;
            ctx.strokeRect(gridX + 5, gridY + 5, cell - 10, cell - 10);
          } else if (mode === 2) {
            ctx.globalAlpha = weight * .46;
            ctx.beginPath();
            ctx.moveTo(gridX, gridY);
            ctx.lineTo(gridX + cell * .65, gridY);
            ctx.lineTo(gridX + cell * .65, gridY + cell * .7);
            ctx.lineTo(gridX + cell, gridY + cell * .7);
            ctx.stroke();
          } else {
            ctx.globalAlpha = weight * .3;
            ctx.strokeRect(gridX + 2, gridY + 2, cell - 4, cell - 4);
          }
        }
      }
    }

    ctx.restore();
    ctx.globalAlpha = .72;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * .94, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    if (!width || !height) return;
    const unit = Math.min(width, height);
    const entrance = body.dataset.motion === 'on'
      ? .72 + .28 * (1 - Math.pow(1 - clamp(opening), 3))
      : 1;

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1e45d3';
    ctx.fillRect(0, 0, width, height);

    drawDisc(
      width * (mobile ? .96 : .8) + smoothPointer.x * 85,
      height * (mobile ? .59 : .34) + smoothPointer.y * 65,
      unit * (mobile ? .43 : .4) * entrance,
      phase * .13 + rawProgress * .35
    );
    drawDisc(
      width * (mobile ? .06 : 1.04) - smoothPointer.x * 55,
      height * .98 - smoothPointer.y * 45,
      unit * (mobile ? .22 : .3) * entrance,
      -phase * .16 - rawProgress * .22
    );

    for (let index = 0; index < 10; index += 1) {
      const angle = index * .72 + phase * .16;
      const centerX = width * (mobile ? .73 : .79);
      const centerY = height * (mobile ? .64 : .43);
      const dotX = centerX + Math.cos(angle) * unit * .44;
      const dotY = centerY + Math.sin(angle) * unit * .46;
      ctx.fillStyle = index % 4 === 0 ? '#d5f36c' : '#102751';
      ctx.beginPath();
      ctx.arc(dotX, dotY, unit * (.01 + (index % 3) * .008) * entrance, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick(time) {
    frame = 0;
    if (document.hidden || body.dataset.motion !== 'on') return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60;
    lastTime = time;
    const panelMix = 1 - Math.exp(-delta * 11);
    position += (target - position) * panelMix;
    if (Math.abs(position - target) < .0001) position = target;
    smoothPointer.x += (pointer.x - smoothPointer.x) * (1 - Math.exp(-delta * 7));
    smoothPointer.y += (pointer.y - smoothPointer.y) * (1 - Math.exp(-delta * 7));
    fieldValue += (field - fieldValue) * (1 - Math.exp(-delta * 9));
    phase += delta;
    opening = clamp(opening + delta / .95);
    render();
    if (!mobile || canvas.getBoundingClientRect().bottom > 0) draw();
    frame = requestAnimationFrame(tick);
  }

  function motionChanged() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (body.dataset.motion === 'off') {
      position = target;
      fieldValue = field;
      smoothPointer = { x: 0, y: 0 };
      opening = 1;
    }
    render();
    draw();
    if (!document.hidden && body.dataset.motion === 'on') {
      frame = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', motionChanged);
  resize();
  setLanguage(savedLanguage);
  document.fonts.ready.then(resize);
  motionChanged();
})();
