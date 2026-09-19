/**
 * 墨记Web — 访问统计模拟
 * 使用 localStorage 模拟浏览量递增和访客统计
 */

const Analytics = (() => {
  const STORAGE_KEY = 'moji_analytics';
  const SESSION_KEY = 'moji_session';

  /**
   * 获取所有页面统计数据
   */
  function getAllStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * 保存统计数据
   */
  function saveStats(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  /**
   * 记录页面访问
   * @param {string} pageId - 页面ID
   */
  function trackView(pageId) {
    const stats = getAllStats();
    const sessionId = getSessionId();

    if (!stats[pageId]) {
      // 首次访问，初始化模拟数据
      stats[pageId] = {
        views: 0,
        visitors: new Set(),
      };
    }

    // 递增浏览量
    stats[pageId].views += 1;

    // 用 Set 去重访客
    const visitors = new Set(stats[pageId].visitors || []);
    visitors.add(sessionId);
    stats[pageId].visitors = [...visitors];

    // 如果访客数 > 浏览量（可能因为初始化），修正
    if (stats[pageId].visitors.length > stats[pageId].views) {
      stats[pageId].views = stats[pageId].visitors.length;
    }

    saveStats(stats);
    return stats[pageId];
  }

  /**
   * 获取页面统计
   */
  function getPageStats(pageId) {
    const stats = getAllStats();
    return stats[pageId] || { views: 0, visitors: [] };
  }

  /**
   * 获取或创建会话ID（模拟访客标识）
   */
  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  /**
   * 格式化数字（如 1,234）
   */
  function formatNumber(n) {
    return n.toLocaleString('zh-CN');
  }

  /**
   * 更新页面上的统计显示元素
   * @param {string} pageId
   */
  function updateStatsDisplay(pageId) {
    const data = trackView(pageId);

    const viewsEl = document.querySelector('[data-stat="views"]');
    const visitorsEl = document.querySelector('[data-stat="visitors"]');

    if (viewsEl) viewsEl.textContent = formatNumber(data.views);
    if (visitorsEl) visitorsEl.textContent = formatNumber(data.visitors.length);
  }

  return { trackView, getPageStats, formatNumber, updateStatsDisplay };
})();

// 挂载到全局
window.Analytics = Analytics;
