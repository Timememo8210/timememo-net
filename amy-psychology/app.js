(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-lang]')];
  function setLanguage(language) {
    const lang = ['zh', 'en', 'both'].includes(language) ? language : 'zh';
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.documentElement.dataset.language = lang;
    const referencePage = location.pathname.includes('/reference/');
    document.title = referencePage
      ? (lang === 'en' ? 'Course References · Amy · Time Memo' : '课程资料与报名细则 · Amy · Time Memo')
      : (lang === 'en' ? 'University Course Comparison · Amy · Time Memo' : 'Amy 名校在线课程比较 · Time Memo');
    document.querySelectorAll('[data-zh][data-en]').forEach(element => {
      element.textContent = element.dataset[lang === 'both' ? 'zh' : lang];
      if (lang === 'both' && element.dataset.en !== element.dataset.zh) {
        const translation = document.createElement('span');
        translation.className = 'translation';
        translation.lang = 'en';
        translation.textContent = element.dataset.en;
        element.appendChild(translation);
      }
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
    try { localStorage.setItem('amy-psychology-language', lang); } catch { /* Reading works without storage. */ }
  }
  buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  let saved;
  try { saved = localStorage.getItem('amy-psychology-language'); } catch { /* Default to Chinese. */ }
  setLanguage(saved || 'zh');

  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    let parent = target.parentElement;
    while (parent) {
      if (parent.tagName === 'DETAILS') parent.open = true;
      parent = parent.parentElement;
    }
  }
  addEventListener('hashchange', revealHash);
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.getAttribute('href').slice(1));
    if (target && target.tagName === 'DETAILS') target.open = true;
  });
  revealHash();

  let printState = null;
  addEventListener('beforeprint', () => {
    if (printState) return;
    printState = [...document.querySelectorAll('details')].map(element => [element, element.open]);
    printState.forEach(([element]) => { element.open = true; });
  });
  addEventListener('afterprint', () => {
    if (!printState) return;
    printState.forEach(([element, open]) => { element.open = open; });
    printState = null;
  });
  document.getElementById('print-guide').addEventListener('click', () => window.print());
})();
