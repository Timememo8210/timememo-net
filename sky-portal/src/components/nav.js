/**
 * 墨记Web — 全局导航组件
 * 毛玻璃效果 + 移动端汉堡菜单
 */

(function () {
  'use strict';

  const NAV_ID = 'moji-nav';
  const SCROLL_THRESHOLD = 20;

  /* ---------- 导航 HTML 模板 ---------- */
  // Detect directory depth for correct relative links
  const isSubdir = window.location.pathname.includes('/s/');
  const prefix = isSubdir ? '../' : '';

  const navHTML = `
  <nav id="${NAV_ID}" class="nav">
    <div class="nav__inner container">
      <!-- Logo -->
      <a href="${prefix}index.html" class="nav__logo">
        <span class="nav__logo-icon">
          <i data-lucide="feather" style="width:20px;height:20px;stroke:#fff;"></i>
        </span>
        <span class="nav__logo-text">墨记</span>
      </a>

      <!-- 桌面端链接 -->
      <ul class="nav__links">
        <li><a href="${prefix}index.html#features"><i data-lucide="layers" class="nav-link-icon"></i> 体验</a></li>
        <li><a href="${prefix}profile.html"><i data-lucide="user" class="nav-link-icon"></i> 个人空间</a></li>
        <li><a href="${prefix}index.html#about"><i data-lucide="info" class="nav-link-icon"></i> 关于</a></li>
      </ul>

      <!-- CTA -->
      <a href="${prefix}create.html" class="nav__cta btn btn-primary">
        <i data-lucide="pen-tool" style="width:16px;height:16px;stroke:#fff;"></i> 开始创作
      </a>

      <!-- 移动端汉堡按钮 -->
      <button class="nav__hamburger" aria-label="打开菜单" aria-expanded="false">
        <i data-lucide="menu" class="nav-hamburger-icon nav-hamburger-menu"></i>
        <i data-lucide="x" class="nav-hamburger-icon nav-hamburger-close"></i>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div class="nav__mobile-menu">
      <ul class="nav__mobile-links">
        <li><a href="${prefix}index.html#features"><i data-lucide="layers" class="mobile-link-icon"></i> 体验</a></li>
        <li><a href="${prefix}profile.html"><i data-lucide="user" class="mobile-link-icon"></i> 个人空间</a></li>
        <li><a href="${prefix}index.html#about"><i data-lucide="info" class="mobile-link-icon"></i> 关于</a></li>
        <li><a href="${prefix}create.html" class="btn btn-primary" style="justify-content:center;"><i data-lucide="pen-tool" style="width:16px;height:16px;stroke:#fff;"></i> 开始创作</a></li>
      </ul>
    </div>
  </nav>
  `;

  /* ---------- 插入导航 ---------- */
  function init() {
    // 如果页面已经有 nav，不重复插入
    if (document.getElementById(NAV_ID)) return;

    // 在 <body> 开头插入
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Initialize Lucide icons in the nav
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    setupScrollBehavior();
    setupMobileMenu();
  }

  /* ---------- 滚动行为：毛玻璃显隐 ---------- */
  function setupScrollBehavior() {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;

    let lastY = 0;

    function onScroll() {
      const y = window.scrollY;

      // 滚动超过阈值时添加毛玻璃效果
      if (y > SCROLL_THRESHOLD) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }

      lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初始状态
  }

  /* ---------- 移动端汉堡菜单 ---------- */
  function setupMobileMenu() {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;

    const hamburger = nav.querySelector('.nav__hamburger');
    const mobileMenu = nav.querySelector('.nav__mobile-menu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('nav__mobile-menu--open');
      hamburger.classList.toggle('nav__hamburger--open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');

      // Show/hide menu vs close icon
      const menuIcon = hamburger.querySelector('.nav-hamburger-menu');
      const closeIcon = hamburger.querySelector('.nav-hamburger-close');
      if (menuIcon && closeIcon) {
        menuIcon.style.display = isOpen ? 'none' : 'block';
        closeIcon.style.display = isOpen ? 'block' : 'none';
      }

      // 锁定 body 滚动
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // 点击菜单链接后自动关闭
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('nav__mobile-menu--open');
        hamburger.classList.remove('nav__hamburger--open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        // Reset hamburger icons
        const menuIcon = hamburger.querySelector('.nav-hamburger-menu');
        const closeIcon = hamburger.querySelector('.nav-hamburger-close');
        if (menuIcon && closeIcon) {
          menuIcon.style.display = 'block';
          closeIcon.style.display = 'none';
        }
      });
    });
  }

  /* ---------- IntersectionObserver 滚动动画 ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(el => observer.observe(el));
  }

  /* ---------- DOM Ready ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initReveal();
    });
  } else {
    init();
    initReveal();
  }
})();

/* ---------- 导航样式（内联，避免额外CSS文件） ---------- */
(function injectNavStyles() {
  const style = document.createElement('style');
  style.textContent = `
  /* === 导航栏 === */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 16px 0;
    transition: all 0.35s ease;
    transform: translateY(0);
  }

  /* 毛玻璃效果（滚动后） */
  .nav--scrolled {
    background: rgba(250, 249, 246, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 1px 0 var(--border-light);
    padding: 10px 0;
  }

  .nav__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* Logo */
  .nav__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    flex-shrink: 0;
  }

  .nav__logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--accent);
    color: #fff;
    border-radius: 10px;
  }

  .nav__logo-text {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
  }

  /* Nav link icons */
  .nav-link-icon {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    vertical-align: -2px;
  }

  /* Mobile link icons */
  .mobile-link-icon {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    vertical-align: -3px;
    margin-right: 4px;
  }

  /* 桌面端链接 */
  .nav__links {
    display: none;
    align-items: center;
    gap: 32px;
  }

  .nav__links a {
    font-size: 0.95rem;
    color: var(--text-secondary);
    transition: color var(--transition);
    position: relative;
  }

  .nav__links a:hover {
    color: var(--accent);
  }

  .nav__links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent);
    border-radius: 1px;
    transition: width var(--transition);
  }

  .nav__links a:hover::after {
    width: 100%;
  }

  /* CTA按钮 */
  .nav__cta {
    display: none;
    padding: 10px 24px;
    font-size: 0.9rem;
  }

  /* 汉堡按钮 */
  .nav__hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  .nav-hamburger-icon {
    width: 24px;
    height: 24px;
    stroke: var(--text);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }

  .nav-hamburger-close {
    display: none;
  }

  /* 移动端菜单 */
  .nav__mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(250, 249, 246, 0.98);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s ease;
    z-index: 999;
  }

  .nav__mobile-menu--open {
    opacity: 1;
    pointer-events: all;
  }

  .nav__mobile-links {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
  }

  .nav__mobile-links a {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--text);
    transition: color var(--transition);
  }

  .nav__mobile-links a:hover {
    color: var(--accent);
  }

  /* --- 响应式：md (768px+) --- */
  @media (min-width: 768px) {
    .nav__links {
      display: flex;
    }

    .nav__cta {
      display: inline-flex;
    }

    .nav__hamburger {
      display: none;
    }
  }
  `;
  document.head.appendChild(style);
})();
