(() => {
  'use strict';
  const rails=[...document.querySelectorAll('.horizontal-rail')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const lang=()=>window.homeLanguage==='en'?'en':'zh';
  const update=rail=>{
    const labels={'selected-rail':['精选项目','Selected projects'],'recent-rail':['最近更新','Latest updates'],'catalog-results':['项目分类','Project categories'],'history-list':['最近打开','Recently opened']};
    if(labels[rail.id])rail.setAttribute('aria-label',labels[rail.id][lang()==='en'?1:0]);
    const controls=document.querySelector(`[data-rail-controls="${rail.id}"]`);if(!controls)return;
    const overflow=rail.scrollWidth>rail.clientWidth+4;
    controls.dataset.overflow=String(overflow);
    controls.querySelector('[data-direction="-1"]').disabled=!overflow||rail.scrollLeft<3;
    controls.querySelector('[data-direction="1"]').disabled=!overflow||rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-3;
    const items=[...rail.children];
    const x=rail.getBoundingClientRect().left;
    const nearest=items.reduce((best,item,i)=>Math.abs(item.getBoundingClientRect().left-x)<best.distance?{index:i,distance:Math.abs(item.getBoundingClientRect().left-x)}:best,{index:0,distance:Infinity});
    controls.querySelector('.rail-position').textContent=items.length?`${String(nearest.index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`:'';
    controls.querySelectorAll('[data-aria-zh]').forEach(b=>b.setAttribute('aria-label',b.dataset[lang()==='en'?'ariaEn':'ariaZh']));
  };
  const move=(rail,direction)=>{
    const items=[...rail.children];if(!items.length)return;
    const origin=rail.getBoundingClientRect().left;
    const positions=items.map(el=>el.getBoundingClientRect().left-origin+rail.scrollLeft-2);
    const target=direction>0?positions.find(x=>x>rail.scrollLeft+5):positions.slice().reverse().find(x=>x<rail.scrollLeft-5);
    rail.scrollTo({left:target??(direction>0?rail.scrollWidth:0),behavior:reduced.matches?'instant':'smooth'});
  };
  rails.forEach(rail=>{
    const controls=document.querySelector(`[data-rail-controls="${rail.id}"]`);
    controls?.querySelectorAll('button[data-direction]').forEach(b=>b.addEventListener('click',()=>move(rail,Number(b.dataset.direction))));
    let queued=false;
    rail.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;update(rail);});}},{passive:true});
    rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(rail,e.key==='ArrowRight'?1:-1);}if(e.key==='Home'||e.key==='End'){e.preventDefault();rail.scrollTo({left:e.key==='Home'?0:rail.scrollWidth,behavior:'smooth'});}});
    let drag=null,suppressClick=false;
    rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:rail.scrollLeft,active:false};suppressClick=false;});
    rail.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(!drag.active&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(e.clientY-drag.y)){drag.active=true;rail.setPointerCapture(e.pointerId);rail.classList.add('is-dragging');}if(drag.active){e.preventDefault();rail.scrollLeft=drag.left-dx;suppressClick=true;}});
    const end=()=>{drag=null;rail.classList.remove('is-dragging');};
    rail.addEventListener('pointerup',end);rail.addEventListener('pointercancel',end);rail.addEventListener('lostpointercapture',end);rail.addEventListener('pointerleave',()=>{if(drag&&!drag.active)end();});
    rail.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
    rail.addEventListener('dragstart',e=>e.preventDefault());
    new ResizeObserver(()=>update(rail)).observe(rail);
    new MutationObserver(()=>update(rail)).observe(rail,{childList:true});
    if(controls){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){controls.classList.add('hint-active');observer.disconnect();}},{threshold:.7});observer.observe(controls);}
    update(rail);
  });
  addEventListener('home-rails-update',()=>rails.forEach(update));addEventListener('home-language',()=>rails.forEach(update));
})();
