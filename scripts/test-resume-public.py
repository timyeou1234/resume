#!/usr/bin/env python3
"""Check content/route boundaries shared by public resume outputs."""
import hashlib
import importlib.util
import json
import sys
sys.dont_write_bytecode = True
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('renderer', ROOT / 'scripts/render-resume.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
data = json.loads(renderer.SOURCE.read_text())

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.nodes, self.text = [], []
        self.feed(text)
    def handle_starttag(self, tag, attrs): self.nodes.append((tag, dict(attrs)))
    def handle_data(self, text): self.text.append(text)

assert len(data['projects']) == 2
assert [r['dates'] for r in data['experience'][:4]] == ['Sep 2024 – Jul 2026', 'Jun 2024 – Aug 2024', 'Oct 2020 – Apr 2024', 'Apr 2019 – Aug 2020']
assert [r['name'] for r in data['experience'][:3]] == ['Crypto.com', 'San Orange Technology', 'OpenNet']
for lang, route in [('zh', 'resume'), ('en', 'en/resume')]:
    text = (ROOT / '.portfolio-dist' / route / 'index.html').read_text()
    page = Page(text)
    ids = [a['id'] for _, a in page.nodes if 'id' in a]
    assert len(ids) == len(set(ids))
    headings = [a['id'] for tag, a in page.nodes if tag == 'h2']
    assert headings == ['summary', 'experience', 'skills', 'projects', 'workflow', 'education']
    md = renderer.markdown(data, lang)
    assert md.index('## ' + renderer.label('experience', lang)) < md.index('## ' + renderer.label('skills', lang))
    for _, a in page.nodes:
        if 'href' not in a: continue
        target = urlsplit(a['href'])
        if target.scheme or target.netloc: continue
        if not target.path:
            assert target.fragment in ids
        else:
            local = ROOT / '.portfolio-dist' / target.path.lstrip('/')
            assert local.is_file() or (local / 'index.html').is_file(), a['href']
    for _, _, block in renderer.sections(data, lang):
        values = block if isinstance(block, (list, tuple)) else [block]
        for value in values:
            assert value in ''.join(page.text), value
            assert value in md, value
    assert f'content="{hashlib.sha256(renderer.SOURCE.read_bytes()).hexdigest()}"' in text
    assert f'href="https://timyeou.com/{route}/"' in text
    assert len(md.split('## '+renderer.label('experience',lang))[0].split()) < 100
    assert 'React Native/Expo' not in text
print('Resume: shared content, 2 languages, section order, 2 projects, dates, provenance and all local links passed')
