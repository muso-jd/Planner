#!/usr/bin/env python3
"""Maintain the README repository dashboard using GitHub metadata only.

No application builds, branch merges/deletions, deployments, or third-party packages.
"""
import argparse
import base64
import html
import json
import os
import re
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

START = '<!-- repository-index:start -->'
END = '<!-- repository-index:end -->'
MESSAGE = 'docs: refresh repository index [skip ci]'


def cell(value):
    value = ' '.join(str(value or '').split())
    value = html.escape(value, quote=False).replace('@', '&#64;')
    return re.sub(r'([\\`*_{\[\]()!|])', r'\\\1', value)


def link(label, url):
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError('Index links require HTTPS without credentials')
    return '[' + cell(label) + '](' + url.replace('(', '%28').replace(')', '%29').replace(' ', '%20') + ')'


def replace_panel(readme, panel):
    if START in readme or END in readme:
        if readme.count(START) != 1 or readme.count(END) != 1:
            raise ValueError('README index markers must occur exactly once')
        first, last = readme.index(START), readme.index(END)
        if first > last:
            raise ValueError('README index markers are reversed')
        return readme[:first] + panel + readme[last + len(END):]
    lines = readme.splitlines(keepends=True)
    if lines and lines[0].startswith('# '):
        return lines[0].rstrip() + '\n\n' + panel + '\n\n' + ''.join(lines[1:]).lstrip('\n')
    return panel + '\n\n' + readme


class API:
    def __init__(self, repository, token):
        if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repository):
            raise ValueError('Invalid repository name')
        self.base = 'https://api.github.com/repos/' + repository
        self.token = token

    def request(self, path, data=None):
        headers = {'Accept': 'application/vnd.github+json',
                   'Authorization': 'Bearer ' + self.token,
                   'X-GitHub-Api-Version': '2022-11-28',
                   'User-Agent': 'repository-index'}
        payload = None if data is None else json.dumps(data).encode()
        if payload is not None:
            headers['Content-Type'] = 'application/json'
        req = Request(self.base + path, data=payload, headers=headers,
                      method='GET' if data is None else 'PUT')
        with urlopen(req, timeout=30) as response:
            return json.load(response)

    def pages(self, path):
        result, page = [], 1
        while True:
            sep = '&' if '?' in path else '?'
            batch = self.request(path + sep + 'per_page=100&page=' + str(page))
            if not isinstance(batch, list):
                raise ValueError('Expected a GitHub collection')
            result.extend(batch)
            if len(batch) < 100:
                return result
            page += 1


def collect(api):
    repo = api.request('')
    branches = api.pages('/branches')
    commits = {}
    for branch in branches:
        sha = branch['commit']['sha']
        commits[branch['name']] = api.request('/git/commits/' + sha)
        if branch['name'] == repo['default_branch'] and commits[branch['name']]['message'].startswith('docs: refresh repository index'):
            # Index-only commits must not make every future refresh look changed.
            page = 1
            while True:
                recent = api.request('/commits?sha=' + quote(branch['name'], safe='') + '&per_page=100&page=' + str(page))
                source = next((c for c in recent if not c['commit']['message'].startswith('docs: refresh repository index')), None)
                if source:
                    branch['commit'] = {'sha': source['sha']}
                    commits[branch['name']] = source['commit']
                    break
                if len(recent) < 100:
                    raise ValueError('No non-index commit found')
                page += 1
    return {'repo': repo, 'branches': branches, 'commits': commits,
            'pulls': api.pages('/pulls?state=all'),
            'releases': api.pages('/releases'), 'tags': api.pages('/tags'), 'tag_inventory_complete': True,
            'root': api.request('/contents?ref=' + quote(repo['default_branch'], safe=''))}


