window.PROTOTYPE_CONTENT = {
  intro: '半导体研发、制造与商业。二十余年，走过中国、德国、新加坡与美国，现居波特兰。',
  email: 'mailto:chenxiaobo8210@gmail.com',
  education: '<p><b>Cornell University</b><span>Executive MBA · 2021–2023<br>Machine Learning & AI · 2022–2023</span></p><p><b>Harvard Business School</b><span>CORe — High Honor · 2020–2021</span></p><p><b>南京大学</b><span>物理学学士 · 2000–2004</span></p>',
  career: '<article><span>01 / 研发起步</span><h3>从 0.25 微米出发。</h3><p>工艺集成、良率提升与技术转移。</p></article><article><span>02 / 国际经历</span><h3>把技术带到量产。</h3><p>在中国、德国和新加坡，与跨职能团队推进研发和规模化制造。</p></article><article><span>03 / 现居波特兰</span><h3>连接技术与商业。</h3><p>全球客户合作、先进制程开发与 18 埃技术量产。</p></article>'
};
window.renderPrototypeNav = function(current) {
  const el = document.querySelector('.prototype-nav');
  el.innerHTML = `<a class="all-designs" href="/designs/?v=motion2">← 全部 10 套方案</a><nav aria-label="本轮原型"><a href="/prototypes/person/?v=motion2" ${current==='person'?'aria-current="page"':''}>I · 人物叙事</a><a href="/prototypes/lab/?v=motion2" ${current==='lab'?'aria-current="page"':''}>J · 芯片实验室</a></nav><button id="motion-toggle" aria-pressed="false">暂停动效</button>`;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  document.body.dataset.motion = reduced.matches ? 'off' : 'on';
  const button = document.querySelector('#motion-toggle');
  let userChoice = false;
  function update(){const paused=document.body.dataset.motion==='off';document.documentElement.dataset.motion=document.body.dataset.motion;button.textContent=paused?'动效关闭 · 开启':'动效开启 · 暂停';button.setAttribute('aria-pressed',String(paused));}
  update();
  button.addEventListener('click',()=>{userChoice=true;document.body.dataset.motion=document.body.dataset.motion==='on'?'off':'on';update();window.dispatchEvent(new Event('motionchange'));});
  reduced.addEventListener('change',()=>{if(userChoice)return;document.body.dataset.motion=reduced.matches?'off':'on';update();window.dispatchEvent(new Event('motionchange'));});
};
