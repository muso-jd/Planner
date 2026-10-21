import base64
import copy
import importlib.util
import unittest
from pathlib import Path
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location('index', Path(__file__).with_name('update_repository_index.py'))
index = importlib.util.module_from_spec(spec)
spec.loader.exec_module(index)


class IndexTests(unittest.TestCase):
    def fixture(self):
        return {'repo': {'full_name': 'owner/project', 'default_branch': 'main'},
                'branches': [{'name': 'main', 'commit': {'sha': 'a' * 40}},
                             {'name': 'feature/one', 'commit': {'sha': 'b' * 40}}],
                'commits': {'main': {'message': 'Initial source', 'committer': {'date': '2026-10-21T01:00:00Z'}},
                            'feature/one': {'message': 'Add feature', 'committer': {'date': '2026-10-21T02:00:00Z'}}},
                'pulls': [], 'releases': [], 'tags': [], 'root': [{'name': 'README.md'}],
                'tag_inventory_complete': True}

    def test_preserves_existing_readme_and_is_idempotent(self):
        original = '# Project\n\nExisting setup.\n\n## Rights\nKeep these.\n'
        panel = index.START + '\nnew\n' + index.END
        result = index.replace_panel(original, panel)
        self.assertIn('Existing setup.\n\n## Rights\nKeep these.\n', result)
        self.assertEqual(index.replace_panel(result, panel), result)
        self.assertEqual(result.count(index.START), 1)

    def test_rejects_corrupt_markers(self):
        for text in [index.START, index.END, index.END + index.START, index.START * 2 + index.END]:
            with self.assertRaises(ValueError):
                index.replace_panel(text, 'panel')

    def test_escapes_untrusted_metadata(self):
        text = index.cell('<script>\n[x](javascript:bad)|@person')
        self.assertNotIn('<script>', text)
        self.assertNotIn('\n', text)
        self.assertIn('\\|', text)
        self.assertIn('\\[x\\]', text)
        self.assertNotIn('@person', text)
        for url in ['javascript:bad', 'http://example.com', 'https://user:secret@example.com']:
            with self.assertRaises(ValueError):
                index.link('x', url)

    def test_fork_branch_is_not_mistaken_for_own_branch(self):
        data = self.fixture()
        data['pulls'] = [{'number': 8, 'title': 'Fork work', 'state': 'open', 'head':
                          {'ref': 'feature/one', 'repo': {'full_name': 'stranger/project'}},
                          'base': {'ref': 'main'}}]
        result = index.render(data, {})
        self.assertIn('1 open pull requests', result)
        self.assertNotIn('Fork work', result)
        self.assertIn('Branch; no matching PR', result)

    def test_stacked_pr_and_version_status(self):
        data = self.fixture()
        data['pulls'] = [{'number': 2, 'title': 'Routine groups', 'state': 'open', 'draft': True,
                          'merged_at': None, 'updated_at': '2026-10-21',
                          'head': {'ref': 'feature/one', 'repo': {'full_name': 'owner/project'}},
                          'base': {'ref': 'feature/previous'}}]
        data['tags'] = [{'name': 'v1.0.0'}]
        result = index.render(data, {})
        self.assertIn('Draft PR #2 → feature/previous', result)
        self.assertIn('**Stacked work:** 1', result)
        self.assertIn('v1.0.0', result)
        self.assertIn('No published GitHub Releases', result)
        self.assertIn('Application work remains on the branches', result)

    def test_pagination(self):
        api = index.API('owner/project', 'unused')
        calls = []
        def request(path):
            calls.append(path)
            return list(range(100)) if path.endswith('&page=1') else [100]
        api.request = request
        self.assertEqual(len(api.pages('/branches')), 101)
        self.assertEqual(len(calls), 2)

    def test_publish_retries_conflict_and_preserves_concurrent_text(self):
        class FakeAPI:
            gets = 0
            puts = []
            def request(self, path, data=None):
                if data is None:
                    self.gets += 1
                    readme = '# Project\n\n' + ('Concurrent edit\n' if self.gets > 1 else 'Original\n')
                    return {'content': base64.b64encode(readme.encode()).decode(), 'sha': str(self.gets)}
                self.puts.append(data)
                if len(self.puts) == 1:
                    raise HTTPError('https://api.github.com', 409, 'conflict', {}, None)
                return {}
        api = FakeAPI()
        self.assertTrue(index.publish(api, index.START + '\nx\n' + index.END, 'main'))
        self.assertIn('Concurrent edit', base64.b64decode(api.puts[-1]['content']).decode())
        self.assertEqual(api.puts[-1]['sha'], '2')

    def test_collect_skips_own_index_commit(self):
        data = self.fixture()
        class FakeAPI:
            def pages(self, path):
                if path == '/branches': return copy.deepcopy(data['branches'])
                return []
            def request(self, path):
                if path == '': return data['repo']
                if path.startswith('/git/commits/a'): return {'message': index.MESSAGE}
                if path.startswith('/git/commits/b'): return data['commits']['feature/one']
                if path.startswith('/commits?'): return [{'sha': 'c' * 40, 'commit': data['commits']['main']}]
                if path.startswith('/contents?'): return data['root']
                raise AssertionError(path)
        collected = index.collect(FakeAPI())
        self.assertEqual(collected['branches'][0]['commit']['sha'], 'c' * 40)
        self.assertEqual(collected['commits']['main']['message'], 'Initial source')


if __name__ == '__main__':
    unittest.main()
