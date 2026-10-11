"""One-time, deterministic import of selected public learning briefs.

Run with --session PATH. Never exports user messages, tool output, or metadata.
Existing archives are not overwritten. Future editions append to library.json.
"""
import argparse
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
CHANNELS = {
    'JS': 'Jeff Su', 'TH': 'Tina Huang', 'MW': 'Matt Wolfe',
    'DE': 'Dave Ebbelaar', 'AE': 'AI Explained', 'AK': 'Andrej Karpathy',
    'GC': 'Google Cloud Tech',
}
# Date | channels | topic | reading | title | action. Order follows the source.
SPECS = '''
08-27|JS,TH,MW,DE,AE,AK,GC|知识管理与学习|摘要|七个频道怎么选：入门、更新与系统学习|选一个常做的工作，写清目标、背景和输出要求。
08-28|AE|核验与安全|摘要|Agent 失控事件：区分事故与 AGI 推论|给自动化列出只读、预览和执行三层权限。
08-28|MW|工作流与自动化|摘要|定时任务：让重复研究持续积累|把一个重复的信息收集任务写成固定任务说明。
08-28|GC|提示与写作|完整|把复杂指令拆成可复用的小模块|分别写出提取事实、核对来源和提出建议三个步骤。
08-29|TH|知识管理与学习|摘要|用记录寻找专注规律|连续七天记录任务、开始时间、完成情况和精力。
08-29|GC|核验与安全|完整|漂亮成品仍需检查事实与功能|检查一个 AI 成品里的事实、按钮和公开信息。
08-30|AK|基础概念|片段|模型记忆、工具查询与你提供的资料|追问一个重要答案究竟依据什么资料。
08-31|DE|工作流与自动化|片段|先画清工作流程，再决定哪里使用 AI|写下触发条件、固定步骤、判断步骤和人工检查。
09-01|GC|知识管理与学习|片段|组织背景：AI 也需要一份工作说明|给一个重复工作补上负责人、资料来源和冲突处理规则。
09-02|TH|知识管理与学习|片段|闭卷回想，让知识真正留下来|不翻笔记，用三句话解释刚学到的方法，再核对遗漏。
09-04|MW,AE|产品更新|摘要|GPT-6 Astra：用真实任务衡量能力|用同一任务比较事实错误、遗漏、返工次数和总耗时。
09-04|GC|工作流与自动化|完整|Graph Engineering：并行、汇总与分流|画出一份周报从收集资料到人工确认的流程。
09-05|MW|多媒体与创作|摘要|语音输入：先说出原料，再整理成初稿|口述项目更新，再核对数字、姓名和日期。
09-06|AK|基础概念|片段|Token：AI 为什么不擅长逐字计数|把逐字核对任务交给可复查的计算或文本工具。
09-07|AK|基础概念|片段|锯齿状能力：按具体任务判断可靠性|用三个普通案例和两个边缘案例检查同一套指令。
09-08|MW|多媒体与创作|摘要|图片转 3D：从概念图到可检查的原型|用非敏感图片试做原型，检查形状和细节是否正确。
09-09|MW|产品更新|摘要|事件触发任务：消息也能成为工作起点|为一类消息写清触发条件、输出和允许执行的动作。
09-10|MW|核验与安全|摘要|AI 检测分数只是核查线索|先找原始文件与独立来源，再参考检测结果。
09-10|GC|工作流与自动化|摘要|RCTC：把角色、背景、任务与限制写清楚|为一页周报写清角色、资料、任务和不能猜测的内容。
09-11|AK|核验与安全|片段|LLM Council：让第二个 AI 专门挑错|把原始材料和草稿交给审稿对话，要求逐项引用证据。
09-12|MW|数据与分析|摘要|AI 分析表格：先检查字段与异常|先列字段、空值、重复值与清洗方法，再请求结论。
09-12|GC|提示与写作|片段|Few-shot：用一份合格范例教 AI|提供一个正确的输入输出样例，缺失项统一写待确认。
09-13|GC|基础概念|摘要|Temperature：变化程度与事实准确性|事实任务要求来源，创意任务要求不同角度的版本。
09-14|GC|知识管理与学习|摘要|混合搜索：既认关键词，也理解意思|分别用精确编号和自然语言搜索，检查原文位置。
09-14|AK|知识管理与学习|片段|音频导览：先建立框架，再回原文|听完导览记下三点，回到原文核对最重要的一点。
09-15|JS|提示与写作|完整|AI 简历：把真实成果说清楚|用问题、行动、结果和证据建立自己的成果账本。
09-15|GC|工作流与自动化|摘要|Agent Harness：资料、工具与检查共同起作用|把最近一次 AI 失误写成具体检查项，再测试相似任务。
09-16|AK|知识管理与学习|片段|让 AI 陪读长材料|先取阅读地图，再逐段追问并核对两个引用位置。
09-17|TH|知识管理与学习|摘要|AI 知识库：原始资料、摘要与修改记录分开|用三份公开文件建立原文、摘要和更新日志三个区域。
09-17|AE|核验与安全|摘要|AI 安全新闻：事实、预测与解释分开|把一则重大新闻分成已确认事实、预测和待补证据。
09-18|JS|提示与写作|片段|提示词六要素：只补会改变结果的信息|为常写的邮件注明真实背景、成功标准和不可承诺事项。
09-19|MW|知识管理与学习|摘要|Gemini Notebook：把资料变成练习|先做五道应用题，再针对错误回到原文。
09-19|MW|产品更新|摘要|Claude 文档与幻灯片：共享资料后还要核对|用同一份材料生成两种成品，再检查数字与结论是否一致。
09-20|GC|工作流与自动化|片段|Graph Engineering 中文图文精读|画五六个方框，标出检查点、批准和失败回退。
09-21|AK|基础概念|片段|预训练与后训练：知识模式和助理行为|分别评估一次回答的事实准确度与指令遵守度。
09-22|AK|数据与分析|片段|看图分析：先确认文字与数字读对了|先抄录，再核对单位、小数点和表头，最后分析。
09-23|MW|产品更新|摘要|模型分工：衡量任务总成本|用真实任务比较事实错误、遗漏和人工修改时间。
09-24|MW|产品更新|摘要|分批上线：宣布、开放与账号可用有区别|在自己的账号里完成一次核心操作，再调整工作流程。
09-24|AK|多媒体与创作|片段|把规则变成可点击的小工具|用虚构数据做检查清单，并跑完三个已知案例。
09-25|DE|知识管理与学习|摘要|公司知识库：谁负责、何时复核、依据在哪|给五份常用 SOP 补上负责人、复核日期和来源。
09-25|GC|多媒体与创作|摘要|语音转写：先提供专有名词表|用同一段录音，对比提供术语表前后的识别结果。
09-26|MW|多媒体与创作|摘要|Google Vids：生成片段后的质量检查|用非敏感场景检查人物、细节与延长后的连续性。
09-26|GC|基础概念|片段|RAG 与微调：更新事实与改变行为|先提供最新权威原文，测试答案是否明显改善。
09-27|GC|核验与安全|片段|Agent 评估：结果、过程、工具与上下文|用正常、缺资料、冲突等案例检查同一任务。
09-28|TH|基础概念|摘要|本地 AI：装得下与跑得快是两回事|先判断离线、资料本地保存和任务频率的实际需求。
09-29|JS|知识管理与学习|片段|文件归档：先写命名、分类与例外规则|只让 AI 提出移动清单，先核对再执行。
09-29|GC|核验与安全|摘要|误报与漏报：两种错误的代价不同|给一个筛查任务分别写出误报和漏报的后果。
09-30|JS|产品更新|摘要|Copilot 与组织资料：上下文不能修复错误权限|核查资料来源、访问权限与账号实际开放的功能。
10-01|GC|核验与安全|摘要|留出测试：调试题不能兼做验收题|留出三份新资料，定稿后再检查遗漏和编造。
10-02|AE|核验与安全|摘要|给 Agent 设定停止条件|写清资料不足、权限不足与关键操作前的停点。
10-03|MW|产品更新|摘要|Gemini 4：已宣布与已可用|先查看当前账号资格与实际入口，再考虑升级。
10-03|MW|产品更新|摘要|Sonnet 5.5：每次任务成本与订阅费有区别|用现有账号做一次小任务，记录人工修改所花时间。
10-04|JS|知识管理与学习|摘要|AI 对话索引：给工作成果留一个回去的入口|把私人对话链接、用途、决定和待确认事项放在成果旁。
10-05|JS|提示与写作|摘要|先检查汇报标题，再处理排版|只读每页标题，检查观点能否串起来且没有超出证据。
10-06|GC|多媒体与创作|摘要|互动培训原型：选择之后给出有依据的反馈|把一条公开规则变成一个问题、两个选择和对应反馈。
10-07|GC|数据与分析|摘要|数据粒度：一行代表什么|汇总前确认每行是订单、商品还是客户，检查重复计数。
10-08|GC|工作流与自动化|摘要|语音 Agent：聊天继续，判断仍需等待结果|要求区分已确认、处理中和无法确认三种状态。
10-09|GC|工作流与自动化|摘要|长期规则：区分团队要求、当前任务与个人偏好|给五条常用要求分类，指出重复与冲突后再精简。
10-10|MW|核验与安全|摘要|SynthID 开放检测：未检出不代表真实|用一张可公开的图片体验，并保留检测的原始结论。
'''.strip()

