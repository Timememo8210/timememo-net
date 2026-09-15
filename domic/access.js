(()=>{
  const storageKey='domic-partner-access-v1';
  const expectedHash='8cf3bbaecc34cd29fb4730014facb0182c8a75a55907f2c9b4f4259f04167160';
  const hex=buffer=>[...new Uint8Array(buffer)].map(value=>value.toString(16).padStart(2,'0')).join('');
  const unlock=gate=>{
    gate?.remove();
    document.body.classList.remove('domic-gate-ready');
    document.documentElement.classList.remove('domic-locked');
  };
  try{if(sessionStorage.getItem(storageKey)==='granted'){unlock();return;}}catch{}
  const gate=document.createElement('section');
  gate.id='domic-access-gate';
  gate.setAttribute('aria-labelledby','domic-access-title');
  gate.innerHTML=`<div class="domic-access-panel"><div class="domic-access-brand"><span class="domic-access-mark" aria-hidden="true">D</span><span>Domic Home Passport</span></div><p class="domic-access-kicker">PARTNER PREVIEW · 合作伙伴预览</p><h1 id="domic-access-title">Enter access code<br><span lang="zh-CN">输入访问密码</span></h1><p>This review page is shared privately with project partners.<br><span lang="zh-CN">本评审页面仅供获授权的项目伙伴查看。</span></p><form id="domic-access-form"><label for="domic-access-code">Access code / 访问密码</label><div class="domic-access-row"><input id="domic-access-code" name="code" type="password" inputmode="numeric" autocomplete="current-password" required autofocus><button type="submit">Open / 打开</button></div><p class="domic-access-error" id="domic-access-error" role="alert" aria-live="polite"></p></form><p class="domic-access-foot">Access lasts for this browser tab only. / 访问授权仅在当前浏览器标签页内有效。</p></div>`;
  document.body.prepend(gate);
  document.body.classList.add('domic-gate-ready');
  const form=gate.querySelector('#domic-access-form');
  const input=gate.querySelector('#domic-access-code');
  const error=gate.querySelector('#domic-access-error');
  const button=form.querySelector('button');
  input.focus();
  form.addEventListener('submit',async event=>{
    event.preventDefault();error.textContent='';button.disabled=true;
    try{
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('domic-home-passport|'+input.value));
      if(hex(digest)!==expectedHash){error.textContent='Incorrect access code. / 访问密码不正确。';input.select();return;}
      try{sessionStorage.setItem(storageKey,'granted');}catch{}
      unlock(gate);
    }catch{
      error.textContent='This browser cannot verify the code. Please try a current browser. / 当前浏览器无法验证密码，请使用新版浏览器。';
    }finally{button.disabled=false;}
  });
})();
