(() => {
  const body = document.body;
  const ids = ['packQty','packAsp','waferQty','waferAsp'];
  const defaults = [750,800,60,20000];
  function updateModel() {
    const values = ids.map(id => Math.max(0, Number(document.getElementById(id).value) || 0));
    const packaging = values[0] * 1000 * values[1] / 1e9;
    const wafers = values[2] * 1000 * values[3] / 1e9;
    document.getElementById('totalRevenue').textContent = `$${(packaging + wafers).toFixed(2)}B`;
    document.getElementById('revenueParts').textContent = body.dataset.language === 'zh' ? `封装 $${packaging.toFixed(2)}B + 晶圆 $${wafers.toFixed(2)}B` : `Packaging $${packaging.toFixed(2)}B + wafers $${wafers.toFixed(2)}B`;
  }
  function setLanguage(lang) {
    body.dataset.language = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.getElementById('langZh').setAttribute('aria-pressed', String(lang === 'zh'));
    document.getElementById('langEn').setAttribute('aria-pressed', String(lang === 'en'));
    document.title = lang === 'zh' ? '服务器市场与 Intel Foundry｜2026–2030' : 'Server Silicon & Intel Foundry | 2026–2030';
    try { localStorage.setItem('server-foundry-language', lang); } catch (_) {}
    updateModel();
  }
  document.getElementById('langZh').addEventListener('click', () => setLanguage('zh'));
  document.getElementById('langEn').addEventListener('click', () => setLanguage('en'));
  document.getElementById('printReport').addEventListener('click', () => window.print());
  ids.forEach(id => document.getElementById(id).addEventListener('input', updateModel));
  document.getElementById('resetModel').addEventListener('click', () => {
    ids.forEach((id, i) => document.getElementById(id).value = defaults[i]); updateModel();
  });
  const sections = [...document.querySelectorAll('main>section')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.contents>a').forEach(a => a.classList.toggle('current', a.hash === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
  let saved = 'zh';
  try { saved = localStorage.getItem('server-foundry-language') || 'zh'; } catch (_) {}
  setLanguage(saved === 'en' ? 'en' : 'zh');
})();
