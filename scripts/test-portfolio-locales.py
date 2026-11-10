#!/usr/bin/env python3
"""Check crawlable page content, locale routes, and links without running JavaScript."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

repo = Path(__file__).resolve().parents[1]
dist = repo / '.portfolio-dist'
void = {'meta', 'link', 'img', 'br', 'hr', 'input', 'source', 'wbr', 'area', 'base', 'embed', 'col', 'param', 'track'}

class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.nodes, self.stack = [], []
        self.feed(html)
        assert not self.stack, 'Unclosed HTML elements'
    def handle_starttag(self, tag, pairs):
        node = {'tag': tag, 'attrs': dict(pairs), 'text': ''}
        self.nodes.append(node)
        if tag not in void:
            self.stack.append(node)
    def handle_endtag(self, tag):
        assert self.stack and self.stack[-1]['tag'] == tag, f'Malformed HTML at {tag}'
        self.stack.pop()
    def handle_data(self, value):
        for node in self.stack:
            node['text'] += value
    def one(self, tag, **attrs):
        found = [n for n in self.nodes if n['tag'] == tag and all(n['attrs'].get(k) == v for k, v in attrs.items())]
        assert len(found) == 1, (tag, attrs, len(found))
        return found[0]

for lang, route in [('zh', '/'), ('en', '/en/')]:
    page = Document((dist / route.lstrip('/') / 'index.html').read_text())
    assert page.one('html')['attrs']['lang'] == ('zh-Hant' if lang == 'zh' else 'en')
    assert page.one('link', rel='canonical')['attrs']['href'] == 'https://timyeou.com' + route
    assert page.one('meta', property='og:url')['attrs']['content'] == 'https://timyeou.com' + route
    alternates = {n['attrs']['hreflang']: n['attrs']['href'] for n in page.nodes if n['tag'] == 'link' and n['attrs'].get('rel') == 'alternate'}
    assert alternates == {'zh-Hant': 'https://timyeou.com/', 'en': 'https://timyeou.com/en/', 'x-default': 'https://timyeou.com/'}
    phrase = 'App 開發' if lang == 'zh' else 'App development'
    for text in [page.one('title')['text'], page.one('h1')['text'], page.one('meta', name='description')['attrs']['content']]:
        assert phrase.lower() in text.lower(), text
    ids = [n['attrs']['id'] for n in page.nodes if 'id' in n['attrs']]
    assert len(ids) == len(set(ids))
    for node in page.nodes:
        attrs = node['attrs']
        if f'data-{lang}' in attrs:
            assert node['text'] == attrs[f'data-{lang}'], (lang, node)
        for target, key in [('aria-label', 'aria'), ('src', 'image'), ('href', 'href'), ('alt', 'alt'), ('content', 'content'), ('title', 'title'), ('poster', 'poster')]:
            if f'data-{key}-{lang}' in attrs:
                assert attrs[target] == attrs[f'data-{key}-{lang}'], (lang, target, node)
        for attribute in ['href', 'src', 'poster']:
            value = attrs.get(attribute, '')
            parsed = urlsplit(value)
            if not value or parsed.scheme or parsed.netloc:
                continue
            if parsed.path:
                assert parsed.path.startswith('/'), f'Asset would break on nested locale: {value}'
                local = dist / unquote(parsed.path.lstrip('/'))
                assert local.exists(), value
                if local.is_dir():
                    assert (local / 'index.html').exists()
            if parsed.fragment and not parsed.path:
                assert parsed.fragment in ids, value
    toggle = page.one('a', **{'class': 'lang-toggle'})['attrs']
    assert toggle['href'] == ('/en/' if lang == 'zh' else '/')
    assert len([n for n in page.nodes if 'data-product-showcase' in n['attrs']]) == 2
    assert len([n for n in page.nodes if 'data-scene' in n['attrs']]) == 7
    assert len([n for n in page.nodes if 'data-line-film' in n['attrs']]) == 1
    assert len([n for n in page.nodes if 'data-line-chapter' in n['attrs']]) == 5
    video = page.one('video')['attrs']
    assert video['preload'] == 'none' and 'src' not in video
    for edition in ['', 'mobile-']:
        assert f'-{lang}-v12.mp4' in video[f'data-{edition}src-{lang}']
    print(f'Passed {route}: static {lang} copy, metadata, alternates, all links and 7 capture scenes and five LINE chapters')
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap = ET.fromstring((dist / 'sitemap.xml').read_text())
assert [n.text for n in sitemap.findall('s:url/s:loc', ns)] == ['https://timyeou.com/', 'https://timyeou.com/en/', 'https://timyeou.com/resume/', 'https://timyeou.com/en/resume/']
assert 'Sitemap: https://timyeou.com/sitemap.xml' in (dist / 'robots.txt').read_text()
print('Passed sitemap and crawler discovery')
