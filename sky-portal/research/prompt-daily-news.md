# 📡 每日研报生成指令 (Daily News Collection + HTML)
> 版本: v1.0 · 2026-04-06

---

## 执行流程

搜索以下六个板块的最新新闻和数据，生成一份HTML研报并发布到GitHub Pages。推送通知由独立的 prompt-push.md 模块处理。

---

## 板块1 - 🔬 半导体与AI

搜索 Intel, TSMC, NVIDIA, AMD, Samsung foundry, EUV, 先进封装, AI芯片 相关行业新闻，总结 top 5 要点。

---

## 板块2 - 📈 半导体股票

搜索 INTC, TSM, NVDA, AMD, ASML, MU, AVGO, QCOM, TSLA, SMH 的最新收盘价和涨跌幅。

**样式规则：**
- 涨幅 > 0 用绿色标签：`background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.3)`
- 跌幅 < 0 用红色标签：`background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3)`
- 标签字体：`font-family:'SF Mono',monospace; font-weight:600; font-size:0.82em; padding:3px 10px; border-radius:5px`

**K线图：** 底部嵌入6个 TradingView symbol-overview widget，HTML结构如下：

```html
<!-- K线图区域 -->
<div style="margin-top:24px">
  <h3 style="color:#f0a040;margin-bottom:12px">📊 K线图</h3>
  <div class="kline-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px">

    <!-- 每个图的容器，包含标题标签 -->
    <div class="kline-item">
      <div class="kline-label">INTC — Intel</div>
      <div class="tradingview-widget-container">...</div>
    </div>

    <!-- 依此类推，股票代码与公司名对应关系：
         NASDAQ:INTC  → INTC — Intel
         NASDAQ:NVDA  → NVDA — NVIDIA
         NASDAQ:TSLA  → TSLA — Tesla
         NASDAQ:SMH   → NASDAQ:SMH — Semiconductor ETF
         AMEX:SPY       → SPY — S&P 500
         SSE:000001   → 000001 — 上证指数
    -->

  </div>
</div>

<style>
.kline-label {
  font-family: 'SF Mono', monospace;
  font-size: 0.8em;
  font-weight: 600;
  color: #f0a040;
  text-align: center;
  margin-bottom: 4px;
  letter-spacing: 0.03em;
}
@media (max-width: 768px) {
  .kline-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
```

TradingView widget 配置：
- Symbols: `NASDAQ:INTC`, `NASDAQ:NVDA`, `NASDAQ:TSLA`, `NASDAQ:SMH`, `AMEX:SPY`, `SSE:000001`
- chartType: candlesticks
- colorTheme: dark
- backgroundColor: rgba(20,20,30,1)
- dateRanges: ["1w|1D", "1m|1D", "3m|1W"]
- height: 180, chartOnly: true, locale: zh_CN

**价格格式化：** 股价统一保留2位小数（如 `$23.45`），避免过长小数。

---

## 板块3 - ⚽ FC Barcelona

搜索巴萨最近24小时新闻：比赛结果（比分、进球者）、转会传闻、伤病更新、La Liga 排名、欧冠进展。

---

## 板块4 - ⚽🏀 体育赛事（World Cup & NBA）

搜索以下关键词的最新新闻：FIFA World Cup 2026、World Cup qualifiers、NBA playoffs 2026、NBA standings、NBA trade rumors。
新闻来源优先参考：ESPN、BBC Sport、The Athletic、NBA.com。
每条新闻输出：标题、来源、简要摘要（1-2句）。HTML 卡片用 🏟️ 图标，颜色用绿色系，标题色 `#4CAF50`，边框 `1px solid rgba(76,175,80,0.3)`，背景 `rgba(76,175,80,0.05)`。

---

## 板块5 - 🌲 Portland 本地

搜索 Portland Oregon 今日新闻和天气。包括：天气预报、重大本地新闻、交通更新、社区活动。

---

## 板块6 - 🤖 AI 工具/产品动态

搜索最新 AI 工具发布、产品重大更新、行业动态。关注：OpenAI, Google, Anthropic, 开源模型, 新应用。

---

## 海报区域（嵌入HTML顶部）

在研报 HTML 的 `<body>` 最顶部，于正文内容之前，嵌入以下海报区域。海报用 HTML 实现（非图片），包含四个色块，支持中英文双语切换。

