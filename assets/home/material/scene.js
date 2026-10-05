import * as THREE from './vendor/three.module.min.js';
import {AI_GLYPH} from './glyph-layout.js';

const canvas = document.querySelector('#material-canvas');
const sceneEl = document.querySelector('.scene');
const runway = document.querySelector('.runway');
const intro = document.querySelector('.intro-copy');
const networkCopy = document.querySelector('.network-copy');
const aiCopy = document.querySelector('.ai-copy');
const progressBar = document.querySelector('.scene-progress span');
const labelIndex = document.querySelector('.label-index');
const labelWord = document.querySelector('.label-word');
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const smooth = (a,b,x) => THREE.MathUtils.smoothstep(x,a,b);
const rand = i => {const n = Math.sin(i * 127.1 + 311.7)*43758.5453; return n - Math.floor(n);};

try {
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36,1,.1,80);
  camera.position.set(0,0,12);

  // A local studio environment gives the wafer broad, moving reflections.
  // No model downloads, HDR requests or remote scripts at runtime.
  const studio = document.createElement('canvas'); studio.width=1024;studio.height=512;
  const env = studio.getContext('2d'); env.fillStyle='#242e3c';env.fillRect(0,0,1024,512);
  function panel(x,y,w,h,color) {
    const grad=env.createRadialGradient(x,y,0,x,y,w);grad.addColorStop(0,color);grad.addColorStop(.35,color);grad.addColorStop(1,'#242e3c');
    env.save();env.translate(0,y);env.scale(1,h/w);env.translate(0,-y);env.fillStyle=grad;env.fillRect(x-w,y-w,w*2,w*2);env.restore();
  }
  panel(260,150,155,200,'#f8fbff');panel(735,225,95,230,'#e3eeff');panel(960,340,105,180,'#a1bad8');
  env.fillStyle='#e0efff';env.fillRect(500,70,15,295);
  let environmentMap;
  function rebuildEnvironment(){
    const environment = new THREE.CanvasTexture(studio);environment.mapping=THREE.EquirectangularReflectionMapping;environment.colorSpace=THREE.SRGBColorSpace;
    const pmrem=new THREE.PMREMGenerator(renderer),previous=environmentMap;
    environmentMap=pmrem.fromEquirectangular(environment);scene.environment=environmentMap.texture;
    previous?.dispose();environment.dispose();pmrem.dispose();
  }
  rebuildEnvironment();
  scene.add(new THREE.AmbientLight(0xd1dfef,.72));
  const key = new THREE.DirectionalLight(0xfff6ee,4);key.position.set(-3,4,6);scene.add(key);
  const fill = new THREE.DirectionalLight(0xffbd9b,2.0);fill.position.set(5,-1,3);scene.add(fill);
  const edge = new THREE.DirectionalLight(0xd2e9ff,1.5);edge.position.set(-4,-2,-1);scene.add(edge);
  const pointerLight = new THREE.PointLight(0xe3f5ff,28,16,2);pointerLight.position.set(0,0,5);scene.add(pointerLight);

  const assembly = new THREE.Group();scene.add(assembly);
  const base = new THREE.Group();assembly.add(base);
  const discMaterial = new THREE.MeshPhysicalMaterial({color:0xa0b2c8,metalness:1,roughness:.21,clearcoat:1,clearcoatRoughness:.15,transparent:true,opacity:1,envMapIntensity:1.6});
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.12,2.12,.066,128),discMaterial);disc.rotation.x=Math.PI/2;base.add(disc);
  const rimMaterial = new THREE.MeshStandardMaterial({color:0xeaf3ff,metalness:1,roughness:.12,transparent:true,opacity:1,envMapIntensity:2});
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.116,.019,8,160),rimMaterial);rim.position.z=.031;base.add(rim);
  const backside = new THREE.Mesh(new THREE.TorusGeometry(2.11,.013,8,128),rimMaterial);backside.position.z=-.04;base.add(backside);
  const notch = new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),new THREE.MeshBasicMaterial({color:0x111c2a}));notch.position.set(0,-2.12,.012);base.add(notch);

  const tile = document.createElement('canvas');tile.width=256;tile.height=256;
  const ctx=tile.getContext('2d');ctx.fillStyle='#a4b2c3';ctx.fillRect(0,0,256,256);
  ctx.fillStyle='#b7c5d5';ctx.fillRect(9,9,238,238);ctx.strokeStyle='#677c95';ctx.lineWidth=3;ctx.strokeRect(16,16,224,224);
  ctx.fillStyle='#8499b1';ctx.fillRect(43,36,114,146);ctx.strokeStyle='#d4e3f4';ctx.lineWidth=1;
  for(let i=0;i<12;i++){ctx.strokeRect(48+i*3,41+i*4,100-i*6,133-i*8);}
  for(let i=0;i<13;i++){ctx.fillStyle=i%3?'#788da8':'#cbdbee';ctx.fillRect(174,35+i*12,49,5);}
  ctx.fillStyle='#d5e4f6';for(let i=0;i<11;i++){ctx.fillRect(34+i*17,208,10,14);ctx.fillRect(207,36+i*15,12,5);}
  ctx.strokeStyle='#e3efff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(30,190);ctx.lineTo(164,190);ctx.lineTo(164,25);ctx.stroke();
  const texture = new THREE.CanvasTexture(tile);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const chipMaterial = new THREE.MeshPhysicalMaterial({map:texture,color:0xf4f8ff,metalness:.9,roughness:.25,clearcoat:.8,clearcoatRoughness:.2,envMapIntensity:1.7,iridescence:.07,iridescenceIOR:1.4,iridescenceThicknessRange:[150,300]});
  const origins=[];
  for(let y=-7;y<=7;y++)for(let x=-7;x<=7;x++)if(Math.hypot(x*.26,y*.26)<1.93)origins.push(new THREE.Vector3(x*.26,y*.26,.071));
  const count=origins.length;
  const chipEdgeMaterial = new THREE.MeshPhysicalMaterial({color:0xc0cfde,metalness:1,roughness:.17,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:2});
  const chips = new THREE.InstancedMesh(new THREE.BoxGeometry(.241,.241,.035),[chipEdgeMaterial,chipEdgeMaterial,chipEdgeMaterial,chipEdgeMaterial,chipMaterial,chipEdgeMaterial],count);chips.instanceMatrix.setUsage(THREE.DynamicDrawUsage);chips.frustumCulled=false;assembly.add(chips);
  const color=new THREE.Color();
  origins.forEach((_,i)=>{color.setHSL(.57+rand(i)*.05,.025+rand(i+71)*.04,.65+rand(i+60)*.2);chips.setColorAt(i,color);});
  const targets=origins.map((_,i)=>{const t=(i+.5)/count,phi=Math.acos(1-2*t),theta=i*2.39996323;const r=2.13+rand(i+15)*.23;return new THREE.Vector3(r*Math.cos(theta)*Math.sin(phi),r*Math.sin(theta)*Math.sin(phi),r*Math.cos(phi));});
  const layouts=AI_GLYPH.points.map(p=>new THREE.Vector3(...p));
  if(layouts.length!==count)throw new Error('Glyph and wafer tile counts differ');
  const current=origins.map(v=>v.clone());
  // Nearest-neighbour edges keep the graph legible instead of drawing a web over everything.
  const pairs=[], unique=new Set();
  targets.forEach((p,i)=>{const neighbors=targets.map((q,j)=>({j,d:i===j?Infinity:p.distanceToSquared(q)})).sort((a,b)=>a.d-b.d).slice(0,3);neighbors.forEach(({j})=>{const a=Math.min(i,j),b=Math.max(i,j),id=a+':'+b;if(!unique.has(id)){unique.add(id);pairs.push([a,b]);}});});
  const positions=new Float32Array(pairs.length*6);const graphGeo=new THREE.BufferGeometry();graphGeo.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  const edgeColors=new Float32Array(pairs.length*6);graphGeo.setAttribute('color',new THREE.BufferAttribute(edgeColors,3).setUsage(THREE.DynamicDrawUsage));
  const lineMaterial=new THREE.LineBasicMaterial({color:0xffc1a1,vertexColors:true,transparent:true,opacity:0,depthWrite:false});
  const graph=new THREE.LineSegments(graphGeo,lineMaterial);graph.frustumCulled=false;assembly.add(graph);
  // Soft sprites, coloured vertices and short trails reveal the direction of flow.
  const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;
  const gc=glowCanvas.getContext('2d'),gradient=gc.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.16,'rgba(235,246,255,.95)');gradient.addColorStop(.4,'rgba(200,225,255,.28)');gradient.addColorStop(1,'rgba(200,225,255,0)');gc.fillStyle=gradient;gc.fillRect(0,0,64,64);
  const glowTexture=new THREE.CanvasTexture(glowCanvas);
  const packetCount=38,trailLength=5,packetPositions=new Float32Array(packetCount*trailLength*3),packetColors=new Float32Array(packetPositions.length);
  for(let i=0;i<packetCount*trailLength;i++){const brightness=Math.pow(1-(i%trailLength)/trailLength,1.7);packetColors.set([brightness,brightness,brightness],i*3);}
  const packetGeo=new THREE.BufferGeometry();packetGeo.setAttribute('position',new THREE.BufferAttribute(packetPositions,3).setUsage(THREE.DynamicDrawUsage));packetGeo.setAttribute('color',new THREE.BufferAttribute(packetColors,3));
  const packetMaterial=new THREE.PointsMaterial({color:0xf3f9ff,size:.10,map:glowTexture,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  const packets=new THREE.Points(packetGeo,packetMaterial);packets.frustumCulled=false;assembly.add(packets);
  const nodePositions=new Float32Array(count*3),nodeColors=new Float32Array(count*3),nodePulse=new Float32Array(count);
  const nodeGeo=new THREE.BufferGeometry();nodeGeo.setAttribute('position',new THREE.BufferAttribute(nodePositions,3).setUsage(THREE.DynamicDrawUsage));nodeGeo.setAttribute('color',new THREE.BufferAttribute(nodeColors,3).setUsage(THREE.DynamicDrawUsage));
  const nodeMaterial=new THREE.PointsMaterial({color:0xddeeff,size:.16,map:glowTexture,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  const nodeGlow=new THREE.Points(nodeGeo,nodeMaterial);nodeGlow.frustumCulled=false;assembly.add(nodeGlow);
  // Two angled routes and an inner crystal add depth while the original chips stay visible.
  const networkRig=new THREE.Group();assembly.add(networkRig);
  const orbitMaterial=new THREE.MeshBasicMaterial({color:0xffbd98,transparent:true,opacity:0,depthWrite:false});
  const orbitHeadMaterial=new THREE.MeshBasicMaterial({color:0xf0f7ff,transparent:true,opacity:0,depthWrite:false});
  const orbits=[];
  for(let i=0;i<2;i++){
    const orbit=new THREE.Group();
    orbit.add(new THREE.Mesh(new THREE.TorusGeometry(2.27+i*.11,.009,5,120,Math.PI*1.6),orbitMaterial));
    orbit.add(new THREE.Mesh(new THREE.TorusGeometry(2.27+i*.11,.017,6,32,.34),orbitHeadMaterial));
    networkRig.add(orbit);orbits.push(orbit);
  }
  const core=new THREE.Group();networkRig.add(core);
  const coreMaterial=new THREE.MeshPhysicalMaterial({color:0xd6e7fc,metalness:.85,roughness:.16,transparent:true,opacity:0,depthWrite:false,envMapIntensity:1.7});
  core.add(new THREE.Mesh(new THREE.BoxGeometry(.48,.48,.48),coreMaterial));
  const coreWireMaterial=new THREE.LineBasicMaterial({color:0xe6f2ff,transparent:true,opacity:0});
  core.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.8,.8,.8)),coreWireMaterial));
  const spokePositions=new Float32Array(8*6),spokeGeo=new THREE.BufferGeometry();spokeGeo.setAttribute('position',new THREE.BufferAttribute(spokePositions,3).setUsage(THREE.DynamicDrawUsage));
  const spokeMaterial=new THREE.LineBasicMaterial({color:0xd7e9ff,transparent:true,opacity:0,depthWrite:false});
  const spokes=new THREE.LineSegments(spokeGeo,spokeMaterial);spokes.frustumCulled=false;networkRig.add(spokes);

  const guideMaterial=new THREE.LineBasicMaterial({color:0xbcd3f0,transparent:true,opacity:.16});
  const guidePts=[];for(let i=0;i<128;i++){const a=i/128*Math.PI*2;guidePts.push(new THREE.Vector3(Math.cos(a)*2.39,Math.sin(a)*2.39,-.13));}
  const guide=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(guidePts),guideMaterial);base.add(guide);
  const tickPts=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2,r=i%8===0?2.48:2.43;tickPts.push(new THREE.Vector3(Math.cos(a)*2.4,Math.sin(a)*2.4,-.13),new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,-.13));}
  const ticks=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPts),guideMaterial);base.add(ticks);
  const sweepMaterial=new THREE.MeshBasicMaterial({color:0xf0f8ff,transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const sweep=new THREE.Mesh(new THREE.PlaneGeometry(1,.01),sweepMaterial);sweep.position.z=.096;base.add(sweep);
  const dustGeo=new THREE.BufferGeometry(),dustArray=new Float32Array(110*3);
  for(let i=0;i<110;i++){dustArray[i*3]=(rand(i+134)-.5)*15;dustArray[i*3+1]=(rand(i+288)-.5)*10;dustArray[i*3+2]=-3-rand(i+567)*3;}
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustArray,3));
  const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xb3cfee,size:.016,transparent:true,opacity:.38,depthWrite:false}));scene.add(dust);

  let width=1,height=1,mobile=false,maxScroll=1,targetScroll=0,scroll=0,pointerX=0,pointerY=0,px=0,py=0,elapsed=0,last=0,raf=0,active=true,contextLost=false,phase=-1,labelLang='',ripple=-100,frameCount=0;
  const dummy=new THREE.Object3D();
  function resize(){width=sceneEl.clientWidth;height=sceneEl.clientHeight;mobile=width<760;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();maxScroll=Math.max(1,runway.offsetHeight-height);targetScroll=clamp(scrollY/maxScroll,0,1);}
  function readScroll(){targetScroll=clamp(scrollY/maxScroll,0,1);}
  addEventListener('resize',resize,{passive:true});addEventListener('scroll',readScroll,{passive:true});
  sceneEl.addEventListener('pointermove',e=>{pointerX=(e.clientX/width-.5)*2;pointerY=(e.clientY/height-.5)*2;},{passive:true});
  sceneEl.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  sceneEl.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;pointerX=(e.clientX/width-.5)*2;pointerY=(e.clientY/height-.5)*2;ripple=elapsed;},{passive:true});
  function frame(now){raf=0;if(!active||document.hidden||contextLost)return;
    const dt=last?Math.min((now-last)/1000,.045):1/60;last=now;elapsed+=dt;frameCount++;
    const ease=1-Math.exp(-dt*9);scroll+=(targetScroll-scroll)*ease;px+=(pointerX-px)*ease;py+=(pointerY-py)*ease;
    const morph=smooth(.10,.53,scroll),collect=smooth(.66,.87,scroll);
    const introOpacity=1-smooth(.10,.31,scroll),copyOpacity=smooth(.30,.45,scroll)*(1-smooth(.63,.77,scroll)),aiOpacity=smooth(.76,.88,scroll);
    intro.style.opacity=introOpacity;intro.style.transform=`translateY(${-scroll*90}px)`;intro.inert=introOpacity<.1;
    networkCopy.style.opacity=copyOpacity;networkCopy.style.transform=`translateY(${(1-smooth(.32,.56,scroll))*40}px)`;
    networkCopy.setAttribute('aria-hidden',String(copyOpacity<.1));networkCopy.inert=copyOpacity<.1;
    aiCopy.style.opacity=aiOpacity;aiCopy.style.transform=`translateY(${(1-aiOpacity)*25}px)`;aiCopy.setAttribute('aria-hidden',String(aiOpacity<.1));aiCopy.inert=aiOpacity<.1;
    progressBar.style.transform=`scaleY(${scroll})`;
    const nextPhase=scroll<.31?0:scroll<.76?1:2;
    if(nextPhase!==phase||labelLang!==document.documentElement.lang){
      phase=nextPhase;labelLang=document.documentElement.lang;
      labelIndex.textContent=`0${phase+1} /`;labelWord.textContent=['SILICON','INTELLIGENCE','APPLIED AI'][phase];canvas.dataset.phase=['silicon','intelligence','ai'][phase];
      const note=document.querySelector('.material-note');
      note.dataset.zh=['触碰晶圆 · 光随你动','节点点亮 · 信号流动','芯粒汇成 AI'][phase];
      note.dataset.en=['TOUCH THE WAFER · MOVE THE LIGHT','NODES & SIGNAL FLOW','CHIPS BECOME AI'][phase];
      note.textContent=note.dataset[labelLang==='en'?'en':'zh'];
      document.querySelector('.scene-count').textContent=`0${phase+1} — 03`;
      document.querySelector('.scroll-hint').setAttribute('href',phase===0?'#intelligence':phase===1?'#applied-ai':'#work');
      const hint=document.querySelector('.scroll-hint > span:first-child');hint.dataset.zh=phase===2?'向下浏览项目':'向下滑动，看它改变';hint.dataset.en=phase===2?'EXPLORE THE WORK':'SCROLL TO TRANSFORM';hint.textContent=hint.dataset[labelLang==='en'?'en':'zh'];
    }
    const visibleH=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z,visibleW=visibleH*camera.aspect;
    const mobileEn=document.documentElement.lang==='en';
    const scale=mobile?visibleW*.47/2.45:Math.min(1.20,visibleH*.42/2.45);
    assembly.scale.setScalar(scale*(1-collect*.08));
    assembly.position.set(mobile?visibleW*.045:visibleW*.235,mobile? -visibleH*(mobileEn?.185:.155):visibleH*.03,0);
    assembly.position.y+=Math.sin(elapsed*.68)*.035;
    assembly.rotation.x=mix(mix(.23,.13,morph)+Math.sin(elapsed*.35)*.10+py*.075,.15+Math.sin(elapsed*.38)*.016+py*.035,collect);
    assembly.rotation.y=mix(mix(-.39,.35+Math.sin(elapsed*.18)*.9,morph)+Math.sin(elapsed*.48)*.18+px*.16,-.34+Math.sin(elapsed*.31)*.025+px*.045,collect);
    assembly.rotation.z=mix(mix(-.28+Math.sin(elapsed*.22)*.25,Math.sin(elapsed*.13)*.13,morph),-.035,collect);
    chipMaterial.roughness=mix(.25,.19,collect);
    chipMaterial.clearcoatRoughness=mix(.2,.12,collect);
    chipMaterial.envMapIntensity=mix(1.7,2.05,collect);
    base.scale.setScalar(1-morph*.12);
    const baseOpacity=1-smooth(.05,.48,morph);discMaterial.opacity=baseOpacity;rimMaterial.opacity=baseOpacity;guideMaterial.opacity=.17*baseOpacity;notch.visible=baseOpacity>.5;base.visible=baseOpacity>.001;
    const sweepY=Math.sin(elapsed*.8)*1.99;const sweepWidth=2*Math.sqrt(Math.max(0,4.2-sweepY*sweepY));sweep.position.y=sweepY;sweep.scale.x=sweepWidth;sweepMaterial.opacity=.38*baseOpacity;
    const rippleAge=elapsed-ripple;
    const networkStrength=smooth(.30,.88,morph)*(1-collect);
    const pulseBand=elapsed*1.55;
    for(let i=0;i<count;i++){
      const origin=origins[i],target=targets[i];
      const localMorph=smooth(0,1,clamp((morph-rand(i+23)*.10)/.90,0,1));
      const wave=rippleAge<2?Math.sin((Math.hypot(origin.x,origin.y)-rippleAge*3)*5)*Math.exp(-rippleAge*2)*.16:0;
      const twist=Math.sin(elapsed*.48+target.y*.8)*.14,breath=1+Math.sin(elapsed*.95-target.y*1.25)*.045;
      const tx=(target.x*Math.cos(twist)-target.z*Math.sin(twist))*breath;
      const tz=(target.x*Math.sin(twist)+target.z*Math.cos(twist))*breath;
      current[i].set(mix(origin.x,tx,localMorph),mix(origin.y,target.y*breath,localMorph),mix(origin.z,tz,localMorph)).lerp(layouts[i],collect);
      current[i].z+=Math.sin(elapsed*1.2+i*.38)*.018+wave*(1-morph);
      const pulse=Math.pow(Math.max(0,Math.cos(pulseBand-target.y*1.6)),12);nodePulse[i]=pulse;
      current[i].toArray(nodePositions,i*3);const nk=i*3;nodeColors[nk]=.12+pulse*.88;nodeColors[nk+1]=.16+pulse*.84;nodeColors[nk+2]=.23+pulse*.77;
      dummy.position.copy(current[i]);
      dummy.rotation.set(localMorph*(.6+elapsed*.12)*(1-collect),localMorph*(i*.13+elapsed*.17)*(1-collect),localMorph*i*.09*(1-collect));
      const size=mix(1,.28,localMorph)*(1-collect)+collect*AI_GLYPH.tileScale;
      dummy.scale.set(size,size,mix(mix(1,1.6,localMorph),3.2,collect));dummy.updateMatrix();chips.setMatrixAt(i,dummy.matrix);
    }
    chips.instanceMatrix.needsUpdate=true;
    const lineOpacity=smooth(.23,.70,morph)*.32*(1-collect);
    lineMaterial.opacity=lineOpacity;packetMaterial.opacity=networkStrength*.95;nodeMaterial.opacity=networkStrength*.8;
    pairs.forEach(([a,b],i)=>{
      current[a].toArray(positions,i*6);current[b].toArray(positions,i*6+3);
      const aLight=.30+nodePulse[a]*.7,bLight=.30+nodePulse[b]*.7;
      const ek=i*6;edgeColors[ek]=edgeColors[ek+1]=edgeColors[ek+2]=aLight;edgeColors[ek+3]=edgeColors[ek+4]=edgeColors[ek+5]=bLight;
    });graphGeo.attributes.position.needsUpdate=true;graphGeo.attributes.color.needsUpdate=true;
    nodeGeo.attributes.position.needsUpdate=true;nodeGeo.attributes.color.needsUpdate=true;
    for(let i=0;i<packetCount;i++){
      const pair=pairs[(i*13)%pairs.length],a=current[pair[0]],b=current[pair[1]];
      for(let trail=0;trail<trailLength;trail++){
        const t=((elapsed*.32+rand(i+315)-trail*.032)%1+1)%1,k=(i*trailLength+trail)*3;
        packetPositions[k]=mix(a.x,b.x,t);packetPositions[k+1]=mix(a.y,b.y,t);packetPositions[k+2]=mix(a.z,b.z,t);
      }
    }
    packetGeo.attributes.position.needsUpdate=true;
    networkRig.visible=networkStrength>.001;
    orbitMaterial.opacity=networkStrength*.28;orbitHeadMaterial.opacity=networkStrength*.85;
    orbits[0].rotation.set(1.15+Math.sin(elapsed*.24)*.12,.4,elapsed*.28);
    orbits[1].rotation.set(-.5,.9+Math.sin(elapsed*.31)*.15,-elapsed*.20);
    core.rotation.set(elapsed*.22,elapsed*.31,-elapsed*.16);core.scale.setScalar(1+Math.sin(elapsed*1.6)*.09);
    coreMaterial.opacity=networkStrength*.8;coreWireMaterial.opacity=networkStrength*.28;spokeMaterial.opacity=networkStrength*.14;
    for(let i=0;i<8;i++){current[Math.floor(i*(count-1)/7)].toArray(spokePositions,i*6+3);}spokeGeo.attributes.position.needsUpdate=true;
    pointerLight.position.set(px*4+Math.sin(elapsed*.42)*collect*1.6,2-py*3+Math.cos(elapsed*.3)*collect*.6,4.5);dust.rotation.z=elapsed*.009;
    renderer.render(scene,camera);
    if(frameCount>=2&&!document.body.classList.contains('scene-ready')){document.body.classList.add('scene-ready');document.body.classList.remove('scene-fallback');dispatchEvent(new Event('scene-ready'));}
    raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf&&active&&!document.hidden&&!contextLost){last=0;raf=requestAnimationFrame(frame);}}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)start();else stop();},{threshold:0});observer.observe(sceneEl);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;stop();document.body.classList.remove('scene-ready');});
  canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;rebuildEnvironment();start();});
  addEventListener('pageshow',()=>{resize();readScroll();start();});
  resize();scroll=targetScroll;start();
} catch(error) {
  document.body.classList.add('scene-fallback');
  console.warn('3D unavailable; the CSS fallback remains available.',error.message);
}
