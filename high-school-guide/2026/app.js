(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const names = {all:'五校全部',jesuit:'Jesuit',lincoln:'Lincoln',catlin:'Catlin Gabel',oes:'OES',wva:'WVA'};
  function selectSchool(value, updateUrl = true) {
    const school = Object.hasOwn(names,value) ? value : 'all';
    buttons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter === school)));
    document.querySelectorAll('[data-school]').forEach(element => {
      element.hidden = school !== 'all' && !element.dataset.school.split(' ').includes(school);
    });
    document.body.classList.toggle('single-school',school !== 'all');
    document.querySelector('#filter-status').textContent = school === 'all' ? '正在查看五校全部资料 · 点击学校名称可单独查看' : `正在查看 ${names[school]} · 选择“五校全部”恢复对照`;
    if (updateUrl) {
      const url = new URL(location.href);
      if (school === 'all') url.searchParams.delete('school');
      else url.searchParams.set('school',school);
      history.replaceState(null,'',url);
    }
  }
  buttons.forEach(button => button.addEventListener('click',() => selectSchool(button.dataset.filter)));
  selectSchool(new URL(location.href).searchParams.get('school') || 'all',false);
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({behavior:'instant',block:'start'}));
  }
  addEventListener('popstate',() => selectSchool(new URL(location.href).searchParams.get('school') || 'all',false));
  document.querySelector('#print').addEventListener('click',() => window.print());
})();