def clean(s):
    s = re.sub(r'<(?:heartbeat|oai-mem-citation)>[\s\S]*?</(?:heartbeat|oai-mem-citation)>', '', s)
    s = re.sub(r'[^]*', '', s)
    return s.strip()

def links(s):
    return [dict(label=m.group(1), url=m.group(2)) for m in re.finditer(r'(?<!!)\[([^\]]+)\]\((https?://[^\s)]+)\)', s)]

def video(link):
    return bool(re.match(r'https://(?:www\.)?(?:youtube\.com|youtu\.be)/', link['url']))

def plain(s):
    return re.sub(r'[*`#]', '', re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)).strip()

def import_archive(session):
    target = ROOT / 'data' / 'library.json'
    if target.exists():
        raise SystemExit('Archive already exists; do not overwrite. Append new editions to library.json.')
    issues = []
    for line in Path(session).open():
        if not line.endswith('\n'):
            continue
        x = json.loads(line); p = x.get('payload', {})
        if x.get('type') != 'response_item' or p.get('role') != 'assistant' or p.get('phase') != 'final_answer':
            continue
        date = x.get('timestamp', '')[:10]
        if not ('2026-08-27' <= date <= '2026-10-10'):
            continue
        text = clean('\n'.join(c.get('text', '') for c in p.get('content', []) if c.get('type') == 'output_text'))
        if len(text) < 250:
            continue
        is_deep = text.startswith('可以，已经整理好了')
        if date == '2026-08-27':
            # Archive the channel guide, not the scheduling conversation.
            text = text.split('图中第 7 项')[0].strip()
        ident = date + ('-graph-notes' if is_deep else '')
        title = 'Graph Engineering 101 · 中文图解' if is_deep else ('七个频道的学习路线' if date == '2026-08-27' else date + ' · AI 学习简报')
        issues.append(dict(id=ident,date=date,title=title,body=text,kind='专题精读' if is_deep else '历史简报'))
    by_date = {i['date']: i for i in issues if i['id'] == i['date']}
    grouped = {}
    for line in SPECS.splitlines():
        date, channels, topic, reading, title, action = line.split('|')
        grouped.setdefault('2026-' + date, []).append((channels,topic,reading,title,action))
    entries = []
    fallback = {
        '2026-08-27':'按入门、追踪更新和系统学习分配阅读时间，选择真正适合任务的材料。',
        '2026-08-28':['把安全测试事故与创作者的 AGI 推论分开，并保留关键操作的批准机制。','固定研究任务可以定期运行，并保留持续积累的上下文。','把资料收集、核验与内容生成拆成可复用步骤。'],
        '2026-08-29':['记录自己的工作规律比复制整套工具更有意义；标题中的倍数不是效果保证。','AI 成品需要分别验证事实、实际功能与公开范围。'],
        '2026-08-30':'语言模型记忆、实时工具查询和用户提供的资料，是不同的信息来源。',
        '2026-08-31':'规则明确的步骤先用固定流程完成，把需要理解和判断的部分交给 AI。',
        '2026-09-01':'可靠执行需要正确的组织背景、现行资料和明确的冲突处理规则。',
        '2026-09-02':'看完材料后亲自解释、闭卷回想并尝试一次，才能发现理解上的缺口。',
        '2026-09-20':'把复杂任务画成包含并行检查、汇总、条件分流和失败回退的流程图。',
        '2026-10-10':'独立检测入口已开放；没有检测到指定水印，不能证明内容真实。',
    }
    for date, specs in grouped.items():
        issue = by_date[date]; body = issue['body']
        if len(specs)>1:
            pattern = r'(?m)^(?:#{2,4} )?[1-3]\. (?=\S)'
            # These two early editions use plain numbered headings; later editions use Markdown headings.
            if date not in ('2026-08-28','2026-08-29'):
                pattern = r'(?m)^#{2,4} [1-3]\. (?=\S)'
            starts = [m.start() for m in re.finditer(pattern,body)]
            assert len(starts)==len(specs), (date, starts, len(specs))
            pieces=[body[a:b].strip() for a,b in zip(starts,starts[1:]+[len(body)])]
        else:
            pieces=[body]
        for n,(spec,piece) in enumerate(zip(specs,pieces),1):
            channels,topic,reading,title,action=spec
            found=re.search(r'一句话结论[：:]\s*(?:\*\*)?\s*(.+)',piece)
            summary=plain(found.group(1)) if found else fallback.get(date,'')
            if isinstance(summary,list): summary=summary[n-1]
            assert summary,(date,title)
            all_links=links(piece)
            videos=list({v['url']:v for v in all_links if video(v)}.values())
            # Omit explicitly rejected videos from the single-topic selection.
            rejects={'2026-09-20':'hbsce4HNL7o','2026-09-21':'JpfLID19QnQ'}
            if date in rejects: videos=[v for v in videos if rejects[date] not in v['url']]
            assert videos,(date,title)
            entries.append(dict(id=f'{date}-{n:02d}',date=date,channels=[CHANNELS[c] for c in channels.split(',')],topic=topic,reading=reading,title=title,takeaway=summary,action=action,body=piece,videoLinks=videos,sourceLinks=[v for v in all_links if not video(v)],issueId=issue['id'],archived=True))
    # Preserve the earlier requested Chinese teaching manuscript and its two screenshots.
    graph_issue=next(i for i in issues if i['id'].endswith('graph-notes'))
    base=Path.home()/'Codex_m5pro'
    notes=(base/'ai_brief/graph-engineering-101/Graph-Engineering-101-中文讲稿.md').read_text()
    graph_issue['body']=notes
    entries.append(dict(id='2026-09-04-graph-notes',date='2026-09-04',channels=['Google Cloud Tech'],topic='工作流与自动化',reading='图文精读',title='Graph Engineering 101 · 两张图与中文讲稿',takeaway='用节点、路线和检查点说明 AI、固定程序与人工审核怎样共同完成任务。',action='用五六个方框画出自己的一个重复工作，并标出失败后的返回路径。',body=notes,videoLinks=[{'label':'Graph Engineering 101','url':'https://www.youtube.com/watch?v=IrW0_f-w4kA'}],sourceLinks=[],issueId=graph_issue['id'],archived=True))
    assets=ROOT/'assets'; assets.mkdir(parents=True,exist_ok=True)
    locations=[base/'ai_brief/graph-engineering-101',base/'artifacts/graph-engineering-101']
    for folder in locations:
        for path in folder.glob('*.png'):
            shutil.copy2(path,assets/path.name)
            for obj in issues+entries:
                obj['body']=obj['body'].replace('<'+str(path)+'>','assets/'+path.name).replace(str(path),'assets/'+path.name)
                obj['body']=obj['body'].replace(']('+path.name+')','](assets/'+path.name+')')
    # Local manuscript links are represented by the archived teaching note itself.
    for obj in issues+entries:
        obj['body']=re.sub(r'\[([^\]]+)\]\((?:<)?/Users/[^)]+\)',r'\1（见本库中文图文精读）',obj['body'])
        assert '/Users/' not in obj['body']
    data=dict(schemaVersion=1,updatedAt='2026-10-11',lastCheckedAt='2026-10-10T14:57:19.536Z',schedule='每周二、周五 · 洛杉矶时间 08:00',channels=list(CHANNELS.values()),entries=entries,issues=issues)
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'entries':len(entries),'issues':len(issues),'dates':len(by_date),'first':min(by_date),'last':max(by_date)},ensure_ascii=False))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--session',required=True)
    import_archive(parser.parse_args().session)
