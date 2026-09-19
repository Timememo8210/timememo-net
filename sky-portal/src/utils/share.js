/**
 * 墨记Web — 分享功能
 * 支持复制链接、微信（二维码占位）、Twitter/X、Web Share API
 */

const ShareUtils = (() => {
  /**
   * 获取当前页面URL（带参数）
   */
  function getPageUrl() {
    return window.location.href;
  }

  /**
   * 获取页面标题（从 document.title 或 meta）
   */
  function getPageTitle() {
    return document.title || '墨记 — AI生成的网页';
  }

  /**
   * 复制链接到剪贴板，带 toast 提示
   */
  async function copyLink() {
    const url = getPageUrl();
    try {
      await navigator.clipboard.writeText(url);
      showToast('链接已复制到剪贴板 ✨');
    } catch {
      // 降级方案：用 textarea
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('链接已复制到剪贴板 ✨');
    }
  }

  /**
   * 显示微信分享二维码弹窗（占位）
   */
  function shareWeChat() {
    // 创建模态弹窗
    const modal = document.createElement('div');
    modal.className = 'wechat-modal';
    modal.innerHTML = `
      <div class="wechat-modal__overlay"></div>
      <div class="wechat-modal__content">
        <button class="wechat-modal__close" aria-label="关闭">✕</button>
        <h3 class="wechat-modal__title">微信扫码分享</h3>
        <div class="wechat-modal__qr">
          <div class="wechat-modal__qr-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="3" height="3"/>
              <rect x="18" y="14" width="3" height="3"/>
              <rect x="14" y="18" width="3" height="3"/>
              <rect x="18" y="18" width="3" height="3"/>
            </svg>
            <p>二维码占位</p>
            <p class="wechat-modal__qr-hint">扫描二维码在微信中打开</p>
          </div>
        </div>
        <p class="wechat-modal__tip">请使用微信扫描上方二维码</p>
      </div>
    `;
    document.body.appendChild(modal);

    // 绑定关闭事件
    const close = () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    };
    modal.querySelector('.wechat-modal__overlay').addEventListener('click', close);
    modal.querySelector('.wechat-modal__close').addEventListener('click', close);
    document.addEventListener('keydown', function escClose(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escClose);
      }
    });

    // 入场动画
    requestAnimationFrame(() => modal.classList.add('wechat-modal--visible'));
  }

  /**
   * 分享到 Twitter / X
   */
  function shareTwitter() {
    const url = encodeURIComponent(getPageUrl());
    const text = encodeURIComponent(getPageTitle() + ' — 来自墨记');
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      '_blank',
      'width=600,height=400,left=200,top=200'
    );
  }

  /**
   * Web Share API（移动端原生分享）
   */
  async function shareNative() {
    if (!navigator.share) {
      // 降级到复制链接
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: getPageTitle(),
        text: getPageTitle(),
        url: getPageUrl(),
      });
    } catch (err) {
      // 用户取消分享，不需要提示
      if (err.name !== 'AbortError') {
        showToast('分享失败，请重试');
      }
    }
  }

  /**
   * Toast 提示
   */
  function showToast(message) {
    // 移除已有的 toast
    const existing = document.querySelector('.share-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('share-toast--visible'));

    setTimeout(() => {
      toast.classList.remove('share-toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // 公开 API
  return { copyLink, shareWeChat, shareTwitter, shareNative };
})();

// 挂载到全局方便 HTML onclick 调用
window.ShareUtils = ShareUtils;
