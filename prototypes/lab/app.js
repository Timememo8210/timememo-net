(() => {
  'use strict';
  renderPrototypeNav('lab');
  const groups=window.PROJECT_GROUPS;
  const titles=[['Semiconductor','Research'],['Applied AI','& Manufacturing'],['Beyond','the Fab']];
  const descriptions=['芯片、算力与制造机会。','从设备信号到实际工作流。','工作之外，继续保持好奇。'];
  document.querySelector('#research-panels').innerHTML=groups.map((g,i)=>
    '<section class="lab-panel lab-project" data-category="'+i+'" aria-labelledby="chapter-'+i+'">'+
    '<div class="chapter-orbit" aria-hidden="true"><span></span></div>'+
    '<div class="lab-project-head"><p class="eyebrow">SELECTED PROJECTS<span>0'+(i+1)+' / '+g.links.length+' PROJECTS</span></p>'+
    '<div class="chapter-number" aria-hidden="true">0'+g.links.length+'</div><h2 id="chapter-'+i+'">'+
    titles[i].map(t=>'<span>'+t+'</span>').join('')+'</h2><p class="project-chinese">'+g.zh+'</p><p>'+descriptions[i]+'</p></div>'+
    '<div class="lab-project-list">'+g.links.map((p,n)=>'<a href="'+p.href+'" target="_blank" rel="noopener" style="--item:'+n+'">'+
    '<span>'+String(n+1).padStart(2,'0')+'</span><div><h3>'+p.title.zh+'</h3><p>'+p.description.zh+
    '</p></div><span aria-hidden="true">↗</span></a>').join('')+'</div></section>').join('');
  document.querySelector('.lab-bio').textContent=window.PROTOTYPE_CONTENT.intro;
  document.querySelector('.education').innerHTML=window.PROTOTYPE_CONTENT.education;
  document.querySelectorAll('.lab-name h1 span').forEach(el=>{
    const inner=document.createElement('b');
    inner.textContent=el.textContent;el.textContent='';el.append(inner);
  });

  const stage=document.querySelector('.lab-stage');
  const sticky=document.querySelector('.lab-sticky');
  const track=document.querySelector('.lab-panels');
  const panels=[...document.querySelectorAll('.lab-panel')];
  const canvas=document.querySelector('#wafer-field');
  const ctx=canvas.getContext('2d');
  const nav=document.querySelector('.prototype-nav');
  const bottom=document.querySelector('.lab-bottom');
  const counter=document.querySelector('.chapter-counter');
  const progressBar=document.querySelector('.lab-progress span');
  const fieldButtons=[...document.querySelectorAll('[data-field]')];
  const mobileItems=[...document.querySelectorAll('.lab-project-list a')];
  const arrows=[...document.querySelectorAll('[data-step]')];
  const chapterLinks=[...document.querySelectorAll('[data-go]')];
  const backgrounds=[[30,69,211],[234,241,250],[221,234,245],[232,243,211],[234,240,247]];
  const inks=[[9,26,65],[37,76,198],[20,93,116],[62,96,51],[40,70,142]];
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const ease=p=>p*p*(3-2*p);
  let w=0,h=0,bar=0,mobile=false,stageTop=0,current=-1,target=0,position=0;
  let frame=0,lastTime=0,phase=0,lastDraw=0,opening=0,field=0,fieldValue=0;
  let pointer={x:0,y:0},smooth={x:0,y:0},introProgress=0;
  let chapterStarts=[],mobileProgress=[],mobileItemStarts=[];

  function palette(colors,at) {
    const a=Math.floor(clamp(at,0,4)),b=Math.min(4,a+1),t=ease(clamp(at-a));
    return 'rgb('+colors[a].map((v,i)=>Math.round(v+(colors[b][i]-v)*t)).join(',')+')';
  }
  function resize() {
    const wasMobile=mobile;
    mobile=matchMedia('(max-width:760px)').matches;
    bar=nav.offsetHeight;
    document.documentElement.style.setProperty('--bar-height',bar+'px');
    w=innerWidth;
    h=mobile?panels[0].offsetHeight:sticky.offsetHeight;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    canvas.style.height=h+'px';
    ctx?.setTransform(dpr,0,0,dpr,0,0);
    stage.style.height=mobile?'auto':h*panels.length+'px';
    stageTop=scrollY+stage.getBoundingClientRect().top-bar;
    chapterStarts=panels.map(p=>scrollY+p.getBoundingClientRect().top);
    mobileItemStarts=mobileItems.map(el=>scrollY+el.parentElement.getBoundingClientRect().top+el.offsetTop);
    document.querySelector('.field-controls p').textContent=mobile?
      '轻点切换图形，向下滑动展开项目。':'向下滚动，晶圆与项目一起移动。';
    readScroll();
    if(wasMobile!==mobile||document.body.dataset.motion==='off')position=target;
    render();draw();
  }
  function readScroll() {
    introProgress=clamp((scrollY-stageTop)/Math.max(h,1));
    if(mobile) {
      let closest=0;
      panels.forEach((p,i)=>{
        if(Math.abs(chapterStarts[i]-scrollY-bar)<Math.abs(chapterStarts[closest]-scrollY-bar))closest=i;
      });
      target=closest;
      mobileProgress=panels.map((p,i)=>clamp((innerHeight*.94-(chapterStarts[i]-scrollY))/(innerHeight*.66)));
    } else target=clamp((scrollY-stageTop)/Math.max(h,1),0,panels.length-1);
    if(!frame) {position=target;render();draw();}
  }
  function render() {
    const moving=document.body.dataset.motion==='on';
    if(!mobile)track.style.transform='translate3d('+(-position*w).toFixed(2)+'px,0,0)';
    else track.style.transform='';
    panels.forEach((panel,i)=>{
      const distance=moving?(mobile?1-(mobileProgress[i]||0):clamp(i-position,-1.6,1.6)):0;
      const visibility=moving?(mobile?(mobileProgress[i]||0):clamp(1-Math.abs(distance))):1;
      panel.style.setProperty('--distance',distance.toFixed(4));
      panel.style.setProperty('--panel-visibility',visibility.toFixed(4));
      if(mobile&&i>0) {
        const travel=clamp((scrollY+innerHeight-chapterStarts[i])/(pHeight(panel)+innerHeight));
        panel.style.setProperty('--orbit-turn',(moving?travel*125:0).toFixed(2)+'deg');
        panel.style.setProperty('--orbit-shift',(moving?(travel-.5)*110:0).toFixed(2)+'px');
      }
    });
    if(mobile)mobileItems.forEach((el,i)=>{
      const p=moving?clamp((innerHeight*.94-(mobileItemStarts[i]-scrollY))/(innerHeight*.32)):1;
      el.style.setProperty('--item-progress',p.toFixed(4));
    });
    panels[0].style.setProperty('--intro-scroll',moving?(mobile?introProgress:clamp(position)).toFixed(4):0);
    const next=mobile?target:Math.round(position);
    if(next!==current) {
      current=next;
      counter.textContent=String(current+1).padStart(2,'0')+' / 05';
      arrows.forEach(b=>b.disabled=Number(b.dataset.step)<0?current===0:current===panels.length-1);
      chapterLinks.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.go)===current)));
    }
    progressBar.style.transform='scaleX('+((position+1)/panels.length).toFixed(4)+')';
    bottom.style.color=(!mobile&&position<.28)?'#fff':'#102751';
  }
  function pHeight(panel) {return panel.offsetHeight;}
  function go(index) {
    const next=clamp(index,0,panels.length-1);
    const behavior=document.body.dataset.motion==='off'?'instant':'smooth';
    window.scrollTo({top:mobile?chapterStarts[next]-bar:stageTop+next*h,behavior});
  }
  chapterLinks.forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.go))));
  arrows.forEach(b=>b.addEventListener('click',()=>go(current+Number(b.dataset.step))));
  fieldButtons.forEach(b=>b.addEventListener('click',()=>{
    field=Number(b.dataset.field);
    fieldButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    if(document.body.dataset.motion==='off')fieldValue=field;
    draw();
  }));
  track.addEventListener('focusin',e=>{
    if(mobile)return;
    const index=panels.indexOf(e.target.closest('.lab-panel'));
    if(index>=0&&Math.abs(index-position)>.18)go(index);
  });
  sticky.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch')return;
    const r=sticky.getBoundingClientRect();
    pointer.x=(e.clientX-r.left)/w-.5;pointer.y=(e.clientY-r.top)/h-.5;
  });
  sticky.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});

  // Geometric wafer diagrams: motion and color are illustrative, never measured process data.
  function disc(x,y,r,angle,tone,accent) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    ctx.fillStyle=tone;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.clip();
    for(let mode=0;mode<3;mode++) {
      const weight=clamp(1-Math.abs(fieldValue-mode));
      if(weight<.01)continue;
      ctx.globalAlpha=weight;
      const cell=Math.max(22,r*(mode===1?.29:.19));
      ctx.lineWidth=Math.max(.8,r*.003);
      ctx.strokeStyle=accent;
      for(let a=-r;a<r;a+=cell)for(let b=-r;b<r;b+=cell) {
        if(a*a+b*b>r*r*1.2)continue;
        if(mode===1) {
          ctx.globalAlpha=weight*.18;ctx.fillStyle=accent;ctx.fillRect(a+5,b+5,cell-10,cell-10);
          ctx.globalAlpha=weight*.54;ctx.strokeRect(a+5,b+5,cell-10,cell-10);
        } else if(mode===2) {
          ctx.globalAlpha=weight*.44;
          ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a+cell*.65,b);
          ctx.lineTo(a+cell*.65,b+cell*.7);ctx.lineTo(a+cell,b+cell*.7);ctx.stroke();
          if((Math.round(a/cell)+Math.round(b/cell))%3===0) {
            ctx.globalAlpha=weight*.8;ctx.fillStyle=accent;
            ctx.beginPath();ctx.arc(a+cell*.65,b+cell*.7,2.3,0,Math.PI*2);ctx.fill();
          }
        } else {
          ctx.globalAlpha=weight*.3;ctx.strokeRect(a+2,b+2,cell-4,cell-4);
        }
      }
    }
    ctx.globalAlpha=.5;ctx.strokeStyle=accent;ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(-r,Math.sin(phase*.75)*r*.8);ctx.lineTo(r,Math.sin(phase*.75)*r*.8);ctx.stroke();
    ctx.restore();
    ctx.globalAlpha=.7;ctx.strokeStyle=accent;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.arc(0,0,r*.94,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,r*.97,-.18,.08);ctx.stroke();
    ctx.restore();
  }
  function draw() {
    if(!ctx||!w||!h)return;
    const p=mobile?0:position,t=phase,u=Math.min(w,h);
    ctx.globalAlpha=1;ctx.fillStyle=palette(backgrounds,p);ctx.fillRect(0,0,w,h);
    const tone=palette(inks,p),accent=p<.55?'#d5f36c':'#c5e3f1';
    const entrance=document.body.dataset.motion==='on'?.7+.3*(1-Math.pow(1-clamp(opening),3)):1;
    const scrollSpin=mobile?introProgress*1.3:position*1.25;
    const x=mobile?w*.98:w*(.79-Math.sin(p*.8)*.16);
    const y=mobile?h*.63:h*(.29+Math.sin(p*.8)*.15);
    const radius=u*(mobile?.46:.41)*entrance;
    disc(x+smooth.x*95+Math.sin(t*.65)*u*.025,y+smooth.y*70+Math.cos(t*.5)*u*.02,
      radius,t*.14+scrollSpin,tone,accent);
    disc(w*(mobile?.05:1.04)-smooth.x*70,h*.99-smooth.y*60,
      u*(mobile?.23:.32)*entrance,-t*.18-scrollSpin*.8,tone,accent);
    if(!mobile)disc(w*.28+smooth.x*40,h*1.12,u*.2,t*.2+scrollSpin,tone,accent);
    for(let i=0;i<11;i++) {
      const angle=i*.72+t*.16+scrollSpin*.65;
      const cx=mobile?w*.73:w*.79,cy=mobile?h*.66:h*.42;
      const sx=cx+Math.cos(angle)*u*(mobile?.42:.45)-smooth.x*25;
      const sy=cy+Math.sin(angle)*u*(mobile?.43:.48)-smooth.y*25;
      ctx.fillStyle=i%4===0?'#d5f36c':tone;
      ctx.beginPath();ctx.arc(sx,sy,u*(.01+(i%3)*.009)*entrance,0,Math.PI*2);ctx.fill();
    }
  }
  function tick(time) {
    frame=0;
    if(document.hidden||document.body.dataset.motion!=='on')return;
    const dt=lastTime?Math.min((time-lastTime)/1000,.05):1/60;lastTime=time;
    const mix=1-Math.exp(-dt*12);
    position+= (target-position)*mix;
    if(Math.abs(position-target)<.0001)position=target;
    smooth.x+=(pointer.x-smooth.x)*(1-Math.exp(-dt*7));
    smooth.y+=(pointer.y-smooth.y)*(1-Math.exp(-dt*7));
    fieldValue+=(field-fieldValue)*(1-Math.exp(-dt*9));
    phase+=dt;opening=clamp(opening+dt/.95);
    render();
    if(time-lastDraw>30 && (!mobile||canvas.getBoundingClientRect().bottom>0)) {draw();lastDraw=time;}
    frame=requestAnimationFrame(tick);
  }
  function motionChanged() {
    if(frame)cancelAnimationFrame(frame);
    frame=0;lastTime=0;
    if(document.body.dataset.motion==='off') {
      position=target;fieldValue=field;smooth={x:0,y:0};opening=1;
    }
    render();draw();
    if(!document.hidden&&document.body.dataset.motion==='on')frame=requestAnimationFrame(tick);
  }
  document.body.classList.add('motion-ready');
  window.addEventListener('scroll',readScroll,{passive:true});
  window.addEventListener('resize',resize);
  window.addEventListener('motionchange',motionChanged);
  document.addEventListener('visibilitychange',motionChanged);
  document.fonts.ready.then(resize);
  resize();motionChanged();
})();