def render(data, config):
    repo = data['repo']
    name, default = repo['full_name'], repo['default_branch']
    base = 'https://github.com/' + name
    def tree(ref):
        return base + '/tree/' + quote(ref, safe='')
    def blob(ref, path):
        return base + '/blob/' + quote(ref, safe='') + '/' + quote(path, safe='/')
    branches = data['branches']
    commits = data['commits']
    pulls = data['pulls']
    opened = [p for p in pulls if p['state'] == 'open']
    root = data.get('root', [])
    app_items = [x for x in root if x['name'] not in
                 {'.github', '.gitignore', 'AGENTS.md', 'README.md', 'LICENSE', 'LICENSE.md',
                  'CHANGELOG.md', 'docs', 'readme.md', '.gitattributes'}
                 and not x['name'].lower().endswith(('.md', '.txt'))]
    if app_items:
        boundary = 'The default branch contains project source. Check branch and deployment records before choosing a version.'
    elif len(branches) > 1:
        boundary = 'The default branch currently contains project documentation and this index. Application work remains on the branches below; it has not been consolidated into the default branch.'
    else:
        boundary = 'The default branch currently contains documentation/index scaffolding. No application source was found at its root.'
    lines = [START, '## Repository dashboard', '', boundary, '',
             link('Default branch', tree(default)) + ' · ' + link('All branches', base + '/branches') +
             ' · ' + link('Pull requests', base + '/pulls') + ' · ' + link('Releases', base + '/releases') +
             ' · ' + link('Index automation', base + '/actions/workflows/repository-index.yml'), '',
             '**' + str(len(branches)) + ' branches · ' + str(len(opened)) + ' open pull requests**', '',
             '### Deployment links', '',
             'These are recorded destinations, not a fresh availability or security check. Git branches and open PRs do not establish what is live.', '']
    deployments = config.get('deployments', [])
    if deployments:
        lines += ['| Destination | URL | Source / evidence |', '| --- | --- | --- |']
        for dep in deployments:
            evidence = link('Record', dep['evidence_url'])
            if dep.get('source_branch'):
                evidence = link(dep['source_branch'], tree(dep['source_branch'])) + ' · ' + evidence
            lines += ['| ' + cell(dep['label']) + ' | ' + link('Open', dep['url']) + ' | ' + evidence + ' |']
    else:
        lines += ['No deployment destination is recorded in the index configuration.']
    lines += ['', '### Branches and work', '',
              '| Branch | Purpose | GitHub state / target | Latest source/docs commit (UTC) | Links |',
              '| --- | --- | --- | --- | --- |']
    def date(branch):
        return commits.get(branch['name'], {}).get('committer', {}).get('date', '')
    ordered = sorted(branches, key=date, reverse=True)
    ordered.sort(key=lambda b: b['name'] != default)
    for branch in ordered:
        ref, sha = branch['name'], branch['commit']['sha']
        own = [p for p in pulls if p['head'].get('repo') and
               p['head']['repo']['full_name'].lower() == name.lower() and p['head']['ref'] == ref]
        own.sort(key=lambda p: (p['state'] == 'open', p.get('updated_at', '')), reverse=True)
        pr = own[0] if own else None
        if ref == default:
            purpose, state = 'Default source and repository index', 'Default branch'
        elif pr:
            purpose = pr['title']
            state = ('Merged' if pr.get('merged_at') else 'Draft' if pr.get('draft') else 'Open' if pr['state'] == 'open' else 'Closed, unmerged')
            state += ' PR #' + str(pr['number']) + ' → ' + pr['base']['ref']
        else:
            purpose, state = config.get('branch_purposes', {}).get(ref, ref.replace('/', ': ').replace('-', ' ')), 'Branch; no matching PR'
        links = link(sha[:7], base + '/commit/' + sha)
        if pr:
            links += ' · ' + link('PR #' + str(pr['number']), base + '/pull/' + str(pr['number']))
        if ref != default:
            links += ' · ' + link('Compare', base + '/compare/' + quote(default, safe='') + '...' + quote(ref, safe=''))
        lines += ['| ' + link(ref, tree(ref)) + ' | ' + cell(purpose) + ' | ' + cell(state) +
                  ' | ' + cell(date(branch).replace('T', ' ').replace('Z', '')) + ' | ' + links + ' |']
    stacked = [p for p in opened if p['base']['ref'] != default]
    if stacked:
        lines += ['', '**Stacked work:** ' + str(len(stacked)) +
                  ' open PR(s) target another feature branch. Follow the target column to understand dependencies; this dashboard does not merge or retarget them.']
    lines += ['', 'Default-branch source/docs commit details exclude automatic index-only commits.', '',
              '<details>', '<summary>Latest recorded change on each branch</summary>', '',
              '| Branch | Latest commit summary |', '| --- | --- |']
    for branch in ordered:
        ref = branch['name']
        subject = commits.get(ref, {}).get('message', '').split('\n')[0]
        lines += ['| ' + link(ref, tree(ref)) + ' | ' + cell(subject) + ' |']
    lines += ['', '</details>', '', '### Version history', '']
    released = data.get('releases', [])
    tags = data.get('tags', [])
    published = [r for r in released if not r.get('draft')]
    if published:
        lines += ['| Release | Date (UTC) | Type |', '| --- | --- | --- |']
        for release in published[:20]:
            lines += ['| ' + link(release.get('name') or release['tag_name'], release['html_url']) +
                      ' | ' + cell(release.get('published_at', '')) + ' | ' +
                      ('Prerelease' if release.get('prerelease') else 'Release') + ' |']
    elif data.get('tag_inventory_complete', False):
        lines += ['No published GitHub Releases were found. App versions recorded in deployment guides are not automatically Git tags or releases.']
    else:
        lines += ['No published GitHub Releases were found in the initial inventory. Tag inventory will be populated by the first automatic refresh.']
    if tags:
        lines += ['', '**Tags:** ' + ' · '.join(link(t['name'], tree(t['name'])) for t in tags[:30])]
    lines += ['', '### Working convention', '',
              'Keep the default branch as the project entry point. Reuse an existing coherent task branch; use new branches for substantial independent work or experiments. Prefer tags/releases for completed versions. Preserve unique work and check dependent PRs before any branch cleanup.', '',
              'This panel is generated from GitHub metadata and `.github/repository-index.json`. Existing project documentation below is preserved. See ' +
              link('index maintenance and policy', blob(default, '.github/REPOSITORY_INDEX.md')) +
              ' for refresh triggers, limitations, and how to record deployments.', END]
    return '\n'.join(lines)


def publish(api, panel, branch):
    for attempt in range(3):
        remote = api.request('/contents/README.md?ref=' + quote(branch, safe=''))
        original = base64.b64decode(remote['content']).decode('utf-8')
        changed = replace_panel(original, panel)
        if changed == original:
            return False
        try:
            api.request('/contents/README.md', {'message': MESSAGE, 'branch': branch,
                        'sha': remote['sha'], 'content': base64.b64encode(changed.encode()).decode()})
            return True
        except HTTPError as exc:
            if exc.code != 409 or attempt == 2:
                raise
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--snapshot', type=Path)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    config = json.loads(Path('.github/repository-index.json').read_text())
    if args.snapshot:
        if args.write:
            raise ValueError('Snapshot mode cannot publish')
        data = json.loads(args.snapshot.read_text())
    else:
        api = API(os.environ['GITHUB_REPOSITORY'], os.environ['GITHUB_TOKEN'])
        data = collect(api)
    panel = render(data, config)
    if args.write:
        updated = publish(api, panel, data['repo']['default_branch'])
        print('README index updated.' if updated else 'README index already current.')
    else:
        path = Path('README.md')
        path.write_text(replace_panel(path.read_text(), panel))


if __name__ == '__main__':
    main()
