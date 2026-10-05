#!/usr/bin/env python3
"""Register, build and validate resume applications using only the Python stdlib."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BASES = ('us-tech', 'web3', 'taiwan', 'chinese', 'ai')
SLUG = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*\Z')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def source_file(relative):
    require(isinstance(relative, str) and relative, 'Source path must be nonempty')
    path = (ROOT / relative).resolve()
    require(not Path(relative).is_absolute() and path.is_relative_to(ROOT),
            f'Source must stay inside the repository: {relative}')
    require(path.is_file(), f'Missing source: {relative}')
    return path


def text_list(value, label):
    require(isinstance(value, list) and all(isinstance(s, str) and s.strip() for s in value),
            f'{label} must be a list of nonempty strings')


def profiles():
    result = {}
    for path in sorted((ROOT / 'applications').glob('*.json')):
        slug = path.stem
        require(SLUG.fullmatch(slug), f'Invalid profile slug: {slug}')
        p = read_json(path)
        keys = {'schema_version', 'company', 'role', 'job_url', 'reviewed_on',
                'base', 'status', 'brief', 'sources', 'validation'}
        require(isinstance(p, dict) and set(p) == keys, f'{path.name}: unexpected or missing fields')
        require(type(p['schema_version']) is int and p['schema_version'] == 1,
                f'{slug}: unsupported schema_version')
        for key in ('company', 'role', 'job_url', 'reviewed_on', 'base', 'status', 'brief'):
            require(isinstance(p[key], str) and p[key].strip(), f'{slug}: missing {key}')
        require(p['base'] in BASES, f'{slug}: unknown base')
        require(p['status'] in ('draft', 'ready'), f'{slug}: status must be draft or ready')
        url = urlparse(p['job_url'])
        require(url.scheme in ('http', 'https') and url.netloc, f'{slug}: invalid job_url')
        datetime.date.fromisoformat(p['reviewed_on'])
        source_file(p['brief'])
        source_file(f'companies/{slug}.tex')
        text_list(p['sources'], f'{slug}: sources')
        require('source/resume.md' in p['sources'], f'{slug}: factual baseline is required')
        for source in p['sources']:
            source_file(source)
        v = p['validation']
        require(isinstance(v, dict) and set(v) == {'exact_pages', 'required_text', 'forbidden_text'},
                f'{slug}: invalid validation fields')
        require(v['exact_pages'] is None or
                (type(v['exact_pages']) is int and v['exact_pages'] in (1, 2)),
                f'{slug}: exact_pages must be null, 1 or 2')
        text_list(v['required_text'], f'{slug}: required_text')
        text_list(v['forbidden_text'], f'{slug}: forbidden_text')
        if p['status'] == 'ready':
            require(v['required_text'], f'{slug}: ready profiles need specific required_text')
            require('TODO' not in source_file(p['brief']).read_text(),
                    f'{slug}: resolve TODOs in the application brief before marking ready')
        result[slug] = p
    # Any company added through the old workflow must also join the registry.
    for overlay in (ROOT / 'companies').glob('*.tex'):
        require(overlay.stem == 'example' or overlay.stem in result,
                f'Unregistered overlay: {overlay.name}; add applications/{overlay.stem}.json')
    return result


def targets(registered):
    return dict([(b, (b, None)) for b in BASES] + [
        (f"{p['base']}-{slug}", (p['base'], slug))
        for slug, p in registered.items() if p['status'] == 'ready'
    ])


def run(args):
    return subprocess.check_output(args, cwd=ROOT, text=True)


def check_text(text, required, forbidden, label):
    for value in required:
        require(value in text, f'{label}: missing required text: {value}')
    for value in forbidden:
        require(value not in text, f'{label}: forbidden text: {value}')


def validate(names, registered):
    known = targets(registered)
    selected = names or list(known)
    for name in selected:
        require(name in known, f'Unknown or draft validation target: {name}')
    checks = read_json(ROOT / 'config/validation.json')
    reports = []
    for name in selected:
        base, slug = known[name]
        pdf = ROOT / 'dist' / f'{name}.pdf'
        require(pdf.is_file() and pdf.stat().st_size > 0, f'Missing or empty PDF: {pdf}')
        info = run(['pdfinfo', str(pdf)])
        match = re.search(r'^Pages:\s+(\d+)', info, re.M)
        require(match is not None, f'{name}: cannot read page count')
        pages = int(match[1])
        require(1 <= pages <= checks['max_pages'], f'{name}: expected 1-2 pages; got {pages}')
        extra = registered[slug]['validation'] if slug else {}
        require(extra.get('exact_pages') in (None, pages),
                f"{name}: expected {extra.get('exact_pages')} substantive pages; got {pages}")
        text = run(['pdftotext', str(pdf), '-'])
        lang = checks['languages']['zh' if base == 'chinese' else 'en']
        required = (lang['headings'] + checks['required_contact'] + checks['visible_links'] +
                    checks['required_facts'] + lang['required_facts'] + extra.get('required_text', []))
        forbidden = checks['forbidden_text'] + extra.get('forbidden_text', [])
        check_text(text, required, forbidden, name)
        words = []
        for number in range(1, pages + 1):
            page = run(['pdftotext', '-f', str(number), '-l', str(number), str(pdf), '-'])
            words.append(len(page.split()))
            require(pages != 2 or words[-1] >= checks['min_words_per_page'],
                    f'{name}: page {number} is underfilled ({words[-1]} words)')
        reports.append({'target': name, 'pages': pages, 'words_per_page': words,
                        'pdf_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest()})
        print(f'Validated dist/{name}.pdf: {pages} page(s) with extractable text')
    return reports


def ready_profile(slug, registered):
    require(slug in registered, f'Unknown company profile: {slug}')
    p = registered[slug]
    require(p['status'] == 'ready',
            f'{slug}: complete the brief, overlay and specific checks, then set status to ready; '
            f'preview drafts with make {p["base"]} COMPANY={slug}')
    return p


def build(base, slug=None):
    subprocess.run(['bash', str(ROOT / 'scripts/build.sh'), base, slug or ''], cwd=ROOT, check=True)


def receipt(slug, p, reports):
    # Preserve a reviewable snapshot of inputs next to each tested application.
    directory = ROOT / 'dist' / 'applications' / slug
    directory.mkdir(parents=True, exist_ok=True)
    tracked = run(['git', 'ls-files', '-z']).split('\0')
    paths = {name for name in tracked if name and
             (name.startswith(('config/', 'sections/', 'resumes/', 'scripts/')) or
              name in ('Makefile', 'RESUME_GUIDELINES.md', 'PROMPT.md', 'AGENTS.md'))}
    paths.update(p['sources'] + [p['brief'], f'applications/{slug}.json', f'companies/{slug}.tex'])
    if (ROOT / 'config/company.local.tex').is_file():
        paths.add('config/company.local.tex')
    evidence = {'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'git_commit': run(['git', 'rev-parse', 'HEAD']).strip(),
                'working_tree_dirty': bool(run(['git', 'status', '--porcelain']).strip()),
                'profile': p, 'checks': reports,
                'source_sha256': {name: hashlib.sha256(source_file(name).read_bytes()).hexdigest()
                                  for name in sorted(paths)},
                'visual_review': 'pending; inspect every rendered page before delivery',
                'application_submitted': False}
    (directory / 'validation.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n')
    (directory / 'brief.md').write_bytes(source_file(p['brief']).read_bytes())
    print(f'Saved dist/applications/{slug}/validation.json; visual review remains required')


def initialize(args):
    require(SLUG.fullmatch(args.slug), 'Use lowercase letters, numbers and single hyphens for the slug')
    require(args.company.strip() and args.role.strip(), 'Company and role must be nonempty')
    url = urlparse(args.url)
    require(url.scheme in ('http', 'https') and url.netloc, 'A full HTTP(S) job URL is required')
    require(args.slug != 'example', 'example is reserved for the legacy overlay example')
    destinations = [ROOT / f'applications/{args.slug}.json', ROOT / f'companies/{args.slug}.tex',
                    ROOT / f'companies/{args.slug}.md']
    require(not any(p.exists() for p in destinations), f'{args.slug}: already exists; no files overwritten')
    jd = Path(args.jd).read_text() if args.jd else 'TODO: Paste the exact JD snapshot, including date and retrieval caveats.'
    p = dict(schema_version=1, company=args.company, role=args.role, job_url=args.url,
             reviewed_on=datetime.date.today().isoformat(), base=args.base, status='draft',
             brief=f'companies/{args.slug}.md', sources=['source/resume.md', 'source/production-tooling.md'],
             validation=dict(exact_pages=None, required_text=[], forbidden_text=[]))
    brief = (f'# {args.company} - {args.role}\n\nJob URL: {args.url}\n'
             f'Record created: {p["reviewed_on"]}; this date is not proof of a live JD check.\n\n'
             f'## JD snapshot\n\n{jd}\n\n## Requirement to evidence mapping\n\n'
             '| JD requirement | Confirmed fact and source | Resume change |\n| --- | --- | --- |\n'
             '| TODO | TODO | TODO |\n\n## Gaps and pending candidate confirmation\n\nTODO\n\n'
             '## Editorial choices\n\nTODO: headline, summary, skills, project order, language and page budget.\n\n'
             '## Verification\n\nTODO: record factual review, automated results and rendered-page review.\n')
    overlay = (f'% Profile: applications/{args.slug}.json\n'
               '% DRAFT: tailor only supported claims. Do not copy a whole standard resume.\n'
               '% Override ResumeTagline for positioning; the ai base also supports ResumeContent.\n')
    contents = [json.dumps(p, ensure_ascii=False, indent=2) + '\n', overlay, brief]
    created = []
    try:
        for path, content in zip(destinations, contents):
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open('x', encoding='utf-8') as output:
                created.append(path)
                output.write(content)
    except OSError:
        for path in created:
            path.unlink()
        raise
    print(f'Created draft {args.slug}. Complete {p["brief"]}, companies/{args.slug}.tex and the JSON checks.')
    print(f'Preview: make {args.base} COMPANY={args.slug}; after review: make tailor COMPANY={args.slug}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    for name in ('list', 'check', 'build-all'):
        commands.add_parser(name)
    tailor = commands.add_parser('tailor', help='Build, validate and record one ready application')
    tailor.add_argument('company')
    validation = commands.add_parser('validate', help='Validate specific targets or all ready outputs')
    validation.add_argument('targets', nargs='*')
    init = commands.add_parser('init', help='Create a draft without overwriting existing work')
    init.add_argument('slug')
    init.add_argument('--company', required=True)
    init.add_argument('--role', required=True)
    init.add_argument('--url', required=True)
    init.add_argument('--base', choices=BASES, default='ai')
    init.add_argument('--jd', help='Local UTF-8 file containing the captured JD')
    args = parser.parse_args()
    if args.command == 'init':
        initialize(args)
        return
    registered = profiles()
    if args.command == 'list':
        for slug, p in registered.items():
            print(f"{slug}\t{p['status']}\t{p['base']}\t{p['company']} - {p['role']}")
    elif args.command == 'check':
        print(f'Checked {len(registered)} application profiles')
    elif args.command == 'build-all':
        for base, slug in targets(registered).values():
            build(base, slug)
    elif args.command == 'validate':
        reports = validate(args.targets, registered)
        for report in reports:
            _, slug = targets(registered)[report['target']]
            if slug:
                receipt(slug, registered[slug], [report])
    elif args.command == 'tailor':
        p = ready_profile(args.company, registered)
        build(p['base'], args.company)
        reports = validate([f"{p['base']}-{args.company}"], registered)
        receipt(args.company, p, reports)


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError) as exc:
        print(f'Error: {exc}', file=sys.stderr)
        sys.exit(1)
