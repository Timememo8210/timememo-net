/* ============================================
   墨记Web — 创作页逻辑 (Create Page Logic)
   四步流程：输入 → AI生成 → 预览 → 发布
   连接 localStorage 存储 + GLM API (Worker代理)
   支持图片/PDF/TXT上传（图片直接嵌入网页）
   ============================================ */

(function () {
  'use strict';

  /* 转义 HTML 特殊字符，防止 XSS */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* HTML 消毒函数：移除危险标签和事件属性，防止 XSS 注入
   * 注意：img 的 src 属性允许 data: URI（用户上传的 base64 图片） */
  var ALLOWED_TAGS = {
    p:1, h1:1, h2:1, h3:1, h4:1, h5:1, h6:1, blockquote:1,
    ul:1, ol:1, li:1, strong:1, em:1, b:1, i:1, span:1,
    br:1, hr:1, div:1, img:1, a:1, pre:1, code:1,
    table:1, thead:1, tbody:1, tr:1, th:1, td:1,
    dl:1, dt:1, dd:1, figure:1, figcaption:1, details:1, summary:1,
    mark:1, small:1, sub:1, sup:1, abbr:1, cite:1, q:1
  };
  var ALLOWED_ATTRS = {
    img: { src:1, alt:1, style:1 },
    a: { href:1 }
  };

  function sanitizeHtml(html) {
    if (!html) return '';
    var result = '';
    var re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>|<!--[\s\S]*?-->/g;
    var lastIndex = 0;
    var match;
    while ((match = re.exec(html)) !== null) {
      result += html.substring(lastIndex, match.index);
      lastIndex = re.lastIndex;
      if (match[0].charAt(1) === '!') continue;
      var isClosing = match[1];
      var tag = match[2].toLowerCase();
      var attrs = match[3];
      var selfClose = match[4];
      if (!ALLOWED_TAGS[tag]) continue;
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
            if (attrName.indexOf('on') === 0) continue;
            if (allowedForTag && allowedForTag[attrName]) {
              // 对于 img.src，只允许安全的 data: URI 和 http(s)
              if (tag === 'img' && attrName === 'src') {
                var srcVal = attrMatch[0];
                if (srcVal.indexOf('data:image') === -1 && srcVal.indexOf('https://') === -1 && srcVal.indexOf('http://') === -1) continue;
              }
              // 阻止 SVG data URI XSS
              if (attrName === 'src' && attrMatch[0].indexOf('data:') !== -1) {
                var attrValue = attrMatch[0].replace(/^\s*src\s*=\s*/, '');
                attrValue = attrValue.replace(/^["']|["']$/g, '').trim();
                if (attrValue.indexOf('data:') === 0) {
                  if (!/^data:image\/(jpeg|png|gif|webp);base64,/.test(attrValue)) {
                    continue; // 跳过不安全的 data URI（如 svg+xml）
                  }
                }
              }
              // 过滤危险协议：javascript: / vbscript:
              if (tag === 'a' && attrName === 'href') {
                var hrefVal = attrMatch[0].replace(/^\s*href\s*=\s*/, '');
                var cleanHref = hrefVal.replace(/^["']|["']$/g, '').trim().toLowerCase();
                if (cleanHref.indexOf('javascript:') === 0 || cleanHref.indexOf('vbscript:') === 0) continue;
              }
              safeAttrs += ' ' + attrMatch[0];
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
        '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Noto Serif SC\',Georgia,serif;background:#faf9f6;color:#2c2c2c;padding:40px 24px;line-height:1.9}.container{max-width:640px;margin:0 auto}.date{color:#9c958e;font-size:0.9rem;margin-bottom:8px}h1{font-size:1.8rem;margin-bottom:4px;font-weight:700}.subtitle{color:#6b6560;font-size:1.05rem;margin-bottom:32px;font-style:italic}p{margin-bottom:1.2em;font-size:1rem}h2{font-size:1.3rem;margin:1.8em 0 0.6em;color:#e85d26;font-weight:600}h3{font-size:1.1rem;margin:1.4em 0 0.4em;font-weight:600}blockquote{border-left:3px solid #e85d26;padding:12px 20px;margin:1.5em 0;background:#fef3ed;border-radius:0 12px 12px 0;font-style:italic;color:#6b6560}ul,ol{margin:0.8em 0 1.2em 1.5em}li{margin-bottom:0.4em}img{max-width:100%;height:auto;border-radius:8px;margin:1em 0}.tags{display:flex;gap:8px;margin-top:32px;flex-wrap:wrap}.tag{padding:4px 14px;border-radius:999px;background:#f0ede6;font-size:0.8rem;color:#6b6560}</style></head><body>' +
        '<div class="container"><div class="date">' + escapeHtml(data.date) + '</div><h1>' + escapeHtml(data.title) + '</h1>' +
        '<div class="subtitle">' + escapeHtml(data.subtitle) + '</div>' + data.body +
        '<div class="tags">' + data.tags.map(function(t){return '<span class="tag">' + escapeHtml(t) + '</span>';}).join('') + '</div>' +
        '</div></body></html>';
    },
    note: function (data) {
      return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Noto Sans SC\',system-ui,sans-serif;background:#faf9f6;color:#2c2c2c;padding:40px 24px;line-height:1.8}.container{max-width:700px;margin:0 auto;border-left:3px solid #e85d26;padding-left:28px}.date{color:#9c958e;font-size:0.85rem;margin-bottom:12px;font-family:monospace}h1{font-size:1.7rem;margin-bottom:6px;font-weight:700}.subtitle{color:#6b6560;font-size:1rem;margin-bottom:28px}p{margin-bottom:1.1em;font-size:0.95rem}h2{font-size:1.2rem;margin:1.6em 0 0.5em;color:#e85d26;font-weight:600;border-bottom:1px solid #f0ede6;padding-bottom:4px}h3{font-size:1.05rem;margin:1.2em 0 0.3em;font-weight:600}blockquote{border-left:2px solid #f4a67a;padding:10px 16px;margin:1.3em 0;color:#6b6560;font-style:italic}ul,ol{margin:0.6em 0 1em 1.3em}li{margin-bottom:0.35em;font-size:0.95rem}img{max-width:100%;height:auto;border-radius:8px;margin:1em 0}strong{color:#e85d26}.tags{display:flex;gap:6px;margin-top:28px;flex-wrap:wrap}.tag{padding:3px 12px;border-radius:4px;background:#f0ede6;font-size:0.78rem;color:#6b6560;font-family:monospace}</style></head><body>' +
        '<div class="container"><div class="date">' + escapeHtml(data.date) + ' · 知识笔记</div><h1>' + escapeHtml(data.title) + '</h1>' +
        '<div class="subtitle">' + escapeHtml(data.subtitle) + '</div>' + data.body +
        '<div class="tags">' + data.tags.map(function(t){return '<span class="tag">#' + escapeHtml(t) + '</span>';}).join('') + '</div>' +
        '</div></body></html>';
    },
    project: function (data) {
      return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Noto Sans SC\',system-ui,sans-serif;background:#2c2c2c;color:#f0ede6;padding:40px 24px;line-height:1.8}.container{max-width:680px;margin:0 auto}.header{background:linear-gradient(135deg,#e85d26,#f4a67a);padding:32px 28px;border-radius:16px;margin-bottom:32px;color:#fff}.date{font-size:0.85rem;opacity:0.85;margin-bottom:8px}h1{font-size:1.7rem;margin-bottom:4px;font-weight:700}.subtitle{opacity:0.9;font-size:1rem}.content{padding:0 4px}p{margin-bottom:1.1em;font-size:0.95rem}h2{font-size:1.2rem;margin:1.6em 0 0.5em;color:#f4a67a;font-weight:600}h3{font-size:1.05rem;margin:1.2em 0 0.3em;color:#e85d26;font-weight:600}blockquote{border-left:3px solid #e85d26;padding:10px 16px;margin:1.3em 0;background:rgba(232,93,38,0.1);border-radius:0 8px 8px 0;color:#f4a67a}ul,ol{margin:0.6em 0 1em 1.3em}li{margin-bottom:0.35em}img{max-width:100%;height:auto;border-radius:12px;margin:1em 0}strong{color:#f4a67a}.tags{display:flex;gap:8px;margin-top:28px;flex-wrap:wrap}.tag{padding:4px 12px;border-radius:999px;border:1px solid rgba(244,166,122,0.4);font-size:0.78rem;color:#f4a67a}</style></head><body>' +
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
  var savedPageId = null;
  var savedPassword = '';
  var currentFullHtml = '';

  /* ========== 文件上传状态 ========== */
  // uploadedFiles: 每项 = { id, name, type, size, dataUrl (图片) | text (文本/PDF) }
  var uploadedFiles = [];
  var fileIdCounter = 0;

  /* ========== 前端 Rate Limiting ========== */
  var _apiCallTimestamps = [];

  function checkRateLimit() {
    var config = window.MOJI_CONFIG || {};
    var limit = config.RATE_LIMIT || 3;
    var windowMs = config.RATE_WINDOW_MS || 60000;
    var now = Date.now();
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

  /* ===================================================
     Worker 代理 API 调用（无需 Authorization header）
     =================================================== */
  async function callWorkerApi(payload) {
    var config = window.MOJI_CONFIG || {};
    var apiUrl = config.API_URL || '';
    if (!apiUrl) {
      return { success: false, error: 'API代理地址未配置' };
    }

    try {
      var response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        var errBody = '';
        try { errBody = await response.text(); } catch(e) {}
        throw new Error('API请求失败: ' + response.status + ' ' + errBody);
      }

      var data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      console.error('[墨记] Worker API错误:', error);
      var errorMsg = error.message || '未知错误';
      if (errorMsg.indexOf('Failed to fetch') !== -1 || errorMsg.indexOf('NetworkError') !== -1 || errorMsg.indexOf('Load failed') !== -1) {
        errorMsg = '网络请求失败，请检查网络连接或稍后重试。';
      }
      return { success: false, error: errorMsg };
    }
  }

  /* ========== GLM API：文本生成网页 ========== */
  async function generateWithGLM(userInput, imageDataUrls) {
    if (!checkRateLimit()) {
      return { success: false, error: '请求过于频繁，请稍后再试（每分钟最多3次）' };
    }

    var config = window.MOJI_CONFIG || {};
    var model = config.MODEL || 'glm-4-flash';
    var temperature = config.TEMPERATURE || 0.7;
    var maxTokens = config.MAX_TOKENS || 2048;

    // 构建系统 prompt
    var systemPrompt = '你是墨记AI助手。用户会给你一段文字，请将其扩展为一篇精美的网页文章，包含标题、副标题、标签和HTML格式的正文。\n\n';
    systemPrompt += '要求：\n';
    systemPrompt += '1. 使用语义化HTML标签（h1, h2, p, blockquote, ul, li, strong, em, img）\n';
    systemPrompt += '2. 内容必须完全基于用户输入的文字，不要添加用户没说的内容\n';
    systemPrompt += '3. 排版要精美：合理的标题层级、段落分隔、重要内容加粗、适当的引用块\n';
    systemPrompt += '4. 如果用户输入很短（一句话），就做成一张精美的卡片式页面\n';
    systemPrompt += '5. 如果用户输入是一段话，就做成一篇短文\n';

    // 如果有图片，告诉AI在合适位置嵌入
    if (imageDataUrls && imageDataUrls.length > 0) {
      systemPrompt += '6. 用户提供了 ' + imageDataUrls.length + ' 张图片，你必须在HTML正文的合适位置（如开头、段落之间）用 <img> 标签嵌入这些图片。';
      systemPrompt += '图片 src 使用下方提供的数据URL。';
      systemPrompt += '图片应该：有合适的 alt 描述文字、加上 style="max-width:100%;height:auto;border-radius:8px;margin:1em 0;"\n';
      systemPrompt += '图片数据URL列表：\n';
      for (var i = 0; i < imageDataUrls.length; i++) {
        systemPrompt += '图片' + (i + 1) + ': ' + imageDataUrls[i] + '\n';
      }
    }

    systemPrompt += '\n返回JSON格式（不要markdown代码块包裹）：\n{"title":"标题","subtitle":"副标题","tags":["标签1","标签2"],"body":"<p>HTML格式正文</p>"}';

    // 构建用户消息
    var userMessage = userInput;

    var result = await callWorkerApi({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: temperature,
      max_tokens: maxTokens
    });

    if (!result.success) return result;

    var data = result.data;
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
      return { success: false, error: 'AI返回格式无法解析，请重试' };
    }

    try {
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
    } catch (e) {
      return { success: false, error: 'AI返回的JSON格式错误，请重试' };
    }
  }

  /* ========== 简易错误提示 ========== */
  function showError(msg) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 24px;background:#e85d26;color:#fff;border-radius:12px;font-size:0.9rem;z-index:9999;opacity:0;transition:opacity 0.3s;max-width:90vw;text-align:center;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '1'; }, 10);
    setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 4000);
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

  /* ===================================================
     文件上传逻辑
     =================================================== */

  /* 压缩图片：限制最大宽度 + JPEG 压缩 */
  function compressImage(file, maxWidth, quality) {
    maxWidth = maxWidth || 800;
    quality = quality || 0.7;
    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
        URL.revokeObjectURL(img.src);
      };
      img.onerror = function() { reject(new Error('图片压缩失败')); };
      img.src = URL.createObjectURL(file);
    });
  }

  /* 读取图片为 base64 data URL */
  function readImageAsDataURL(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = function() { reject(new Error('图片读取失败')); };
      reader.readAsDataURL(file);
    });
  }

  /* 读取文本文件 */
  function readTextFile(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = function() { reject(new Error('文件读取失败')); };
      reader.readAsText(file);
    });
  }

  /* 用 pdf.js 提取 PDF 文本 */
  function extractPdfText(file) {
    return new Promise(function(resolve, reject) {
      if (typeof pdfjsLib === 'undefined') {
        reject(new Error('PDF解析不可用（PDF.js未加载）'));
        return;
      }
      var reader = new FileReader();
      reader.onload = async function() {
        try {
          var typedArray = new Uint8Array(reader.result);
          var pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          var textParts = [];
          for (var i = 1; i <= pdf.numPages; i++) {
            var page = await pdf.getPage(i);
            var textContent = await page.getTextContent();
            var pageText = textContent.items.map(function(item) { return item.str; }).join(' ');
            textParts.push(pageText);
          }
          resolve(textParts.join('\n\n'));
        } catch (e) {
          reject(new Error('PDF解析失败: ' + e.message));
        }
      };
      reader.onerror = function() { reject(new Error('PDF文件读取失败')); };
      reader.readAsArrayBuffer(file);
    });
  }

  /* 处理文件上传 */
  async function handleFiles(files) {
    if (uploadedFiles.length + files.length > 10) {
      var statusEl = document.getElementById('uploadStatus');
      if (statusEl) statusEl.textContent = '⚠️ 最多上传10个文件';
      return;
    }
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      // 大小限制：10MB
      if (file.size > 10 * 1024 * 1024) {
        showError('文件 "' + file.name + '" 超过 10MB 限制');
        continue;
      }

      var fileEntry = {
        id: ++fileIdCounter,
        name: file.name,
        size: file.size,
        type: file.type,
        category: 'text',
        dataUrl: null,
        text: null
      };

      try {
        if (file.type.startsWith('image/')) {
          // 图片 → 压缩后嵌入 HTML
          fileEntry.category = 'image';
          fileEntry.dataUrl = await compressImage(file, 800, 0.7);
        } else if (file.type === 'application/pdf') {
          // PDF → 提取文本
          fileEntry.category = 'pdf';
          fileEntry.text = await extractPdfText(file);
        } else if (file.name.endsWith('.txt') || file.name.endsWith('.md') ||
                   file.type === 'text/plain' || file.type === 'text/markdown') {
          // 文本文件 → 直接读取
          fileEntry.category = 'text';
          fileEntry.text = await readTextFile(file);
        } else {
          showError('不支持的文件类型: ' + file.name);
          continue;
        }

        uploadedFiles.push(fileEntry);

        // 单张图片 base64 大小检查：超 500KB 再次压缩
        if (fileEntry.dataUrl && fileEntry.dataUrl.length > 500 * 1024) {
          try {
            var oversizedBlob = await (await fetch(fileEntry.dataUrl)).blob();
            var oversizedFile = new File([oversizedBlob], fileEntry.name, { type: 'image/jpeg' });
            fileEntry.dataUrl = await compressImage(oversizedFile, 600, 0.5);
            if (fileEntry.dataUrl.length > 500 * 1024) {
              var sEl = document.getElementById('uploadStatus');
              if (sEl) sEl.textContent = '⚠️ 图片 "' + fileEntry.name + '" 压缩后仍较大，可能影响性能';
            }
          } catch (reCompErr) {
            // 二次压缩失败，保留原始
          }
        }

        // 检查总大小（base64字符串长度 ≈ 原始大小 * 1.37）
        var totalSize = uploadedFiles.reduce(function(sum, f) { return sum + (f.dataUrl || f.text || '').length; }, 0);
        if (totalSize > 4 * 1024 * 1024) {
          // 超限，移除刚添加的文件
          uploadedFiles.pop();
          renderFilePreview();
          var statusEl = document.getElementById('uploadStatus');
          if (statusEl) statusEl.textContent = '⚠️ 附件总大小超限（4MB），请减少文件数量';
          return;
        }
      } catch (e) {
        showError('处理文件 "' + file.name + '" 时出错: ' + e.message);
      }
    }

    renderFilePreview();
    updateGenerateBtnState();
  }

  /* 格式化文件大小 */
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /* 渲染已上传文件列表 */
  function renderFilePreview() {
    var list = $('#filePreviewList');
    if (!list) return;
    list.innerHTML = '';

    uploadedFiles.forEach(function(f) {
      var item = document.createElement('div');
      item.className = 'file-preview-item';
      item.dataset.fileId = f.id;

      var icon = '';
      var detail = '';
      if (f.category === 'image') {
        icon = '<img class="file-preview-thumb" src="' + f.dataUrl + '" alt="' + escapeHtml(f.name) + '">';
        detail = f.name + ' (' + formatFileSize(f.size) + ')';
      } else if (f.category === 'pdf') {
        icon = '<span class="file-preview-icon">📄</span>';
        var preview = f.text ? (f.text.substring(0, 80) + (f.text.length > 80 ? '...' : '')) : '(无法提取文本)';
        detail = '<strong>' + escapeHtml(f.name) + '</strong> (' + formatFileSize(f.size) + ')<br><span class="file-preview-text">' + escapeHtml(preview) + '</span>';
      } else {
        icon = '<span class="file-preview-icon">📝</span>';
        var preview2 = f.text ? (f.text.substring(0, 80) + (f.text.length > 80 ? '...' : '')) : '';
        detail = '<strong>' + escapeHtml(f.name) + '</strong> (' + formatFileSize(f.size) + ')<br><span class="file-preview-text">' + escapeHtml(preview2) + '</span>';
      }

      item.innerHTML =
        '<div class="file-preview-info">' + icon + '<div class="file-preview-detail">' + detail + '</div></div>' +
        '<button class="file-preview-remove" data-remove-id="' + f.id + '" title="移除文件">✕</button>';
      list.appendChild(item);
    });

    // 绑定删除按钮
    list.querySelectorAll('.file-preview-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var removeId = parseInt(btn.dataset.removeId, 10);
        uploadedFiles = uploadedFiles.filter(function(f) { return f.id !== removeId; });
        renderFilePreview();
        updateGenerateBtnState();
      });
    });
  }

  /* 绑定上传区域事件 */
  function bindUploadArea() {
    var zone = $('#uploadZone');
    var input = $('#fileInput');
    if (!zone || !input) return;

    // 点击打开文件选择
    zone.addEventListener('click', function() {
      input.click();
    });

    // 键盘支持：Enter/Space 触发文件选择
    zone.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    // 文件选择
    input.addEventListener('change', function() {
      if (input.files && input.files.length > 0) {
        handleFiles(input.files);
        input.value = ''; // 重置，允许重复选同文件
      }
    });

    // 拖拽
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('upload-zone--dragover');
    });

    zone.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('upload-zone--dragover');
    });

    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('upload-zone--dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });
  }

  /* ========== 生成按钮状态 ========== */
  function updateGenerateBtnState() {
    var genBtn = $('#generateBtn');
    var hintEl = $('#generateBtnHint');
    if (!genBtn) return;

    var hasText = false;
    var textarea = $('#inputText');
    var voiceResult = $('.voice-panel__result');
    var userText = '';

    if (textarea && textarea.value.trim()) {
      hasText = true;
      userText = textarea.value.trim();
    } else if (voiceResult && voiceResult.textContent.trim()) {
      hasText = true;
      userText = voiceResult.textContent.trim();
    }

    // 有文本内容 → 可生成
    // 或者有上传的文本/PDF文件（自动合并为内容）→ 可生成
    var hasFileContent = uploadedFiles.some(function(f) { return f.category === 'text' || f.category === 'pdf'; });
    var hasImages = uploadedFiles.some(function(f) { return f.category === 'image'; });
    // 只有文字或文本文件才能生成；纯图片需要配合文字描述
    var canGenerate = hasText || hasFileContent;

    genBtn.disabled = !canGenerate;

    if (hintEl) {
      if (!canGenerate && hasImages) {
        // 有图片但没文字也没文本文件
        hintEl.textContent = '💡 请输入一些文字描述你的图片';
        hintEl.style.display = 'block';
      } else {
        hintEl.style.display = 'none';
      }
    }
  }

  /* ===================================================
     初始化
     =================================================== */
  function init() {
    bindStepIndicator();
    bindInputTabs();
    bindVoicePanel();
    bindUploadArea();
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
    } else {
      document.querySelectorAll('[data-lucide]').forEach(function(el) {
        el.textContent = el.getAttribute('data-fallback') || '';
        el.style.display = 'inline-block';
      });
    }

    // 初始化按钮状态（防止浏览器autofill导致按钮灰色）
    updateGenerateBtnState();
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

    if (currentStep >= 2 && currentStep <= 3) {
      enableBeforeunload();
    } else if (currentStep === 4) {
      disableBeforeunload();
    }
  }

  /* ========== Step 1: 输入 ========== */
  function bindInputTabs() {
    var btns = $$('.input-tabs__btn');
    var textPanel = $('.input-area');
    var voicePanel = $('.voice-panel');

    if (btns.length > 0) {
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
    }

    var textarea = $('#inputText');
    var counter = $('.input-area__count');
    if (textarea) {
      textarea.addEventListener('input', function () {
        var len = textarea.value.length;
        if (counter) counter.textContent = len + ' / 5000 字';
        updateGenerateBtnState();
      });
    }
  }

  /* ========== 语音模拟 ========== */
  function bindVoicePanel() {
    var btn = $('.voice-panel__btn');
    if (!btn) return;
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
      var textarea = $('#inputText');
      if (textarea) textarea.value = text;
      updateGenerateBtnState();
      var counter = $('.input-area__count');
      if (counter) counter.textContent = text.length + ' / 5000 字';
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

  /* ========== 构建发给API的用户输入 ========== */
  function buildUserInput() {
    var textarea = $('#inputText');
    var voiceResult = $('.voice-panel__result');
    var parts = [];

    // 1) 用户直接输入的文字
    var directText = '';
    if (textarea && textarea.value.trim()) {
      directText = textarea.value.trim();
    } else if (voiceResult && voiceResult.textContent.trim()) {
      directText = voiceResult.textContent.trim();
    }
    if (directText) {
      parts.push(directText);
    }

    // 2) 文本/PDF文件的提取内容
    uploadedFiles.forEach(function(f) {
      if ((f.category === 'text' || f.category === 'pdf') && f.text && f.text.trim()) {
        parts.push('--- 来自文件: ' + f.name + ' ---\n' + f.text.trim());
      }
    });

    return parts.join('\n\n');
  }

  /* ========== Step 2: AI生成（Worker代理） ========== */
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

    // 构建用户输入（文字 + 文件内容）
    var userInput = buildUserInput();

    // 收集图片 data URL（直接嵌入HTML用）
    var imageDataUrls = uploadedFiles.filter(function(f) {
      return f.category === 'image' && f.dataUrl;
    }).map(function(f) {
      return f.dataUrl;
    });

    if (!userInput && imageDataUrls.length === 0) {
      textEl.textContent = '未检测到输入内容';
      if (subEl) subEl.innerHTML = '<button id="backToStep1Btn" style="margin-top:12px;padding:8px 20px;border:1px solid var(--accent);background:transparent;color:var(--accent);border-radius:8px;cursor:pointer;font-size:0.9rem;">← 返回输入</button>';
      var backBtn = document.getElementById('backToStep1Btn');
      if (backBtn) {
        backBtn.addEventListener('click', function () {
          currentStep = 1;
          updateStepUI();
        });
      }
      return;
    }

    // 如果只有图片没有文字，给一个默认提示
    if (!userInput && imageDataUrls.length > 0) {
      userInput = '请为这些图片创建一个精美的展示页面，展示这些照片，配上合适的标题和简短描述。';
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

    // 调用 Worker 代理 API
    generateWithGLM(userInput, imageDataUrls).then(function (result) {
      clearInterval(animTimer);

      if (result.success) {
        // Sanitize AI-generated HTML body
        result.sample.body = sanitizeHtml(result.sample.body);
        currentSample = result.sample;
        textEl.textContent = '生成完成！';
        setTimeout(function () {
          currentStep = 3;
          updateStepUI();
          renderPreview();
        }, 500);
      } else {
        textEl.textContent = '生成失败：' + (result.error || '未知错误');
        if (subEl) subEl.innerHTML = '<button id="retryBtn" style="margin-top:12px;padding:8px 20px;border:1px solid var(--accent);background:transparent;color:var(--accent);border-radius:8px;cursor:pointer;font-size:0.9rem;">🔄 重试</button> <button id="backBtn2" style="margin-top:12px;margin-left:8px;padding:8px 20px;border:1px solid var(--text-secondary);background:transparent;color:var(--text-secondary);border-radius:8px;cursor:pointer;font-size:0.9rem;">← 返回</button>';

        var retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
          retryBtn.addEventListener('click', function () {
            textEl.textContent = phrases[0];
            if (subEl) subEl.textContent = '这通常只需要几秒钟';
            startGeneration();
          });
        }
        var backBtn2 = document.getElementById('backBtn2');
        if (backBtn2) {
          backBtn2.addEventListener('click', function () {
            currentStep = 1;
            updateStepUI();
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
    iframe.setAttribute('sandbox', 'allow-same-origin');
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

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

        // 注意：此处不能用 sanitizeHtml() 清洗完整HTML页面——它会剥离<html>/<head>/<style>/<body>等标签
        // sanitizeHtml 只应用于 AI 生成的 body 片段（startGeneration 中已处理）
        currentFullHtml = editor.value;
        if (editor) editor.value = currentFullHtml;

        var iframe = $('#previewFrame');
        iframe.setAttribute('sandbox', 'allow-same-origin');
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(currentFullHtml);
        doc.close();

        toggleEditor(false);
      });
    }

    if (regenBtn) {
      regenBtn.addEventListener('click', function () {
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

    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
      }
    });

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

      if (!currentFullHtml || currentFullHtml.trim().length < 10) {
        showError('内容为空，请先生成或编辑内容');
        return;
      }

      btn.disabled = true;
      var origText = btn.textContent;
      btn.textContent = '发布中...';

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

      var page = MojiStorage.savePage({
        title: currentSample.title,
        body: currentSample.body,
        fullHtml: currentFullHtml,
        template: currentTemplate,
        tags: currentSample.tags || [],
        subtitle: currentSample.subtitle || ''
      });

      if (!page) {
        btn.disabled = false;
        btn.textContent = origText;
        alert('发布失败：存储空间不足，请删除部分旧内容后重试。');
        return;
      }

      savedPageId = page.id;

      var pwdCheckbox = $('#passwordToggle');
      var pwdInput = $('#passwordInput');
      if (MojiStorage.hasPassword(savedPageId)) {
        if (pwdCheckbox) pwdCheckbox.checked = true;
        if ($('#passwordField')) $('#passwordField').classList.add('visible');
        if (pwdInput) pwdInput.value = '••••••';
      }

      currentStep = 4;
      updateStepUI();

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
  }

  /* ========== 密码保护 ========== */
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
      uploadedFiles = [];

      var inputText = $('#inputText'); if (inputText) inputText.value = '';
      var counter = $('.input-area__count'); if (counter) counter.textContent = '0 / 5000 字';
      var genBtn = $('#generateBtn'); if (genBtn) genBtn.disabled = true;
      var filePreviewList = $('#filePreviewList'); if (filePreviewList) filePreviewList.innerHTML = '';
      var hintEl = $('#generateBtnHint'); if (hintEl) hintEl.style.display = 'none';

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
