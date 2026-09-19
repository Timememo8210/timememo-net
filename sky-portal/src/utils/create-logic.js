/* ============================================
   墨记Web — 创作页逻辑 (Create Page Logic)
   四步流程：输入 → AI生成 → 预览 → 发布
   连接 localStorage 存储 + GLM API
   ============================================ */

(function () {
  'use strict';

  /* 转义 HTML 特殊字符，防止 XSS */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* HTML 消毒函数：移除危险标签和事件属性，防止 XSS 注入 */
  var ALLOWED_TAGS = {
    p:1, h1:1, h2:1, h3:1, h4:1, h5:1, h6:1, blockquote:1,
    ul:1, ol:1, li:1, strong:1, em:1, b:1, i:1, span:1,
    br:1, hr:1, div:1, img:1, a:1, pre:1, code:1,
    table:1, thead:1, tbody:1, tr:1, th:1, td:1,
    dl:1, dt:1, dd:1, figure:1, figcaption:1, details:1, summary:1,
    mark:1, small:1, sub:1, sup:1, abbr:1, cite:1, q:1
  };
  var ALLOWED_ATTRS = { img: { src:1, alt:1 }, a: { href:1 } };

  function sanitizeHtml(html) {
    if (!html) return '';
    // Tokenize via tag boundaries, rebuild safely
    var result = '';
    var re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>|<!--[\s\S]*?-->/g;
    var lastIndex = 0;
    var match;
    while ((match = re.exec(html)) !== null) {
      // Text between tags — pass through
      result += html.substring(lastIndex, match.index);
      lastIndex = re.lastIndex;

      // HTML comment — strip entirely
      if (match[0].charAt(1) === '!') continue;

      var isClosing = match[1];
      var tag = match[2].toLowerCase();
      var attrs = match[3];
      var selfClose = match[4];

      if (!ALLOWED_TAGS[tag]) continue; // drop disallowed tags

      if (isClosing) {
        result += '</' + tag + '>';
      } else {
        var safeAttrs = '';
        if (attrs) {
          var attrRe = /\s([a-zA-Z][a-zA-Z0-9\-]*)\b(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?/g;
          var attrMatch;
          var allowedForTag = ALLOWED_ATTRS[tag] || null;
          while ((attrMatch = attrRe.exec(attrs)) !== null) {
            var attrName = attrMatch[1].toLowerCase();
            // Block all on* event handlers globally
            if (attrName.indexOf('on') === 0) continue;
            // Only keep explicitly allowed attrs for this tag
            if (allowedForTag && allowedForTag[attrName]) {
              safeAttrs += ' ' + attrMatch[0];
            } else if (!allowedForTag) {
              // Tags with no attr whitelist get no attrs through
            }
          }
        }
        result += '<' + tag + safeAttrs + (selfClose ? ' /' : '') + '>';
      }
    }
    result += html.substring(lastIndex);
    return result;
  }

  /* 模板 HTML 生成器 */
  var TEMPLATES = {
    diary: function (data) {
      return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Noto Serif SC\',Georgia,serif;background:#faf9f6;color:#2c2c2c;padding:40px 24px;line-height:1.9}.container{max-width:640px;margin:0 auto}.date{color:#9c958e;font-size:0.9rem;margin-bottom:8px}h1{font-size:1.8rem;margin-bottom:4px;font-weight:700}.subtitle{color:#6b6560;font-size:1.05rem;margin-bottom:32px;font-style:italic}p{margin-bottom:1.2em;font-size:1rem}h2{font-size:1.3rem;margin:1.8em 0 0.6em;color:#e85d26;font-weight:600}h3{font-size:1.1rem;margin:1.4em 0 0.4em;font-weight:600}blockquote{border-left:3px solid #e85d26;padding:12px 20px;margin:1.5em 0;background:#fef3ed;border-radius:0 12px 12px 0;font-style:italic;color:#6b6560}ul,ol{margin:0.8em 0 1.2em 1.5em}li{margin-bottom:0.4em}.tags{display:flex;gap:8px;margin-top:32px}.tag{padding:4px 14px;border-radius:999px;background:#f0ede6;font-size:0.8rem;color:#6b6560}</style></head><body>' +
        '<div class="container"><div class="date">' + escapeHtml(data.date) + '</div><h1>' + escapeHtml(data.title) + '</h1>' +
        '<div class="subtitle">' + escapeHtml(data.subtitle) + '</div>' + data.body +
        '<div class="tags">' + data.tags.map(function(t){return '<span class="tag">' + escapeHtml(t) + '</span>';}).join('') + '</div>' +
        '</div></body></html>';
    },
    note: function (data) {
      return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Noto Sans SC\',system-ui,sans-serif;background:#faf9f6;color:#2c2c2c;padding:40px 24px;line-height:1.8}.container{max-width:700px;margin:0 auto;border-left:3px solid #e85d26;padding-left:28px}.date{color:#9c958e;font-size:0.85rem;margin-bottom:12px;font-family:monospace}h1{font-size:1.7rem;margin-bottom:6px;font-weight:700}.subtitle{color:#6b6560;font-size:1rem;margin-bottom:28px}p{margin-bottom:1.1em;font-size:0.95rem}h2{font-size:1.2rem;margin:1.6em 0 0.5em;color:#e85d26;font-weight:600;border-bottom:1px solid #f0ede6;padding-bottom:4px}h3{font-size:1.05rem;margin:1.2em 0 0.3em;font-weight:600}blockquote{border-left:2px solid #f4a67a;padding:10px 16px;margin:1.3em 0;color:#6b6560;font-style:italic}ul,ol{margin:0.6em 0 1em 1.3em}li{margin-bottom:0.35em;font-size:0.95rem}strong{color:#e85d26}.tags{display:flex;gap:6px;margin-top:28px;flex-wrap:wrap}.tag{padding:3px 12px;border-radius:4px;background:#f0ede6;font-size:0.78rem;color:#6b6560;font-family:monospace}</style></head><body>' +
        '<div class="container"><div class="date">' + escapeHtml(data.date) + ' · 知识笔记</div><h1>' + escapeHtml(data.title) + '</h1>' +
        '<div class="subtitle">' + escapeHtml(data.subtitle) + '</div>' + data.body +
        '<div class="tags">' + data.tags.map(function(t){return '<span class="tag">#' + escapeHtml(t) + '</span>';}).join('') + '</div>' +
        '</div></body></html>';
    },
    project: function (data) {
      return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Noto Sans SC\',system-ui,sans-serif;background:#2c2c2c;color:#f0ede6;padding:40px 24px;line-height:1.8}.container{max-width:680px;margin:0 auto}.header{background:linear-gradient(135deg,#e85d26,#f4a67a);padding:32px 28px;border-radius:16px;margin-bottom:32px;color:#fff}.date{font-size:0.85rem;opacity:0.85;margin-bottom:8px}h1{font-size:1.7rem;margin-bottom:4px;font-weight:700}.subtitle{opacity:0.9;font-size:1rem}.content{padding:0 4px}p{margin-bottom:1.1em;font-size:0.95rem}h2{font-size:1.2rem;margin:1.6em 0 0.5em;color:#f4a67a;font-weight:600}h3{font-size:1.05rem;margin:1.2em 0 0.3em;color:#e85d26;font-weight:600}blockquote{border-left:3px solid #e85d26;padding:10px 16px;margin:1.3em 0;background:rgba(232,93,38,0.1);border-radius:0 8px 8px 0;color:#f4a67a}ul,ol{margin:0.6em 0 1em 1.3em}li{margin-bottom:0.35em}strong{color:#f4a67a}.tags{display:flex;gap:8px;margin-top:28px;flex-wrap:wrap}.tag{padding:4px 12px;border-radius:999px;border:1px solid rgba(244,166,122,0.4);font-size:0.78rem;color:#f4a67a}</style></head><body>' +
        '<div class="container"><div class="header"><div class="date">' + escapeHtml(data.date) + ' · 项目展示</div><h1>' + escapeHtml(data.title) + '</h1>' +
        '<div class="subtitle">' + escapeHtml(data.subtitle) + '</div></div><div class="content">' + data.body +
        '<div class="tags">' + data.tags.map(function(t){return '<span class="tag">' + escapeHtml(t) + '</span>';}).join('') + '</div></div>' +
        '</div></body></html>';
    }
  };

  /* ========== 状态 ========== */
  var currentStep = 1;
  var currentSample = null;
  var currentTemplate = 'diary';
  var isRecording = false;
  var savedPageId = null;      // 发布后保存的页面 ID
  var savedPassword = '';      // 用户设置的密码
  var currentFullHtml = '';    // 当前渲染的完整 HTML

  /* ========== 前端 Rate Limiting ========== */
  var _apiCallTimestamps = [];

  function checkRateLimit() {
    var config = window.MOJI_CONFIG || {};
    var limit = config.RATE_LIMIT || 3;
    var windowMs = config.RATE_WINDOW_MS || 60000;
    var now = Date.now();
    // 清除过期记录
    _apiCallTimestamps = _apiCallTimestamps.filter(function(t) { return now - t < windowMs; });
    if (_apiCallTimestamps.length >= limit) {
      return false;
    }
    _apiCallTimestamps.push(now);
    return true;
  }

  /* ========== DOM 引用 ========== */
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };

  /* ========== GLM API 真实调用 ========== */
  async function generateWithGLM(userInput) {
    // 前端 Rate Limiting 检查
    if (!checkRateLimit()) {
      return { success: false, error: '请求过于频繁，请稍后再试（每分钟最多3次）' };
    }

    var config = window.MOJI_CONFIG || {};
    var apiKey = config.API_KEY || '';
    var apiUrl = config.API_URL || '';
    var model = config.MODEL || 'glm-4-flash';
    var temperature = config.TEMPERATURE || 0.7;
    var maxTokens = config.MAX_TOKENS || 2048;

    if (!apiKey || !apiUrl) {
      return { success: false, error: 'API未配置（缺少 API_KEY 或 API_URL）' };
    }

    var systemPrompt = '你是墨记AI助手。用户会给你一段文字，请将其扩展为一篇精美的网页文章，包含标题、副标题、标签和HTML格式的正文。\n\n要求：\n1. 使用语义化HTML标签（h1, h2, p, blockquote, ul, li, strong, em）\n2. 内容必须完全基于用户输入的文字，不要添加用户没说的内容\n3. 排版要精美：合理的标题层级、段落分隔、重要内容加粗、适当的引用块\n4. 如果用户输入很短（一句话），就做成一张精美的卡片式页面\n5. 如果用户输入是一段话，就做成一篇短文\n\n返回JSON格式（不要markdown代码块包裹）：\n{"title":"标题","subtitle":"副标题","tags":["标签1","标签2"],"body":"<p>HTML格式正文</p>"}';

    try {
      var response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput }
          ],
          temperature: temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        throw new Error('API请求失败: ' + response.status + ' ' + response.statusText);
      }

      var data = await response.json();
      var content = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content || '';
      }

      // 清理markdown代码块包裹
      content = content.replace(/^```(?:json|html)?\n?/i, '').replace(/\n?```$/i, '');
      content = content.trim();

      // 解析JSON
      var jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI返回格式无法解析');
      }

      var parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        sample: {
          title: parsed.title || '无标题',
          subtitle: parsed.subtitle || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          body: parsed.body || '<p>生成内容为空</p>'
        }
      };
    } catch (error) {
      console.error('[墨记] GLM API错误:', error);
      var errorMsg = error.message || '未知错误';
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Load failed') || errorMsg.includes('TypeError')) {
        errorMsg = '网络请求失败，可能是跨域限制。请尝试在本地服务器环境使用，或联系管理员配置代理。';
      }
      return { success: false, error: errorMsg };
    }
  }

  /* ========== 简易错误提示 ========== */
  function showError(msg) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 24px;background:#e85d26;color:#fff;border-radius:12px;font-size:0.9rem;z-index:9999;opacity:0;transition:opacity 0.3s;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '1'; }, 10);
    setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 3000);
  }

  /* ========== beforeunload 刷新提示 ========== */
  var beforeunloadHandler = null;

  function enableBeforeunload() {
    if (beforeunloadHandler) return;
    beforeunloadHandler = function (e) {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeunloadHandler);
  }

  function disableBeforeunload() {
    if (beforeunloadHandler) {
      window.removeEventListener('beforeunload', beforeunloadHandler);
      beforeunloadHandler = null;
    }
  }

  /* ========== 初始化 ========== */
  function init() {
    bindStepIndicator();
    bindInputTabs();
    bindVoicePanel();
    bindGenerateBtn();
    bindTemplateSwitcher();
    bindEditBtn();
    bindPublishBtn();
    bindBackBtn();
    bindCopyBtn();
    bindShareBtns();
    bindPasswordToggle();
    bindEditorShortcuts();
    updateStepUI();

    // 确保lucide图标渲染
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /* ========== 步骤指示器 ========== */
  function bindStepIndicator() {
    // 纯展示
  }

  function updateStepUI() {
    var steps = $$('.step-indicator__step');
    var lines = $$('.step-indicator__line');
    steps.forEach(function (el, i) {
      el.classList.remove('active', 'completed');
      if (i + 1 === currentStep) el.classList.add('active');
      if (i + 1 < currentStep) el.classList.add('completed');
    });
    lines.forEach(function (el, i) {
      el.classList.toggle('completed', i + 1 < currentStep);
    });
    var panels = $$('.step-panel');
    panels.forEach(function (el, i) {
      el.classList.toggle('active', i + 1 === currentStep);
    });

    // Step >= 2 时启用刷新提示，Step 4 发布完成后禁用
    if (currentStep >= 2 && currentStep <= 3) {
      enableBeforeunload();
    } else if (currentStep === 4) {
      disableBeforeunload();
    }
  }

  /* ========== Step 1: 输入 ========== */
  function bindInputTabs() {
    var btns = $$('.input-tabs__btn');
    if (btns.length === 0) return; // 无输入标签页则跳过
    var textPanel = $('.input-area');
    var voicePanel = $('.voice-panel');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var mode = btn.dataset.mode;
        if (mode === 'text') {
          textPanel.style.display = 'block';
          voicePanel.classList.remove('active');
        } else {
          textPanel.style.display = 'none';
          voicePanel.classList.add('active');
        }
      });
    });

    var textarea = $('#inputText');
    var counter = $('.input-area__count');
    textarea.addEventListener('input', function () {
      var len = textarea.value.length;
      counter.textContent = len + ' / 5000 字';
      $('#generateBtn').disabled = len === 0;
    });
  }

  /* ========== 语音模拟 ========== */
  function bindVoicePanel() {
    var btn = $('.voice-panel__btn');
    if (!btn) return; // 没有语音面板就跳过（create.html 无此元素）
    var wave = $('.voice-wave');
    var hint = $('.voice-panel__hint');
    var result = $('.voice-panel__result');

    btn.addEventListener('click', function () {
      if (!isRecording) { startVoice(); } else { stopVoice(); }
    });

    function startVoice() {
      isRecording = true;
      btn.classList.add('recording');
      wave.classList.add('active');
      hint.textContent = '正在录音...点击停止';
      result.classList.remove('visible');
      result.textContent = '';
      setTimeout(function () { if (isRecording) stopVoice(); }, 5000);
    }

    function stopVoice() {
      isRecording = false;
      btn.classList.remove('recording');
      wave.classList.remove('active');
      var text = '人类的注意力并不是一个无限资源，它像聚光灯一样只能照亮有限的区域。认知科学研究表明，大脑实际上是在快速切换任务，而非并行处理。';
      hint.textContent = '识别完成';
      result.textContent = text;
      result.classList.add('visible');
      // 同步到输入框，让用户能看到语音内容
      var textarea = $('#inputText');
      if (textarea) textarea.value = text;
      $('#generateBtn').disabled = false;
      // 更新字数计数器
      var counter = $('.input-area__count');
      if (counter) counter.textContent = text.length + ' 字';
    }
  }

  /* ========== Step 1→2: 开始生成 ========== */
  function bindGenerateBtn() {
    var btn = $('#generateBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      currentStep = 2;
      updateStepUI();
      startGeneration();
    });
  }

  /* ========== Step 2: AI生成（真实GLM API调用） ========== */
  function startGeneration() {
    var textEl = $('.generating-panel__text');
    var subEl = $('.generating-panel__sub');
    var phrases = [
      'AI 正在理解你的内容...',
      '正在构建页面结构...',
      '选择最佳排版方案...',
      '优化视觉效果...',
      '即将完成...'
    ];

    // 获取用户输入
    var userInput = '';
    var textarea = $('#inputText');
    var voiceResult = $('.voice-panel__result');
    if (textarea && textarea.value.trim()) {
      userInput = textarea.value.trim();
    } else if (voiceResult && voiceResult.textContent.trim()) {
      userInput = voiceResult.textContent.trim();
    }

    if (!userInput) {
      textEl.textContent = '未检测到输入内容';
      if (subEl) subEl.textContent = '请返回输入内容后重试';
      return;
    }

    // 播放动画
    var animIndex = 0;
    textEl.textContent = phrases[0];
    var animTimer = setInterval(function () {
      animIndex++;
      if (animIndex < phrases.length) {
        textEl.style.opacity = 0;
        setTimeout(function () {
          textEl.textContent = phrases[animIndex];
          textEl.style.opacity = 1;
        }, 300);
      }
    }, 800);

    // 调用真实GLM API
    generateWithGLM(userInput).then(function (result) {
      clearInterval(animTimer);

      if (result.success) {
        // Sanitize AI-generated HTML body before any use
        result.sample.body = sanitizeHtml(result.sample.body);
        currentSample = result.sample;
        textEl.textContent = '生成完成！';
        setTimeout(function () {
          currentStep = 3;
          updateStepUI();
          renderPreview();
        }, 500);
      } else {
        // 显示错误信息 + 重试按钮
        textEl.textContent = '生成失败：' + (result.error || '未知错误');
        if (subEl) subEl.innerHTML = '<button id="retryBtn" style="margin-top:12px;padding:8px 20px;border:1px solid var(--accent);background:transparent;color:var(--accent);border-radius:8px;cursor:pointer;font-size:0.9rem;">🔄 重试</button>';

        var retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
          retryBtn.addEventListener('click', function () {
            // 恢复提示文字
            textEl.textContent = phrases[0];
            if (subEl) subEl.textContent = '这通常只需要几秒钟';
            startGeneration();
          });
        }
      }
    });
  }

  /* ========== Step 3: 预览 ========== */
  function renderPreview() {
    if (!currentSample) return;

    var date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    var data = {
      title: currentSample.title,
      subtitle: currentSample.subtitle,
      tags: currentSample.tags,
      date: date,
      body: currentSample.body
    };

    var html = TEMPLATES[currentTemplate](data);
    currentFullHtml = html;

    var iframe = $('#previewFrame');
    // sandbox: allow-same-origin needed for contentDocument write access.
    // XSS is prevented by sanitizeHtml() which strips all dangerous tags & event handlers.
    iframe.setAttribute('sandbox', 'allow-same-origin');
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(sanitizeHtml(html));
    doc.close();

    // Update HTML editor content
    var editor = $('#htmlCodeEditor');
    if (editor) editor.value = html;
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function bindTemplateSwitcher() {
    var btns = $$('.style-switcher__btn');
    if (btns.length === 0) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        // Map style to template
        var style = btn.dataset.style;
        if (style === 'minimal') currentTemplate = 'diary';
        else if (style === 'vibrant') currentTemplate = 'note';
        else if (style === 'dark') currentTemplate = 'project';
        else currentTemplate = 'diary';
        renderPreview();
      });
    });
  }

  function bindEditBtn() {
    var editBtn = $('#editToggleBtn');
    var htmlEditor = $('#htmlEditor');
    var applyBtn = $('#editorApplyBtn');
    var closeBtn = $('#editorCloseBtn');
    var regenBtn = $('#regenBtn');
    var isOpen = false;

    function toggleEditor(open) {
      isOpen = typeof open === 'boolean' ? open : !isOpen;
      if (htmlEditor) htmlEditor.classList.toggle('visible', isOpen);
      if (editBtn) editBtn.textContent = isOpen ? '收起编辑' : '编辑 HTML';
    }

    if (editBtn) {
      editBtn.addEventListener('click', function () {
        toggleEditor();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        toggleEditor(false);
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        var editor = $('#htmlCodeEditor');
        if (!editor || !editor.value) return;

        currentFullHtml = editor.value;

        var iframe = $('#previewFrame');
        iframe.setAttribute('sandbox', 'allow-same-origin');
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        // Sanitize user-edited HTML as well
        doc.write(sanitizeHtml(currentFullHtml));
        doc.close();

        toggleEditor(false);
      });
    }

    if (regenBtn) {
      regenBtn.addEventListener('click', function () {
        // Re-run generation flow instead of reloading the page
        toggleEditor(false);
        currentStep = 2;
        updateStepUI();
        startGeneration();
      });
    }
  }

  /* ========== HTML编辑器快捷键 ========== */
  function bindEditorShortcuts() {
    var editor = $('#htmlCodeEditor');
    if (!editor) return;

    // Tab缩进（2空格）
    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
      }
    });

    // Ctrl/Cmd + Enter 应用修改
    editor.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        var applyBtn = $('#editorApplyBtn');
        if (applyBtn) applyBtn.click();
      }
    });
  }

  /* ========== Step 3→4: 发布（保存到 localStorage）========== */
  function bindPublishBtn() {
    var btn = $('#publishBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!currentSample) return;

      // 防止发布空页面
      if (!currentFullHtml || currentFullHtml.trim().length < 10) {
        showError('内容为空，请先生成或编辑内容');
        return;
      }

      // 防重复点击
      btn.disabled = true;
      var origText = btn.textContent;
      btn.textContent = '发布中...';

      // 生成页面 body HTML（用选定的模板渲染）
      if (!currentFullHtml) {
        var date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        currentFullHtml = TEMPLATES[currentTemplate]({
          title: currentSample.title,
          subtitle: currentSample.subtitle || '',
          tags: currentSample.tags || [],
          date: date,
          body: currentSample.body
        });
      }

      // 保存到 localStorage（包含 fullHtml）
      var page = MojiStorage.savePage({
        title: currentSample.title,
        body: currentSample.body,
        fullHtml: currentFullHtml,
        template: currentTemplate,
        tags: currentSample.tags || [],
        subtitle: currentSample.subtitle || ''
      });

      // 存储失败时恢复按钮
      if (!page) {
        btn.disabled = false;
        btn.textContent = origText;
        alert('发布失败：存储空间不足，请删除部分旧内容后重试。');
        return;
      }

      savedPageId = page.id;

      // 处理密码 — 如果之前已保存过密码，自动勾选
      var pwdCheckbox = $('#passwordToggle');
      var pwdInput = $('#passwordInput');
      // Step 4 密码设置在发布后操作
      if (MojiStorage.hasPassword(savedPageId)) {
        if (pwdCheckbox) pwdCheckbox.checked = true;
        if ($('#passwordField')) $('#passwordField').classList.add('visible');
        if (pwdInput) pwdInput.value = '••••••'; // placeholder
      }

      // 进入发布确认
      currentStep = 4;
      updateStepUI();

      // 生成本地链接
      var baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
      var shareUrl = baseUrl + 'view.html?id=' + page.id;

      $('#publishUrl').textContent = shareUrl;
      $('#publishUrl').dataset.url = shareUrl;
    });
  }

  /* ========== Step 4: 发布确认 ========== */
  function bindCopyBtn() {
    var btn = $('#copyBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var url = $('#publishUrl').dataset.url || $('#publishUrl').textContent;
      navigator.clipboard.writeText(url).then(function () {
        btn.textContent = '已复制 ✓';
        btn.classList.add('copied');
        setTimeout(function () { btn.textContent = '复制链接'; btn.classList.remove('copied'); }, 2000);
      }).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = '已复制 ✓';
        btn.classList.add('copied');
        setTimeout(function () { btn.textContent = '复制链接'; btn.classList.remove('copied'); }, 2000);
      });
    });
  }

  function bindShareBtns() {
    var shareBtns = $$('.publish-share__btn');
    if (shareBtns.length === 0) return;
    // All share buttons are disabled (coming-soon). No click handlers needed.
  }

  /* ========== 密码保护（Step 4 发布后设置）========== */
  function bindPasswordToggle() {
    var checkbox = $('#passwordToggle');
    var field = $('#passwordField');
    var input = $('#passwordInput');
    var saveBtn = $('#passwordSaveBtn');

    if (!checkbox) return;

    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        field.classList.add('visible');
        input.removeAttribute('readonly');
        input.value = '';
        input.focus();
      } else {
        field.classList.remove('visible');
        // 移除密码
        if (savedPageId) {
          MojiStorage.removePassword(savedPageId);
        }
        input.value = '';
      }
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var pwd = input.value.trim();
        if (pwd.length < 1) {
          input.focus();
          return;
        }
        if (savedPageId) {
          MojiStorage.setPassword(savedPageId, pwd);
        }
        input.setAttribute('readonly', true);
        saveBtn.textContent = '已设置 ✓';
        saveBtn.classList.add('saved');
        setTimeout(function () { saveBtn.textContent = '保存密码'; saveBtn.classList.remove('saved'); }, 1500);
      });
    }
  }

  /* ========== 返回继续创作 ========== */
  function bindBackBtn() {
    var btn = $('#backBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      currentStep = 1;
      currentSample = null;
      currentTemplate = 'diary';
      savedPageId = null;
      savedPassword = '';

      var inputText = $('#inputText'); if (inputText) inputText.value = '';
      var counter = $('.input-area__count'); if (counter) counter.textContent = '0 / 5000 字';
      var genBtn = $('#generateBtn'); if (genBtn) genBtn.disabled = true;

      $$('.style-switcher__btn').forEach(function (b) {
        b.classList.remove('active');
        if (b.dataset.style === 'minimal') b.classList.add('active');
      });

      var htmlEditor = $('.html-editor'); if (htmlEditor) htmlEditor.classList.remove('visible');
      var editBtn = $('#editToggleBtn'); if (editBtn) editBtn.textContent = '编辑 HTML';

      var voiceResult = $('.voice-panel__result'); if (voiceResult) voiceResult.classList.remove('visible');
      var voiceHint = $('.voice-panel__hint'); if (voiceHint) voiceHint.textContent = '点击按钮开始录音';

      $$('.input-tabs__btn').forEach(function (b) {
        b.classList.remove('active');
        if (b.dataset.mode === 'text') b.classList.add('active');
      });
      var inputArea = $('.input-area'); if (inputArea) inputArea.style.display = 'block';
      var voicePanel = $('.voice-panel'); if (voicePanel) voicePanel.classList.remove('active');

      // 重置密码
      var pwdCheckbox = $('#passwordToggle');
      var pwdField = $('#passwordField');
      var pwdInput = $('#passwordInput');
      if (pwdCheckbox) pwdCheckbox.checked = false;
      if (pwdField) pwdField.classList.remove('visible');
      if (pwdInput) pwdInput.value = '';

      updateStepUI();
    });
  }

  /* ========== 启动 ========== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
