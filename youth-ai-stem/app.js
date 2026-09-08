'use strict';
const COPY = {
  zh: {
    title: '青少年 AI 与基础 STEM：家庭比较表', eyebrow: '10–13 岁 · 波特兰周边 + 在线学习',
    lede: '先看孩子想学什么，再比较课程内容、费用与投入。这里整理 16 个代表性项目，并非全网穷尽清单，也不是质量排名。',
    reviewed: '资料核对日期', date: '2026 年 9 月 8 日', currency: '美元 USD · 已列出的课程时间均为太平洋时间',
    principle: '<strong>选择依据，不只看名气。</strong> 入选是因为年龄或能力匹配、学习内容有实质性、且有官网可核对；名校毕业的教师，不等于大学官方课程。',
    nav: ['AI 与编程', '数学与科学', '为什么选这些', '今天的讨论', '来源与限制'],
    aiTitle: 'AI 与编程', stemTitle: '数学、科学与工程', count: '8 个项目',
    aiIntro: '从免费 AI 素养材料到需要固定投入的实时课程；它们解决的学习需求不同。',
    stemIntro: '包括本地学习、在线课程、团队活动与观察名单；不能报名的项目明确标注。',
    columns: ['项目 / 官方链接', '年龄、年级与基础', '学什么', '形式与地点', '学习时间 / 日期', '价格 USD', '报名状态 / 待确认', '机构背景', '为什么考虑 / 局限'],
    official: '官网与详情 ↗', caveat: '需要注意', captionAI: '01 / AI 与编程机会比较', captionStem: '02 / 数学、科学与工程机会比较',
    scroll: '桌面端可横向滚动查看全部字段；手机端按项目展开。',
    costNote: '费用口径不同：每门课、每月、每季和每队不能直接横比。直播课时不含课外练习；促销、名额与最终费用以机构确认及结账页面为准。',
    whyTitle: '为什么把这些项目列进来？', whyIntro: '这次扩大了范围，让家庭自己做选择。入选理由与官网能证明的事实分开呈现；没有足够的独立、同条件学习效果数据，不能说某家一定比另一家教得好。',
    reasons: [
      ['匹配学习目标', 'AI 素养、Python 编程、进阶数学和动手科学不是同一件事。先选目标，再用年龄、先修要求与每周可投入时间筛选。'],
      ['核实“背书”的性质', 'MIT 开发的教材、基金会与研究机构合作开发的资源，属于可核实的机构参与；私人公司的教师学历或宣传语不能等同于大学主办、认证或效果保证。'],
      ['看清付费买到什么', '免费资源通常需要成人带领；付费课程可能提供实时反馈、固定节奏和同伴合作。是否值得，应比较具体班型、教师反馈和孩子的体验，而不是只比品牌。']
    ],
    chooseTitle: '按学习需求做第一轮筛选', chooseHeads: ['如果想要…', '可以先看…', '决定前核对…'],
    choices: [
      ['先理解 AI 是什么', 'Day of AI、Experience AI、Code.org AI 材料', '是否有成人带领；活动是否匹配实际年龄；能否解释数据、偏差与模型局限。'],
      ['真正开始写代码', 'Create & Learn Python for AI、CodeWizardsHQ；短期项目另比较 Inspirit 与 Veritas', '先修能力、独立完成作品的程度、反馈方式、班额与退费规则。'],
      ['加强数学推理', 'Number Garden；已有预代数基础再看 AoPS', '是兴趣探索、基础补强还是竞赛拓展；不要仅凭年级决定难度。'],
      ['动手实验与团队项目', 'AoPS Physics、FLL 团队；OMSI / Science Olympiad 按开放与资格情况考虑', '器材费、家长与教练投入、通勤、组队方式，以及本州/学校资格。']
    ],
    learnerNote: '对约 13 岁的学习者：数学与物理可以作为基础主线，AI 可先小规模试学；有音乐兴趣时，声学主题可能增加投入感。对约 10 岁的学习者：可先尝试年龄匹配的 AI 活动、Scratch、数学圈或机器人；是否开始 Python 要看实际基础，不只看年龄。这些是建议，不是对孩子能力的判断。',
    summaryTitle: '今天这几次讨论的摘要', summaryItems: [
      ['从机会寻找开始', '寻找适合约 10–13 岁孩子的 AI 教育，以及基础科学和数学学习机会；范围覆盖波特兰周边与可在家参与的在线项目。'],
      ['要求解释选择依据', '不能只给少数推荐：需要扩大候选范围，比较学习内容、费用、时间、年龄和前置要求，并解释机构背书与入选理由。'],
      ['整理为家庭共同决策页', '把今天相关内容交接到 MacBook Pro 的 Codex，整理成中英文页面，让家人从相同信息出发比较。本页只新增子路径，不包含其他聊天历史。']
    ],
    sourcesTitle: '来源、核对口径与未确定事项', sourceNotes: [
      '每一行都附主办方或机构官网链接。价格、日期、资格与课程描述依据官网；“为什么考虑”属于编辑判断，不是机构承诺。',
      'AoPS 的学校认证与上课方式可另见 <a href="https://artofproblemsolving.com/school/how-school-works" target="_blank" rel="noopener noreferrer">AoPS Online School 官方说明</a>；认证不保证个人成绩或大学学分。',
      '固定日期与报价是 2026 年 9 月 8 日的资料快照，不代表持续有位；未公布或未核实的信息直接标注，不用过期价格填空。',
      'OMSI 的下一季、部分本地活动和有资格限制的团队项目属于观察或询问名单，不是已经确认开放的个人课程。',
      '这是代表性比较，不是对市场的穷尽调查。没有付费排名、机构效果保证，也没有代办注册、付款或报名。',
      '只总结今天与 AI / 基础 STEM 选课有关的讨论；不公开孩子的学校、联系方式或无关聊天。此页可通过链接公开访问；noindex 不是访问权限保护。'
    ],
    footer: 'TimeMemo · 家庭学习资料 · 2026-09-08', top: '回到比较表 ↑'
  },
  en: {
    title: 'Youth AI & foundational STEM: a family comparison', eyebrow: 'Ages 10–13 · Portland metro + online learning',
    lede: 'Start with the learning goal, then compare content, cost and commitment. These 16 representative options are not an exhaustive market survey or a quality ranking.',
    reviewed: 'Research checked', date: 'September 8, 2026', currency: 'Prices in USD · Listed class times are Pacific Time',
    principle: '<strong>Selection reasons, not just prestige.</strong> Options were included for age or readiness fit, substantive learning and checkable official information. An instructor’s university degree does not make a course university-run.',
    nav: ['AI & coding', 'Math & science', 'Why these options', 'Today’s discussion', 'Sources & limits'],
    aiTitle: 'AI & coding', stemTitle: 'Mathematics, science & engineering', count: '8 options',
    aiIntro: 'From free AI-literacy materials to scheduled live courses: these formats meet different learning needs.',
    stemIntro: 'Local learning, online courses, team activities and watchlist entries; unconfirmed enrollment is explicitly labeled.',
    columns: ['Program / official link', 'Age, grade & readiness', 'What students learn', 'Format & location', 'Time commitment / dates', 'Price USD', 'Enrollment / to confirm', 'Institutional background', 'Why consider / limitations'],
    official: 'Official details ↗', caveat: 'Important limitation', captionAI: '01 / AI & coding comparison', captionStem: '02 / Mathematics, science & engineering comparison',
    scroll: 'Scroll horizontally on desktop for all fields; on phones, each program appears as a labeled card.',
    costNote: 'Per-course, monthly, seasonal and per-team fees are not directly comparable. Live hours exclude independent practice. Promotions, places and final charges must be confirmed with the provider and at checkout.',
    whyTitle: 'Why are these options included?', whyIntro: 'The search was broadened so the family can choose. Selection judgments are separated from facts supported by official sources. There is not enough independent, like-for-like outcome evidence here to claim one provider necessarily teaches better than another.',
    reasons: [
      ['Match the learning goal', 'AI literacy, Python programming, advanced mathematics and hands-on science are different goals. Choose the goal first, then use age, prerequisites and available weekly time to narrow the options.'],
      ['Identify what “backing” means', 'MIT-developed materials and resources jointly developed by a foundation and research organization represent verifiable institutional involvement. A private company’s instructor credentials or marketing do not establish university sponsorship, accreditation or guaranteed outcomes.'],
      ['Identify what the fee buys', 'Free resources often need adult facilitation. Paid classes may add live feedback, structure and peer collaboration. Compare the actual class format, feedback and the child’s experience—not the brand alone.']
    ],
    chooseTitle: 'A first shortlist by learning goal', chooseHeads: ['If the goal is…', 'Start by comparing…', 'Check before choosing…'],
    choices: [
      ['Understand what AI is', 'Day of AI, Experience AI and Code.org AI materials', 'Adult facilitation, age fit, and whether the learner can explain data, bias and model limitations.'],
      ['Begin writing real code', 'Create & Learn Python for AI and CodeWizardsHQ; compare Inspirit and Veritas for shorter projects', 'Prerequisites, independent ownership of the work, feedback, class size and refund terms.'],
      ['Strengthen mathematical reasoning', 'Number Garden; AoPS when prealgebra readiness is established', 'Exploration versus remediation versus contest enrichment. Grade alone does not determine appropriate difficulty.'],
      ['Do experiments and team projects', 'AoPS Physics and FLL teams; OMSI / Science Olympiad subject to availability and eligibility', 'Equipment costs, adult and coach commitment, travel, team formation and state/school eligibility.']
    ],
    learnerNote: 'For a learner around 13: mathematics and physics can be a foundation, with a small AI trial alongside; an interest in music may make acoustics especially engaging. For a learner around 10: try age-matched AI activities, Scratch, a math circle or robotics; readiness for Python depends on experience, not age alone. These are suggestions, not assessments of either child’s ability.',
    summaryTitle: 'Summary of today’s relevant discussion', summaryItems: [
      ['Start with learning opportunities', 'Find AI education and foundational science and mathematics opportunities for children around 10–13, including Portland-metro options and online programs accessible from home.'],
      ['Explain the selection process', 'Do not provide only a small shortlist: broaden the options, compare content, price, time, age and prerequisites, and explain both institutional backing and reasons for inclusion.'],
      ['Support a shared family decision', 'Hand today’s relevant material to Codex on the MacBook Pro and organize it into a Chinese/English page so family members can compare the same information. This is a new child path and does not include other conversation history.']
    ],
    sourcesTitle: 'Sources, verification scope & open questions', sourceNotes: [
      'Every row links to the organizer or provider. Prices, dates, eligibility and curriculum descriptions rely on official information; “why consider” is editorial judgment, not a provider promise.',
      'For school accreditation and delivery, see the <a href="https://artofproblemsolving.com/school/how-school-works" target="_blank" rel="noopener noreferrer">official AoPS Online School explanation</a>; accreditation guarantees neither individual outcomes nor university credit.',
      'Specific dates and prices are a September 8, 2026 research snapshot, not a promise of continuing availability. Unpublished or unverified details are labeled rather than filled with old prices.',
      'The next OMSI season, some local events and eligibility-restricted team activities are watchlist or inquiry options—not confirmed, open individual courses.',
      'This is a representative comparison, not an exhaustive market survey. It provides no paid ranking, guaranteed learning outcome, enrollment, payment or registration service.',
      'Only today’s AI / foundational STEM selection discussion is summarized. Children’s schools, contact details and unrelated chats are excluded. This page is publicly accessible by link; noindex is not access control.'
    ],
    footer: 'TimeMemo · Family learning notes · 2026-09-08', top: 'Back to comparison ↑'
  }
};
let language = 'zh';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const localized = value => typeof value === 'object' && value !== null ? value[language] ?? '' : value ?? '';
function table(category, offset, t) {
  const rows = window.PROGRAMS.filter(p => p.category === category);
  const heading = category === 'ai' ? t.captionAI : t.captionStem;
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="${escapeHTML(heading)}"><table class="program-table"><caption>${escapeHTML(heading)}</caption><thead><tr>${t.columns.map(h => `<th scope="col">${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((p, i) => {
    const values = [p.fit, p.content, p.format, p.time, p.price, p.status, p.backing];
    const url = /^https:\/\//.test(p.link) ? p.link : '#';
    const cells = values.map((v, j) => `<td data-label="${escapeHTML(t.columns[j + 1])}"${j === 4 ? ' class="price"' : j === 5 ? ' class="status"' : ''}>${escapeHTML(localized(v))}</td>`).join('');
    return `<tr><th scope="row"><span class="program-number">${String(i + offset + 1).padStart(2, '0')}</span>${escapeHTML(localized(p.name))}<a class="program-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t.official)}</a></th>${cells}<td data-label="${escapeHTML(t.columns[8])}">${escapeHTML(localized(p.why))}<span class="backing-label">${escapeHTML(t.caveat)}</span>${escapeHTML(localized(p.caveat))}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function render() {
  const t = COPY[language];
  document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
  document.title = `${t.title} · TimeMemo`;
  document.querySelector('#lang-zh').setAttribute('aria-pressed', String(language === 'zh'));
  document.querySelector('#lang-en').setAttribute('aria-pressed', String(language === 'en'));
  const ids = ['comparison','stem','why','discussion','sources'];
  document.querySelector('#content').innerHTML = `
    <section class="intro"><div><p class="eyebrow">${t.eyebrow}</p><h1>${t.title}</h1><p class="lede">${t.lede}</p></div><p class="edition">${t.reviewed}<strong>${t.date}</strong></p></section>
    <p class="principle">${t.principle}</p>
    <nav class="section-nav" aria-label="${language === 'zh' ? '页面章节' : 'Page sections'}">${t.nav.map((n,i) => `<a href="#${ids[i]}">${n}</a>`).join('')}</nav>
    <section class="table-section" id="comparison"><div class="section-heading"><h2><span class="section-number">01</span>${t.aiTitle} <span class="count">/ ${t.count}</span></h2><p>${t.aiIntro}</p></div><p class="note">${t.currency}</p><p class="instruction">${t.scroll}</p>${table('ai', 0, t)}</section>
    <section class="table-section stem" id="stem"><div class="section-heading"><h2><span class="section-number">02</span>${t.stemTitle} <span class="count">/ ${t.count}</span></h2><p>${t.stemIntro}</p></div>${table('stem', 8, t)}<p class="note">${t.costNote}</p></section>
    <section class="reading-section" id="why"><h2>${t.whyTitle}</h2><p>${t.whyIntro}</p><div class="decision-grid">${t.reasons.map(([h,p]) => `<article class="decision-card"><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section>
    <section class="reading-section"><h2>${t.chooseTitle}</h2><div class="choice-wrap"><table class="choice-table"><thead><tr>${t.chooseHeads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${t.choices.map(([a,b,c])=>`<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div><p>${t.learnerNote}</p></section>
    <section class="reading-section" id="discussion"><h2>${t.summaryTitle}</h2><ol class="summary-list">${t.summaryItems.map(([h,p])=>`<li><strong>${h}</strong><p>${p}</p></li>`).join('')}</ol></section>
    <section class="reading-section source-box" id="sources"><h2>${t.sourcesTitle}</h2><ul>${t.sourceNotes.map(n=>`<li>${n}</li>`).join('')}</ul></section>
    <footer class="page-footer"><p>${t.footer}</p><a href="#comparison">${t.top}</a></footer>`;
}
document.querySelector('#lang-zh').addEventListener('click', () => { language = 'zh'; render(); });
document.querySelector('#lang-en').addEventListener('click', () => { language = 'en'; render(); });
render();
