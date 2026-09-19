# 📤 通用推送模块 (Push Module)
> 版本: v1.0 · 2026-04-06

---

## 说明

本模块负责将摘要内容推送到 Telegram 和 Discord。由上游任务（daily-news 或 hotmail-check）生成摘要后调用。

---

## Telegram 推送

```bash
curl -s -X POST "https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": {TELEGRAM_CHAT_ID}, "text": "摘要内容..."}'
```

- TELEGRAM_BOT_TOKEN: `8785913810:AAEDjecRQo-dEk3EaovKOCP2WgOWQkHz_cA`
- TELEGRAM_CHAT_ID: `8171251372`

如果摘要较长或包含特殊字符，改用 Python 发送：

```bash
python3 -c "
import urllib.request, json
msg = '''摘要内容替换这里'''
data = json.dumps({'chat_id': 8171251372, 'text': msg}).encode()
req = urllib.request.Request('https://api.telegram.org/bot8785913810:AAEDjecRQo-dEk3EaovKOCP2WgOWQkHz_cA/sendMessage', data=data, headers={'Content-Type': 'application/json'})
urllib.request.urlopen(req)
print('Telegram OK')
"
```

---

## Discord 推送

```bash
python3 -c "
import urllib.request, json
msg = '''摘要内容替换这里'''
data = json.dumps({'username': 'Sky Daily Research', 'content': msg}).encode()
req = urllib.request.Request('https://discord.com/api/webhooks/1490435450328977580/maeoZtY9QKIrv-qPKympcmasAWiVrinsJghmVhlTv-73jhyT1ULu42IAIOohfDmTJwvq', data=data, headers={'Content-Type': 'application/json'})
urllib.request.urlopen(req)
print('Discord OK')
"
```

- DISCORD_WEBHOOK_URL: `https://discord.com/api/webhooks/1490435450328977580/maeoZtY9QKIrv-qPKympcmasAWiVrinsJghmVhlTv-73jhyT1ULu42IAIOohfDmTJwvq`

---

## 摘要格式参考

### 研报摘要格式
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

### Hotmail 摘要格式
```
📬 Hotmail 每日摘要 · YYYY年M月D日

[如有重要邮件，每封一段：]
【发件方】标题
时间：HH:MM
内容：简短说明

[如无重要邮件：]
今天没有需要特别关注的邮件 ✅

⚠️ 需要注意或操作：
• [操作事项列表，如无则写"暂无"]
```

---

## 执行后确认

推送完成后，输出：
- Telegram: ✅ 推送成功 / ❌ 推送失败（附错误信息）
- Discord: ✅ 推送成功 / ❌ 推送失败（附错误信息）
