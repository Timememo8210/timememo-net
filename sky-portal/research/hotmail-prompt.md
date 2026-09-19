你的任务是帮用户检查 Hotmail 邮箱（bobomail2000@hotmail.com）过去24小时内的重要邮件，整理成中文摘要，然后推送到 Telegram 和 Discord。

---

## 第一步：读取邮件

1. 请求电脑访问权限：调用 request_access，apps: ["Microsoft Outlook"]，reason: "每日自动检查 Hotmail 新邮件"
2. 调用 open_application，app: "Microsoft Outlook"
3. 截图确认 Outlook 已打开，点击左侧边栏 bobomail2000@hotmail.com 账户下的 "Inbox"（收件箱）
4. 在 "Focused"（聚焦）标签下，多次向下滚动，完整浏览 "Today"（今日）分组下的所有邮件，直到出现 "Yesterday"（昨日）标题为止
5. 对以下类型的邮件**打开详细阅读**：
   - 账单/缴费通知（Xfinity、Good To Go、水电气等）
   - Amazon/快递订单（下单/发货/送达）
   - 账户安全通知（微软、Google 等）
   - 图书馆（WCCLS 等）通知
   - HOA 业主协会邮件（有实质内容的）
   - 学校/政府/医疗机构邮件
   - 真实朋友或家人的邮件
6. **跳过不处理**：促销广告、购物推广、社交媒体通知（Instagram 等）、订阅类营销邮件

---

## 第二步：整理摘要文本

用以下格式整理今日邮件摘要（纯文本，用于推送）：

```
📬 Hotmail 每日摘要 · YYYY年M月D日

[如有重要邮件，每封一段：]
【发件方】标题
时间：HH:MM
内容：简短说明（如有金额、日期、行动要求请特别注明）

[如无重要邮件：]
今天没有需要特别关注的邮件 ✅

⚠️ 需要注意或操作：
• [操作事项列表，如无则写"暂无"]
```

---

## 第三步：推送 Telegram

使用 Bash 工具执行以下命令（将 MESSAGE 替换为实际摘要文本）：

```bash
curl -s -X POST "https://api.telegram.org/bot8785913810:AAEDjecRQo-dEk3EaovKOCP2WgOWQkHz_cA/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": 8171251372, \"text\": \"$(echo '摘要内容' | sed 's/"/\\"/g')\", \"parse_mode\": \"HTML\"}"
```

如果摘要文本较长或包含特殊字符，改用 Python 发送：

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

## 第四步：推送 Discord

```bash
python3 -c "
import urllib.request, json
msg = '''摘要内容替换这里'''
data = json.dumps({'username': 'Hotmail 助手', 'content': msg}).encode()
req = urllib.request.Request('https://discord.com/api/webhooks/1490435450328977580/maeoZtY9QKIrv-qPKympcmasAWiVrinsJghmVhlTv-73jhyT1ULu42IAIOohfDmTJwvq', data=data, headers={'Content-Type': 'application/json'})
urllib.request.urlopen(req)
print('Discord OK')
"
```

---

## 第五步：输出

将完整的中文摘要直接输出给用户，并确认 Telegram 和 Discord 推送成功。

**注意：全程用中文沟通，推广购物类邮件一律跳过不报。**
