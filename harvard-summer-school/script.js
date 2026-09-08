(() => {
  const supported = new Set(['both', 'zh', 'en']);
  const controls = [...document.querySelectorAll('[data-language]')];
  const setLanguage = (language, updateURL = true) => {
    const selected = supported.has(language) ? language : 'both';
    document.body.dataset.view = selected;
    document.documentElement.lang = selected === 'en' ? 'en' : 'zh-CN';
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === selected)));
    document.title = selected === 'en'
      ? 'Harvard Summer School Guide · TimeMemo'
      : '哈佛大学夏校指南 · Harvard Summer School · TimeMemo';
    if (updateURL) {
      const url = new URL(window.location.href);
      selected === 'both' ? url.searchParams.delete('lang') : url.searchParams.set('lang', selected);
      window.history.replaceState(null, '', url);
    }
  };
  controls.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  setLanguage(new URLSearchParams(window.location.search).get('lang'), false);
  window.addEventListener('popstate', () => setLanguage(new URLSearchParams(window.location.search).get('lang'), false));
  document.getElementById('print-page').addEventListener('click', () => {
    const details = [...document.querySelectorAll('details')];
    const previous = details.map(item => item.open);
    details.forEach(item => { item.open = true; });
    const restore = () => details.forEach((item, index) => { item.open = previous[index]; });
    window.addEventListener('afterprint', restore, { once: true });
    window.print();
  });
})();
