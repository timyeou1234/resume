#!/usr/bin/env python3
"""Render both public resume routes and GitHub Pages copy from one content file."""
import argparse
import hashlib
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source/resume-public.json'
ORIGIN = 'https://timyeou.com'
LABELS = {
    'summary': ('Summary', '個人簡介'),
    'experience': ('Professional Experience', '正式工作經歷'),
    'skills': ('Technical Skills', '技術能力'),
    'projects': ('Selected Projects', '精選專案'),
    'workflow': ('AI-Assisted Engineering', 'AI 輔助工作方式'),
    'education': ('Education', '學歷'),
}


def local(value, lang):
    return value[lang] if isinstance(value, dict) else value


def label(key, lang):
    return LABELS[key][lang == 'zh']


def sections(data, lang):
    """Semantic blocks shared by HTML and Markdown; never duplicate resume text."""
    yield 'h2', 'summary', label('summary', lang)
    yield 'p', '', local(data['summary'], lang)
    yield 'h2', 'experience', label('experience', lang)
    for index, role in enumerate(data['experience']):
        yield 'h3', f'role-{index}', role['name']
        yield 'role', '', role['title'] + ' · ' + role['dates']
        for part in role['parts']:
            if part['title']:
                yield 'h4', '', local(part['title'], lang)
            yield 'ul', '', [local(b, lang) for b in part['bullets']]
    yield 'note', '', local(data['scale_note'], lang)
    yield 'h2', 'skills', label('skills', lang)
    for name, value in data['skills']:
        yield 'skill', '', (local(name, lang), local(value, lang))
    yield 'h2', 'projects', label('projects', lang)
    for project in data['projects']:
        yield 'h3', '', local(project['title'], lang)
        yield 'ul', '', [local(b, lang) for b in project['bullets']]
    yield 'h2', 'workflow', label('workflow', lang)
    yield 'p', '', local(data['workflow'], lang)
    yield 'h2', 'education', label('education', lang)
    yield 'p', '', local(data['education'], lang)


def markdown(data, lang):
    lines = [f"# {data['name']}", '', f"**{data['role']}**", '', local(data['availability'], lang), '',
             ' · '.join(f"[{c['label']}]({c['url']})" for c in data['contacts']) +
             ' · [timyeou.com/resume/](https://timyeou.com/resume/)', '']
    for kind, _, text in sections(data, lang):
        if kind.startswith('h'):
            lines.append('#' * int(kind[1]) + ' ' + text)
        elif kind == 'ul':
            lines.extend('- ' + b for b in text)
        elif kind == 'skill':
            lines.append(f'**{text[0]}:** {text[1]}')
        elif kind == 'role':
            lines.append('**' + text + '**')
        else:
            lines.append(text)
        lines.append('')
    return '\n'.join(lines)