```html
<!-- 海报区域 -->
<div id="poster" style="max-width:900px;margin:0 auto 32px;font-family:-apple-system,'Helvetica Neue','PingFang SC',sans-serif">

  <!-- 语言切换按钮 -->
  <div style="text-align:right;margin-bottom:8px">
    <button onclick="switchLang('zh')" id="btn-zh" style="background:#333;color:#fff;border:1px solid #555;padding:4px 12px;border-radius:4px;cursor:pointer;margin-right:6px;font-size:0.85em">中文</button>
    <button onclick="switchLang('en')" id="btn-en" style="background:#222;color:#aaa;border:1px solid #444;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:0.85em">EN</button>
  </div>

  <!-- 四个色块网格 -->
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">

    <!-- 板块1：半导体与AI — TSMC红 #d92d20 -->
    <div style="background:#d92d20;border-radius:12px;padding:20px 24px;color:#fff">
      <div style="font-size:2em;margin-bottom:8px">🔬</div>
      <div class="zh" style="font-size:1.4em;font-weight:700;line-height:1.2">半导体与AI</div>
      <div class="en" style="display:none;font-size:1.1em;font-weight:600;opacity:0.9;margin-top:4px">Semiconductors & AI</div>
      <div class="zh poster-data" style="margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：插入top2要点，每点一行 --></div>
      <div class="en poster-data" style="display:none;margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：英文top2要点 --></div>
    </div>

    <!-- 板块2：巴萨 — 巴萨蓝 #004D98 + 红 #A50044 -->
    <div style="background:linear-gradient(135deg,#004D98 60%,#A50044 100%);border-radius:12px;padding:20px 24px;color:#fff">
      <div style="font-size:2em;margin-bottom:8px">⚽</div>
      <div class="zh" style="font-size:1.4em;font-weight:700;line-height:1.2">FC Barcelona</div>
      <div class="en" style="display:none;font-size:1.1em;font-weight:600;opacity:0.9;margin-top:4px">FC Barcelona</div>
      <div class="zh poster-data" style="margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：最新比赛结果或排名 --></div>
      <div class="en poster-data" style="display:none;margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：英文巴萨动态 --></div>
    </div>

    <!-- 板块3：体育赛事 — NBA橙 #e08c0b -->
    <div style="background:#e08c0b;border-radius:12px;padding:20px 24px;color:#fff">
      <div style="font-size:2em;margin-bottom:8px">🏀</div>
      <div class="zh" style="font-size:1.4em;font-weight:700;line-height:1.2">体育赛事</div>
      <div class="en" style="display:none;font-size:1.1em;font-weight:600;opacity:0.9;margin-top:4px">Sports Events</div>
      <div class="zh poster-data" style="margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：World Cup + NBA top动态 --></div>
      <div class="en poster-data" style="display:none;margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：英文体育动态 --></div>
    </div>

    <!-- 板块4：AI动态 — AI绿 #10a37f -->
    <div style="background:#10a37f;border-radius:12px;padding:20px 24px;color:#fff">
      <div style="font-size:2em;margin-bottom:8px">🤖</div>
      <div class="zh" style="font-size:1.4em;font-weight:700;line-height:1.2">AI 动态</div>
      <div class="en" style="display:none;font-size:1.1em;font-weight:600;opacity:0.9;margin-top:4px">AI Updates</div>
      <div class="zh poster-data" style="margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：最新AI产品/工具 --></div>
      <div class="en poster-data" style="display:none;margin-top:10px;font-size:0.9em;opacity:0.9;line-height:1.6"><!-- AI生成：英文AI动态 --></div>
    </div>

  </div>
</div>

<script>
function switchLang(lang) {
  document.querySelectorAll('.zh').forEach(el => el.style.display = lang === 'zh' ? '' : 'none');
  document.querySelectorAll('.en').forEach(el => el.style.display = lang === 'en' ? '' : 'none');
  document.getElementById('btn-zh').style.background = lang === 'zh' ? '#555' : '#333';
  document.getElementById('btn-zh').style.color = lang === 'zh' ? '#fff' : '#aaa';
  document.getElementById('btn-en').style.background = lang === 'en' ? '#555' : '#222';
  document.getElementById('btn-en').style.color = lang === 'en' ? '#fff' : '#aaa';
}
</script>
```

**AI 生成时，将各色块 `poster-data` 注释替换为实际内容：**
- 半导体与AI色块：2条最重要新闻要点（中英各版本）
- 巴萨色块：最新比分或联赛排名（中英各版本）
- 体育赛事色块：NBA + World Cup 各1条要点（中英各版本）
- AI动态色块：最重要的1-2个AI产品/工具更新（中英各版本）

---

## HTML 报告格式

**整体风格：**
- 深色主题：body background `#0f0f0f`, 卡片 background `#1a1a1a`, border `1px solid #2a2a2a`, border-radius `12px`
- 标题颜色：`#f0a040`
- 正文颜色：`#ccc`，加粗用 `#fff`
- 字体：`-apple-system, 'Helvetica Neue', 'PingFang SC', sans-serif`
- 最大宽度：`900px`，居中

**文件名：** `report-YYYY-MM-DD.html`（使用当天日期）

**页脚：** 包含 `<a href="index.html">All Reports</a>` 链接

---

## 发布流程

### Step 1: 推送报告
```
PUT https://api.github.com/repos/Timememo8210/sky-portal/contents/research/report-{日期}.html
Authorization: token {GITHUB_PAT}
```
- 如果文件已存在，先 GET 获取 sha，PUT 时带上 sha
- content 用 base64 编码

### Step 2: 更新索引
```
GET https://api.github.com/repos/Timememo8210/sky-portal/contents/research/index.html
```
找到 `const REPORTS = [` 数组，检查今天日期是否已存在。如果不存在，在数组最后追加今天日期字符串 `'YYYY-MM-DD'`，然后 PUT 更新（带 sha）。

### Step 3: 输出摘要（供推送模块使用）

生成六板块摘要文本（供 prompt-push.md 使用），格式：
```
📡 每日研报 YYYY-MM-DD 要点摘要

🔬 半导体与AI:
• [要点1-3]

📈 股票:
[股票代码 价格 涨跌幅]

⚽ 巴萨: [最新比赛/排名信息]

🏟️ 体育赛事: [World Cup & NBA 最新动态]

🌲 Portland: [天气和本地新闻]

🤖 AI动态: [最新AI产品/工具动态]

📎 完整报告: https://timememo8210.github.io/sky-portal/research/report-YYYY-MM-DD.html
```

把研报完整内容以文字形式输出，最后附上 HTML 报告链接：
`https://timememo8210.github.io/sky-portal/research/report-{日期}.html`

---

## 变更记录
| 日期 | 变更 |
|------|------|
| 2026-04-06 | v1.0：从 prompt.md 分离，移除推送逻辑，新增海报生成模块 |
