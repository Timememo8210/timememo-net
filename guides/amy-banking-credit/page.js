(() => {
  const buttons = document.querySelectorAll('[data-mode]');
  function apply(mode) {
    if (!['both', 'zh', 'en'].includes(mode)) mode = 'both';
    document.body.dataset.language = mode;
    document.documentElement.lang = mode === 'en' ? 'en' : 'zh-CN';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    try { localStorage.setItem('tm-amy-banking-language', mode); } catch (_) {}
  }
  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.mode)));
  let mode = new URLSearchParams(location.search).get('lang');
  if (!mode) { try { mode = localStorage.getItem('tm-amy-banking-language'); } catch (_) {} }
  apply(mode || 'both');
})();
