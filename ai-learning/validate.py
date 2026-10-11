"""Validate the public learning archive before every publication.

Run from any directory: python3 ai-learning/validate.py
Append new issues and entries to data/library.json; never export user messages,
tool output, credentials, or the raw conversation. Preserve historical bodies.
"""
import json
import re
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'data/library.json').read_text())
assert data['schemaVersion'] == 1
date.fromisoformat(data['updatedAt'])
datetime.fromisoformat(data['lastCheckedAt'].replace('Z', '+00:00'))
assert len(data['channels']) == len(set(data['channels'])) == 7
assert data['entries'] and data['issues']
issues = {i['id']: i for i in data['issues']}
assert len(issues) == len(data['issues']), 'Duplicate issue ID'
assert len({e['id'] for e in data['entries']}) == len(data['entries']), 'Duplicate entry ID'
for item in data['entries'] + data['issues']:
    date.fromisoformat(item['date'])
    assert re.fullmatch(r'[a-z0-9-]+', item['id']), item['id']
    assert item['title'].strip() and item['body'].strip()
    for image in re.findall(r'!\[[^\]]*\]\((assets/[^)]+)\)', item['body']):
        assert (ROOT / image).is_file(), image
for e in data['entries']:
    assert e['issueId'] in issues and e['date'] == issues[e['issueId']]['date'], e['id']
    assert e['channels'] and set(e['channels']) <= set(data['channels']), e['id']
    assert e['reading'] in {'摘要', '片段', '完整', '图文精读'}
    assert all(e[k].strip() for k in ['topic', 'takeaway', 'action'])
    assert isinstance(e['archived'], bool)
    assert e['videoLinks'], e['id']
    for v in e['videoLinks']:
        u = urlparse(v['url'])
        assert u.scheme == 'https' and u.hostname in {'youtube.com', 'www.youtube.com', 'youtu.be'}, v
        assert u.path in {'/watch', '/playlist'} or u.path.startswith('/shorts/') or u.hostname == 'youtu.be', v
    for s in e['sourceLinks']:
        assert urlparse(s['url']).scheme in {'http', 'https'}, s
assert set(issues) == {e['issueId'] for e in data['entries']}, 'Orphan issue'
raw = json.dumps(data, ensure_ascii=False)
for forbidden in ['/Users/', '/tmp/', '<heartbeat>', '<oai-mem-citation>', 'rollout_path', 'target_thread_id', 'xc288@']:
    assert forbidden not in raw, 'Private metadata: ' + forbidden
assert not re.search(r'[\ue200-\ue203]', raw), 'Unrendered source marker'
print(f"PASS: {len(data['entries'])} entries, {len(issues)} issues, {len(data['channels'])} channels; assets and public-data checks passed")
