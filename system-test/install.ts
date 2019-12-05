// Copyright 2014 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as execa from 'execa';
import * as mv from 'mv';
import {ncp} from 'ncp';
import * as tmp from 'tmp';
import {promisify} from 'util';

const RUNNING_IN_VPCSC = !!process.env['GOOGLE_CLOUD_TESTS_IN_VPCSC'];

const mvp = (promisify(mv) as {}) as (...args: string[]) => Promise<void>;
const ncpp = promisify(ncp);
const stagingDir = tmp.dirSync({unsafeCleanup: true});
const stagingPath = stagingDir.name;
const pkg = require('../../package.json');

describe('Installation test', () => {
  before(function() {
    if (RUNNING_IN_VPCSC) this.skip();
  });

  /**
   * CLEAN UP - remove the staging directory when done.
   */
  after('cleanup staging', () => stagingDir.removeCallback());

  it('should be able to use the d.ts', async () => {
    console.log(`${__filename} staging area: ${stagingPath}`);
    await execa('npm', ['pack'], {stdio: 'inherit'});
    const tarball = `google-cloud-bigquery-${pkg.version}.tgz`;
    await mvp(tarball, `${stagingPath}/google-cloud-bigquery.tgz`);
    await ncpp('system-test/fixtures/kitchen', `${stagingPath}/`);
    await execa('npm', ['install'], {cwd: `${stagingPath}/`, stdio: 'inherit'});
  }).timeout(40000);
});
