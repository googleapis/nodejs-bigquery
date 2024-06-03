// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const execa = require('execa');
const gaxios = require('gaxios');

const REPO = 'alvarowolfx/nodejs-bigquery';
const BRANCH = 'update-discovery/patch';
const TRACK_PATHS = ['src/types.d.ts'];
const COMMIT_MESSAGE = 'chore: update types from Discovery';
const COMMIT_BODY =
  'Automated pull-request to keep BigQuery Discovery types up-to-date.';

async function submitDiscoveryPR() {
  const statusResult = await execa('git', ['status', '--porcelain']);
  const status = statusResult.stdout;
  const statusFiles = status.split('\n').map(x => x.slice(3));

  const foundChanges = statusFiles.filter(f => {
    return TRACK_PATHS.some(filename => f.startsWith(filename));
  });
  console.log(`Changes found in ${foundChanges.length} files`);
  console.log(foundChanges.join('\n'));

  if (foundChanges.length === 0) {
    console.log('No changes found');
    return;
  }

  if (process.env.GITHUB_ACTIONS) {
    await execa('git', ['config', 'user.email', 'yoshi-automation@google.com']);
    await execa('git', ['config', 'user.name', 'Yoshi Automation']);
  }

  await execa('git', ['checkout', '-B', BRANCH]);
  for (const filename of foundChanges) {
    await execa('git', ['add', filename]);
  }
  await execa('git', ['commit', '-m', COMMIT_MESSAGE, '-m', COMMIT_BODY]);
  await execa('git', ['push', 'origin', BRANCH, '--force']);

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('please include a GITHUB_TOKEN');
  }

  try {
    // Open the pull request with the GITHUB_TOKEN
    await gaxios.request({
      method: 'POST',
      headers: {
        Authorization: `token ${githubToken}`,
      },
      url: `https://api.github.com/repos/${REPO}/pulls`,
      data: {
        title: COMMIT_MESSAGE,
        head: BRANCH,
        base: 'main',
        body: COMMIT_BODY,
      },
    });
  } catch (err) {
    console.error('failed to submit Pull Request:', err);
    if (err.response && err.response.data) {
      if (err.response.data.errors) {
        const errors = err.response.data.errors;
        const exists = errors.some(err =>
          err.message.includes('already exists')
        );
        if (!exists) {
          throw err;
        }
        console.log('PR already exists');
      }
    } else {
      throw err;
    }
  }
}

submitDiscoveryPR();
