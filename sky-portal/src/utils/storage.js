/**
 * 墨记Web — localStorage 数据层
 * 模拟数据库：用户、页面、密码
 *
 * 数据结构：
 *   moji_user  → { name, handle, bio, createdAt }
 *   moji_pages → { [id]: { id, title, body, template, tags, passwordHash, createdAt, updatedAt } }
 *   moji_views → { [id]: { count } }
 */

(function () {
  'use strict';

  var USER_KEY = 'moji_user';
  var PAGES_KEY = 'moji_pages';
  var VIEWS_KEY = 'moji_views';

  /* ---------- helpers ---------- */

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[墨记] 存储失败:', e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert('存储空间不足！请删除部分旧内容后重试。');
      }
      return false;
    }
  }

  /**
   * 简单 hash（非加密安全，仅用于本地模拟密码保护）
   */
  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }

  /**
   * 生成 8 位随机 ID
   */
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ============================================================
     User
     ============================================================ */

  function getUser() {
    return readJSON(USER_KEY, null);
  }

  function setUser(user) {
    return writeJSON(USER_KEY, user);
  }

  /**
   * 确保 user 存在（首次访问时创建空壳）
   */
  function ensureUser() {
    var user = getUser();
    if (!user) {
      user = { name: '', handle: '', bio: '', createdAt: Date.now() };
      setUser(user);
    }
    return user;
  }

  function isUserSetup() {
    var u = getUser();
    return !!(u && u.name);
  }

  /* ============================================================
     Pages CRUD
     ============================================================ */

  function getAllPages() {
    return readJSON(PAGES_KEY, {});
  }

  function getPage(id) {
    var pages = getAllPages();
    return pages[id] || null;
  }

  /**
   * 保存页面。如果 page.id 为空则生成新 ID。
   * 返回保存后的 page 对象（含 id / createdAt / updatedAt）
   */
  function savePage(page) {
    var pages = getAllPages();
    var now = Date.now();

    var isNew = !page.id;
    if (!page.id) {
      page.id = genId();
      page.createdAt = now;
    }

    // Guard against ID collision for new pages only
    if (isNew) {
      var attempts = 0;
      while (pages[page.id] && attempts < 10) {
        page.id = genId();
        attempts++;
      }
    }
    page.updatedAt = now;

    // 保存作者信息随页面存储
    if (!page.authorName) {
      var user = getUser();
      page.authorName = user.name || '匿名';
      page.authorBio = user.bio || '';
    }

    // 确保 tags 是数组
    if (!Array.isArray(page.tags)) {
      page.tags = [];
    }

    pages[page.id] = page;
    if (!writeJSON(PAGES_KEY, pages)) {
      console.error('[墨记] 页面保存失败:', page.id);
      return null;
    }
    return page;
  }

  function deletePage(id) {
    var pages = getAllPages();
    delete pages[id];
    writeJSON(PAGES_KEY, pages);  // best-effort

    // 同时清除密码和浏览量
    removePassword(id);
    var views = readJSON(VIEWS_KEY, {});
    delete views[id];
    writeJSON(VIEWS_KEY, views);
  }

  /**
   * 获取页面列表（按时间倒序）
   */
  function getPageList() {
    var pages = getAllPages();
    return Object.values(pages).sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  /* ============================================================
     Password
     ============================================================ */

  function setPassword(pageId, password) {
    if (!password) return;
    var pages = getAllPages();
    if (pages[pageId]) {
      pages[pageId].passwordHash = simpleHash(password);
      writeJSON(PAGES_KEY, pages);
    }
  }

  function removePassword(pageId) {
    var pages = getAllPages();
    if (pages[pageId]) {
      delete pages[pageId].passwordHash;
      writeJSON(PAGES_KEY, pages);
    }
  }

  function hasPassword(pageId) {
    var page = getPage(pageId);
    return !!(page && page.passwordHash);
  }

  function verifyPassword(pageId, password) {
    var page = getPage(pageId);
    if (!page || !page.passwordHash) return true; // 无密码 → 放行
    return page.passwordHash === simpleHash(password);
  }

  /* ============================================================
     Views counter (simple)
     ============================================================ */

  function trackView(pageId) {
    var views = readJSON(VIEWS_KEY, {});
    if (!views[pageId]) views[pageId] = { count: 0 };
    views[pageId].count++;
    writeJSON(VIEWS_KEY, views);  // best-effort
    return views[pageId].count;
  }

  function getViewCount(pageId) {
    var views = readJSON(VIEWS_KEY, {});
    return (views[pageId] && views[pageId].count) || 0;
  }

  /* ============================================================
     Seed demo data (only when pages empty)
     ============================================================ */

  function seedIfEmpty() {
    var pages = getAllPages();
    if (Object.keys(pages).length > 0) return;

    var demos = [
      {
        title: '注意力稀缺理论：信息过载时代的认知突围',
        body: '<p>我们正处在一个前所未有的注意力危机之中。每天，平均每个人要接触超过10万条信息——这个数字在20年前不到现在的十分之一。我们的注意力，正在成为21世纪最稀缺的资源。</p><h2>从信息匮乏到信息过载</h2><p>人类的大脑在过去20万年间几乎没有本质的变化。我们处理信息的认知能力——工作记忆、注意力持续时间、决策质量——依然停留在狩猎采集时代的水平。然而，我们面对的信息量却呈指数级增长。</p><blockquote><p>注意力是认知的门户。没有注意力，就没有学习、没有记忆、没有思考。</p></blockquote><h2>如何保护你的注意力</h2><ul><li><strong>意识觉察</strong>：认识到注意力的价值</li><li><strong>环境设计</strong>：关闭非必要通知、使用专注模式</li><li><strong>深度工作</strong>：在不受干扰的状态下持续专注</li></ul><p>在这个信息爆炸的时代，<strong>选择不看什么，比选择看什么更重要</strong>。</p>',
        template: 'diary',
        tags: ['认知科学', '注意力', '心理学']
      },
      {
        title: '芒格误判心理学：奖励超级反应倾向',
        body: '<p>在查理·芒格列举的25种人类误判心理倾向中，<strong>奖励超级反应倾向</strong>被他排在第一位。这不是偶然——芒格认为这是人类心理中最强大、最普遍的力量之一。</p><h2>什么是奖励超级反应倾向</h2><p>芒格引用了B.F. 斯金纳的老鼠和鸽子实验。斯金纳发现，通过精心设计奖励机制，他可以让动物表现出几乎任何他想要的行为。</p><blockquote><p>告诉我激励是什么，我就告诉你结果会是什么。——查理·芒格</p></blockquote><h2>奖励机制的四个核心特征</h2><ol><li>奖励 > 惩罚：正向激励的效果远超负向激励</li><li>即时性至关重要：奖励越即时，效果越强</li><li>社会性奖励力量惊人：认可和地位比物质更有驱动力</li><li>奖励会扭曲认知：强烈的利益会让人无意识地扭曲认知</li></ol><p>奖励超级反应倾向提醒我们：<strong>要改变行为，先改变系统；要判断他人，先看激励机制</strong>。</p>',
        template: 'note',
        tags: ['心理学', '芒格', '投资思维']
      },
      {
        title: 'Intel 18A制程：半导体制造的终极豪赌',
        body: '<p>2025年下半年，Intel正式量产了其18A制程节点。这不仅仅是一次技术升级——这是Intel CEO帕特·基辛格"IDM 2.0"战略的核心赌注。</p><h2>18A是什么？</h2><p>Intel的18A代表了一些重要的技术突破：</p><ul><li><strong>RibbonFET 全环绕栅极晶体管</strong>：Intel对GAA的叫法</li><li><strong>PowerVia 背面供电</strong>：将电源线放在芯片背面</li><li><strong>High-NA EUV</strong>：下一代极紫外光刻机</li></ul><h2>为什么18A如此重要</h2><p>过去十年，Intel在制程竞赛中节节败退。18A是Intel证明"我们还能做世界最好的芯片"的最好机会。</p><blockquote><p>18A不仅仅是更小的晶体管——它是一次晶体管架构的根本性变革。</p></blockquote><p>半导体制造的极限在哪里？没有人知道答案。但18A告诉我们，人类还在向前推。</p>',
        template: 'project',
        tags: ['半导体', 'Intel', '芯片制造']
      }
    ];

    demos.forEach(function (d) {
      savePage({
        title: d.title,
        body: d.body,
        fullHtml: null,  // view.html 已有 fallback 处理，优先用 fullHtml，否则用 body
        template: d.template,
        tags: d.tags,
        authorName: '晓波',
        authorBio: '记录思考，分享生活'
      });
    });
  }

  /* ============================================================
     挂载到全局
     ============================================================ */

  window.MojiStorage = {
    // User
    getUser: getUser,
    setUser: setUser,
    ensureUser: ensureUser,
    isUserSetup: isUserSetup,

    // Pages
    getPage: getPage,
    getAllPages: getAllPages,
    getPageList: getPageList,
    savePage: savePage,
    deletePage: deletePage,

    // Password
    setPassword: setPassword,
    removePassword: removePassword,
    hasPassword: hasPassword,
    verifyPassword: verifyPassword,

    // Views
    trackView: trackView,
    getViewCount: getViewCount,

    // Seed
    seedIfEmpty: seedIfEmpty
  };

  // 自动 seed
  seedIfEmpty();
})();