def document(data, lang):
    choose = lambda en, zh: zh if lang == 'zh' else en
    route = '/resume/' if lang == 'zh' else '/en/resume/'
    other = '/en/resume/' if lang == 'zh' else '/resume/'
    home = '/' if lang == 'zh' else '/en/'
    title = choose('Timothy Yu | Senior iOS Engineer · Resume', 'Timothy Yu｜Senior iOS Engineer・求職履歷')
    chunks = []
    for kind, id_, text in sections(data, lang):
        attr = f' id="{id_}"' if id_ else ''
        if kind.startswith('h'):
            chunks.append(f'<{kind}{attr}>{escape(text)}</{kind}>')
        elif kind == 'ul':
            chunks.append('<ul>' + ''.join(f'<li>{escape(b)}</li>' for b in text) + '</ul>')
        elif kind == 'skill':
            chunks.append(f'<p class="resume-skill"><strong>{escape(text[0])}</strong> {escape(text[1])}</p>')
        else:
            chunks.append(f'<p class="resume-{kind}">{escape(text)}</p>')
    content = '\n'.join(chunks)
    contacts = ''.join(f'<a href="{escape(c["url"], quote=True)}">{escape(c["label"])}</a>' for c in data['contacts'])
    nav = ''.join(f'<a href="#{key}">{label(key, lang)}</a>' for key in ['experience', 'skills', 'projects'])
    return f'''<!doctype html>
<html lang="{choose('en', 'zh-Hant')}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<meta name="description" content="{escape(local(data['summary'], lang), quote=True)}">
<meta name="theme-color" content="#080a0f">
<meta name="resume-source-sha256" content="{hashlib.sha256(SOURCE.read_bytes()).hexdigest()}">
<meta property="og:title" content="{escape(title, quote=True)}">
<meta property="og:description" content="{escape(local(data['summary'], lang), quote=True)}">
<meta property="og:type" content="profile"><meta property="og:url" content="{ORIGIN}{route}">
<link rel="canonical" href="{ORIGIN}{route}">
<link rel="alternate" hreflang="zh-Hant" href="{ORIGIN}/resume/">
<link rel="alternate" hreflang="en" href="{ORIGIN}/en/resume/">
<link rel="alternate" hreflang="x-default" href="{ORIGIN}/resume/">
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/resume.css">
<script src="/resume.js" defer></script>
</head>
<body class="resume-site">
<a class="skip-link" href="#main">{choose('Skip to resume', '跳至履歷')}</a>
<header class="resume-header">
<a class="brand" href="{home}" aria-label="{choose('Timothy Yu, consulting home', 'Timothy Yu，接案首頁')}"><span class="brand-mark">TY</span><span>Timothy Yu</span></a>
<nav aria-label="{choose('Audience navigation', '網站分流導覽')}" class="audience-nav">
<a href="{home}">{choose('Consulting', '接案服務')}</a><a href="{route}" aria-current="page">{choose('Resume', '求職履歷')}</a>
<a class="resume-language" href="{other}" hreflang="{choose('zh-Hant', 'en')}">{choose('中文', 'English')}</a>
</nav>
</header>
<main id="main" class="resume-shell">
<div class="resume-intro">
<p class="kicker">{choose('FOR RECRUITERS', '求職資訊')}</p>
<h1>{escape(data['name'])}</h1><p class="resume-role-title">{escape(data['role'])}</p>
<p class="resume-availability">{escape(local(data['availability'], lang))}</p>
<div class="resume-actions">
<a class="button button-primary" href="mailto:timyeou1234@hotmail.com?subject=Senior%20iOS%20opportunity">{choose('Contact about a role', '洽談職缺')}</a>
<button class="button resume-print" type="button" hidden>{choose('Print / Save PDF', '列印／另存 PDF')}</button>
<a class="resume-archive" href="https://timyeou1234.github.io/resume/resume.html">{choose('GitHub Pages resume ↗', 'GitHub Pages 履歷 ↗')}</a>
</div>
<div class="resume-contacts">{contacts}</div>
<p class="print-url">{ORIGIN}{route}</p>
</div>
<nav class="resume-sections" aria-label="{choose('Resume sections', '履歷章節')}">{nav}</nav>
<article class="resume-content" aria-label="{choose('Resume', '履歷')}">
{content}
</article>
</main>
<footer class="resume-footer"><a href="{home}">{choose('Looking for development or consulting services? Visit the consulting site.', '需要專案開發或技術顧問？前往接案服務首頁。')}</a></footer>
</body></html>
'''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--markdown', action='store_true')
    parser.add_argument('--language', choices=['en', 'zh'], default='en')
    args = parser.parse_args()
    data = json.loads(SOURCE.read_text())
    if args.markdown:
        print(markdown(data, args.language))
        return
    for lang, route in [('zh', 'resume/index.html'), ('en', 'en/resume/index.html')]:
        target = ROOT / '.portfolio-dist' / route
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(document(data, lang))


if __name__ == '__main__':
    main()
