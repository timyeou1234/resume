"""Contract checks: discovery, non-destructive initialization and PDF rejection paths."""
import argparse
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('resume', Path(__file__).resolve().parents[1] / 'scripts/resume.py')
resume = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(resume)
REPO = resume.ROOT


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        for name in ('applications', 'companies', 'config', 'source', 'dist'):
            (self.root / name).mkdir()
        for name in ('config/validation.json', 'source/resume.md', 'source/production-tooling.md'):
            shutil.copy(REPO / name, self.root / name)
        self.root_patch = patch.object(resume, 'ROOT', self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)
        self.addCleanup(self.temp.cleanup)

    def init(self, slug='test-role', **kwargs):
        args = argparse.Namespace(slug=slug, company='Test Company', role='Senior iOS Engineer',
                                  url='https://example.com/jobs/123', base='ai', jd=None)
        for key, value in kwargs.items():
            setattr(args, key, value)
        with contextlib.redirect_stdout(io.StringIO()):
            resume.initialize(args)
        return args

    def ready(self, slug='test-role'):
        self.init(slug)
        path = self.root / f'applications/{slug}.json'
        p = json.loads(path.read_text())
        p['status'] = 'ready'
        p['validation'] = {'exact_pages': 2, 'required_text': ['Target differentiator'],
                           'forbidden_text': ['Unsupported claim']}
        path.write_text(json.dumps(p))
        (self.root / p['brief']).write_text('Reviewed requirements, evidence, gaps and editorial choices.\n')
        return resume.profiles()

    def test_new_profile_discovered_without_code_edits(self):
        registered = self.ready('future-company')
        self.assertIn('ai-future-company', resume.targets(registered))
        self.assertEqual(len(resume.targets(registered)), 6)

    def test_draft_excluded_and_cannot_be_delivered(self):
        self.init()
        registered = resume.profiles()
        self.assertEqual(list(resume.targets(registered)), list(resume.BASES))
        with self.assertRaisesRegex(ValueError, 'complete the brief'):
            resume.ready_profile('test-role', registered)
        with self.assertRaisesRegex(ValueError, 'Unknown or draft'):
            resume.validate(['ai-test-role'], registered)

    def test_init_never_overwrites_existing_files(self):
        self.init()
        path = self.root / 'companies/test-role.tex'
        path.write_text('User edits')
        with self.assertRaisesRegex(ValueError, 'already exists'):
            self.init()
        self.assertEqual(path.read_text(), 'User edits')

    def test_invalid_init_leaves_no_partial_files(self):
        for slug in ('../outside', 'bad_name', 'a--b', 'example'):
            with self.subTest(slug=slug), self.assertRaises(ValueError):
                self.init(slug)
        with self.assertRaises(ValueError):
            self.init(url='file:///etc/passwd')
        self.assertEqual(list((self.root / 'applications').iterdir()), [])

    def test_missing_jd_leaves_no_partial_files(self):
        with self.assertRaises(FileNotFoundError):
            self.init(jd=str(self.root / 'missing.md'))
        self.assertEqual(list((self.root / 'applications').iterdir()), [])

    def test_partial_init_failure_rolls_back_own_files(self):
        original = Path.open
        def fail_overlay(path, *args, **kwargs):
            if path.suffix == '.tex':
                raise OSError('simulated write failure')
            return original(path, *args, **kwargs)
        with patch.object(Path, 'open', fail_overlay), self.assertRaises(OSError):
            self.init()
        self.assertFalse((self.root / 'applications/test-role.json').exists())

    def test_jd_preserved_as_literal_text(self):
        jd = self.root / 'jd.md'
        jd.write_text('Swift & iOS: `literal` $(never execute)\nSecond line')
        self.init(jd=str(jd))
        self.assertIn(jd.read_text(), (self.root / 'companies/test-role.md').read_text())

    def test_ready_requires_specific_checks_and_completed_brief(self):
        self.init()
        path = self.root / 'applications/test-role.json'
        p = json.loads(path.read_text())
        p['status'] = 'ready'
        path.write_text(json.dumps(p))
        with self.assertRaisesRegex(ValueError, 'specific required_text'):
            resume.profiles()
        p['validation']['required_text'] = ['Specific headline']
        path.write_text(json.dumps(p))
        with self.assertRaisesRegex(ValueError, 'resolve TODOs'):
            resume.profiles()

    def test_missing_and_outside_evidence_rejected(self):
        self.ready()
        with self.assertRaisesRegex(ValueError, 'Missing source'):
            resume.source_file('source/missing.md')
        with self.assertRaisesRegex(ValueError, 'inside the repository'):
            resume.source_file('/etc/passwd')
        outside = self.root.parent / 'outside-resume-test.md'
        (self.root / 'source/link.md').symlink_to(outside)
        with self.assertRaisesRegex(ValueError, 'inside the repository'):
            resume.source_file('source/link.md')

    def test_unregistered_overlay_is_not_silently_skipped(self):
        (self.root / 'companies/forgotten.tex').write_text('% custom content')
        with self.assertRaisesRegex(ValueError, 'Unregistered overlay'):
            resume.profiles()

    def test_malformed_and_misspelled_validation_rejected(self):
        self.ready()
        path = self.root / 'applications/test-role.json'
        original = json.loads(path.read_text())
        for field, value in [('exact_pages', True), ('required_text', 'string'),
                             ('forbidden_text', [3])]:
            p = json.loads(json.dumps(original))
            p['validation'][field] = value
            path.write_text(json.dumps(p))
            with self.subTest(field=field), self.assertRaises(ValueError):
                resume.profiles()
        original['validation']['required_txt'] = []
        path.write_text(json.dumps(original))
        with self.assertRaises(ValueError):
            resume.profiles()

    def test_unknown_targets_fail_before_pdf_tools(self):
        for target in ('ai-wrong-company', '../../file', 'ai-binance-futures'):
            with patch.object(resume, 'run') as run, self.assertRaisesRegex(ValueError, 'Unknown or draft'):
                resume.validate([target], {})
            run.assert_not_called()

    def pdf_fixture(self, registered):
        checks = resume.read_json(self.root / 'config/validation.json')
        lang = checks['languages']['en']
        facts = lang['headings'] + checks['required_contact'] + checks['visible_links'] + checks['required_facts'] + lang['required_facts']
        text = '\n'.join(facts + ['Target differentiator'] + ['filler'] * 200)
        (self.root / 'dist/ai-test-role.pdf').write_bytes(b'fixture')
        return text

    def assert_pdf(self, registered, text, pages=2, page_text=None):
        def tool(args):
            if args[0] == 'pdfinfo':
                return f'Pages: {pages}\n'
            return page_text if '-f' in args and page_text is not None else text
        with patch.object(resume, 'run', side_effect=tool), contextlib.redirect_stdout(io.StringIO()):
            return resume.validate(['ai-test-role'], registered)

    def test_complete_pdf_passes_and_missing_facts_fail(self):
        registered = self.ready()
        text = self.pdf_fixture(registered)
        self.assertEqual(self.assert_pdf(registered, text)[0]['pages'], 2)
        for fact in ('timyeou.com', 'Private Pilot', 'Target differentiator', 'Co-Founder',
                     'Crypto.com', 'Sep 2024 - Jul 2026', 'Education'):
            if fact not in text:
                continue
            with self.subTest(fact=fact), self.assertRaisesRegex(ValueError, 'missing required text'):
                self.assert_pdf(registered, text.replace(fact, 'REMOVED'))

    def test_wrong_pages_underfill_forbidden_and_missing_pdf_fail(self):
        registered = self.ready()
        text = self.pdf_fixture(registered)
        for pages in (0, 1, 3):
            with self.subTest(pages=pages), self.assertRaises(ValueError):
                self.assert_pdf(registered, text, pages=pages)
        with self.assertRaisesRegex(ValueError, 'underfilled'):
            self.assert_pdf(registered, text, page_text='Education only')
        for phrase in ('Unsupported claim', 'JSON-RPC', 'you@example.com'):
            with self.subTest(phrase=phrase), self.assertRaisesRegex(ValueError, 'forbidden text'):
                self.assert_pdf(registered, text + phrase)
        (self.root / 'dist/ai-test-role.pdf').unlink()
        with self.assertRaisesRegex(ValueError, 'Missing or empty PDF'):
            self.assert_pdf(registered, text)

    def test_tailor_stops_on_build_failure(self):
        registered = self.ready()
        with patch.object(resume, 'profiles', return_value=registered), \
             patch.object(resume, 'build', side_effect=subprocess.CalledProcessError(1, 'latexmk')), \
             patch.object(resume, 'validate') as validate, \
             patch.object(resume, 'receipt') as receipt, \
             patch('sys.argv', ['resume.py', 'tailor', 'test-role']), \
             self.assertRaises(subprocess.CalledProcessError):
            resume.main()
        validate.assert_not_called()
        receipt.assert_not_called()

    def test_receipt_records_hashes_and_pending_visual_review(self):
        registered = self.ready()
        with patch.object(resume, 'run', side_effect=['config/validation.json\0', 'abc123\n', ' M content\n']), \
             contextlib.redirect_stdout(io.StringIO()):
            resume.receipt('test-role', registered['test-role'], [{'target': 'ai-test-role'}])
        report = resume.read_json(self.root / 'dist/applications/test-role/validation.json')
        self.assertEqual(report['git_commit'], 'abc123')
        self.assertTrue(report['working_tree_dirty'])
        self.assertIn('config/validation.json', report['source_sha256'])
        self.assertIn('pending', report['visual_review'])
        self.assertFalse(report['application_submitted'])


if __name__ == '__main__':
    unittest.main()
