# Changelog

[npm history][1]

[1]: https://www.npmjs.com/package/@google-cloud/bigquery?activeTab=versions

## v2.0.5

12-21-2018 13:19 PST

### Bug fixes
- fix: createQueryJob should accept pageToken ([#313](https://github.com/googleapis/nodejs-bigquery/pull/313))

### Internal / Testing Changes
- fix(test): skip flaky invalid etag test ([#317](https://github.com/googleapis/nodejs-bigquery/pull/317))
- fix(test): labels: should be an object, not arry ([#315](https://github.com/googleapis/nodejs-bigquery/pull/315))

## v2.0.4

12-19-2018 14:35 PST

### Implementation Changes
- fix(ts): explicit usage of Duplex ([#300](https://github.com/googleapis/nodejs-bigquery/pull/300))
- fix: fix typescript compilation ([#295](https://github.com/googleapis/nodejs-bigquery/pull/295))

### Dependencies
- fix(deps): update dependency @google-cloud/common to ^0.28.0 ([#308](https://github.com/googleapis/nodejs-bigquery/pull/308))
- chore(deps): update dependency @types/sinon to v7 ([#307](https://github.com/googleapis/nodejs-bigquery/pull/307))
- fix(deps): update dependency @google-cloud/common to ^0.27.0 ([#274](https://github.com/googleapis/nodejs-bigquery/pull/274))

### Documentation
- fix(docs): move doc comments so stream methods show up in docs correctly ([#309](https://github.com/googleapis/nodejs-bigquery/pull/309))

### Internal / Testing Changes
- chore(build): inject yoshi automation key ([#306](https://github.com/googleapis/nodejs-bigquery/pull/306))
- chore: update nyc and eslint configs ([#305](https://github.com/googleapis/nodejs-bigquery/pull/305))
- chore: fix publish.sh permission +x ([#302](https://github.com/googleapis/nodejs-bigquery/pull/302))
- fix(build): fix Kokoro release script ([#301](https://github.com/googleapis/nodejs-bigquery/pull/301))
- build: add Kokoro configs for autorelease ([#298](https://github.com/googleapis/nodejs-bigquery/pull/298))

## v2.0.3

12-06-2018 17:10 PST

### Documentation
- fix(docs): move comments above last overload ([#292](https://github.com/googleapis/nodejs-bigquery/pull/292))
- fix(docs): internal links ([#293](https://github.com/googleapis/nodejs-bigquery/pull/293))
- fix(docs): change source location to ./build for ts project ([#291](https://github.com/googleapis/nodejs-bigquery/pull/291))
- docs: fix region tag placement typo ([#286](https://github.com/googleapis/nodejs-bigquery/pull/286))

### Internal / Testing Changes
- chore: always nyc report before calling codecov ([#290](https://github.com/googleapis/nodejs-bigquery/pull/290))
- chore: nyc ignore build/test by default ([#289](https://github.com/googleapis/nodejs-bigquery/pull/289))

## v2.0.2

12-04-2018 14:04 PST

### Implementation Changes

*TypeScript related changes:*
- fix: Changing import of Big from big.js so it doesn't use default ([#270](https://github.com/googleapis/nodejs-bigquery/pull/270))
- refactor(ts): enable noImplicitAny ([#259](https://github.com/googleapis/nodejs-bigquery/pull/259))
- refactor(ts): add @types/proxyquire ([#256](https://github.com/googleapis/nodejs-bigquery/pull/256))
- refactor(ts): refactor system tests to drop unused deps ([#254](https://github.com/googleapis/nodejs-bigquery/pull/254))
- fix(ts): CopyTableMetadata type can’t receive optional values
- refactor(ts): complete type annotations for src ([#250](https://github.com/googleapis/nodejs-bigquery/pull/250))
- refactor(ts): add more types ([#246](https://github.com/googleapis/nodejs-bigquery/pull/246))

### Dependencies
- fix: Pin @types/sinon to last compatible version ([#267](https://github.com/googleapis/nodejs-bigquery/pull/267))
- chore(deps): update dependency typescript to ~3.2.0 ([#276](https://github.com/googleapis/nodejs-bigquery/pull/276))
- chore(deps): update dependency gts to ^0.9.0 ([#263](https://github.com/googleapis/nodejs-bigquery/pull/263))
- chore(deps): update dependency @google-cloud/nodejs-repo-tools to v3 ([#261](https://github.com/googleapis/nodejs-bigquery/pull/261))
- chore(deps): update dependency @types/is to v0.0.21 ([#258](https://github.com/googleapis/nodejs-bigquery/pull/258))

### Documentation
- chore: update license file ([#283](https://github.com/googleapis/nodejs-bigquery/pull/283))
- docs: Improve timestamp documentation. ([#280](https://github.com/googleapis/nodejs-bigquery/pull/280))
- docs: Improve documentationfor load method ([#281](https://github.com/googleapis/nodejs-bigquery/pull/281))
- docs: update readme badges ([#279](https://github.com/googleapis/nodejs-bigquery/pull/279))
- refactor(samples): replace promise with async await ([#268](https://github.com/googleapis/nodejs-bigquery/pull/268))

### Internal / Testing Changes
- fix(build): fix system key decryption ([#277](https://github.com/googleapis/nodejs-bigquery/pull/277))
- refactor(tests): convert samples tests from ava to mocha ([#248](https://github.com/googleapis/nodejs-bigquery/pull/248))
- chore: add synth.metadata
- chore: update eslintignore config ([#262](https://github.com/googleapis/nodejs-bigquery/pull/262))
- chore: drop contributors from multiple places ([#260](https://github.com/googleapis/nodejs-bigquery/pull/260))
- chore: use latest npm on Windows ([#257](https://github.com/googleapis/nodejs-bigquery/pull/257))
- chore: update CircleCI config ([#249](https://github.com/googleapis/nodejs-bigquery/pull/249))

## v2.0.1

### Bug fixes
- fix: use teeny-request for HTTP requests ([#244](https://github.com/googleapis/nodejs-bigquery/pull/244))

### Internal / Testing Changes
- chore: include build in eslintignore ([#240](https://github.com/googleapis/nodejs-bigquery/pull/240))
- refactor(ts): enable noImplicitThis in the tsconfig ([#237](https://github.com/googleapis/nodejs-bigquery/pull/237))
- refactor(ts): improve typing ([#241](https://github.com/googleapis/nodejs-bigquery/pull/241))

## v2.0.0

### Implementation Changes
*This release drops support for Node.js 4.x and 9.x. Future releases might not be compatible with your application if they are still on these non-LTS version.*
*BREAKING CHANGE* This library is now compatible with es module import syntax


#### Old Code
```js
const BigQuery = require('@google-cloud/bigquery')();
// or...
const BigQuery = require('@google-cloud/bigquery');
const bq = new BigQuery();
```

#### New Code
```js
const {BigQuery} = require('@google-cloud/bigquery');
const bq = new BigQuery();
```

- refactor(typescript): convert index to es module ([#227](https://github.com/googleapis/nodejs-bigquery/pull/227)
- fix: drop support for node.js 4.x and 9.x ([#142](https://github.com/googleapis/nodejs-bigquery/pull/142))
- wait for job result before emitting complete. ([#85](https://github.com/googleapis/nodejs-bigquery/pull/85))
- fix: Update table.js ([#78](https://github.com/googleapis/nodejs-bigquery/pull/78))
- feat: convert to TypeScript ([#157](https://github.com/googleapis/nodejs-bigquery/pull/157))
- Correctly pass `autoPaginate: false` to query methods. ([#121](https://github.com/googleapis/nodejs-bigquery/pull/121))
- chore: use more arrow functions ([#172](https://github.com/googleapis/nodejs-bigquery/pull/172))
- chore: convert a few files to es classes ([#170](https://github.com/googleapis/nodejs-bigquery/pull/170))

### New Features
BigQuery ORC:
- BigQuery Orc & Parquet Samples ([#195](https://github.com/googleapis/nodejs-bigquery/pull/195))
- Support ORC files. ([#190](https://github.com/googleapis/nodejs-bigquery/pull/190))

### Dependencies
- chore(deps): update dependency eslint-plugin-node to v8 ([#234](https://github.com/googleapis/nodejs-bigquery/pull/234))
- chore(deps): lock file maintenance ([#143](https://github.com/googleapis/nodejs-bigquery/pull/143))
- chore(deps): update dependency sinon to v7 ([#212](https://github.com/googleapis/nodejs-bigquery/pull/212))
- chore(deps): update dependency eslint-plugin-prettier to v3 ([#207](https://github.com/googleapis/nodejs-bigquery/pull/207))
- chore(deps): update dependency typescript to ~3.1.0 ([#205](https://github.com/googleapis/nodejs-bigquery/pull/205))
- chore: upgrade to the latest common ([#159](https://github.com/googleapis/nodejs-bigquery/pull/159))
- chore(package): update to the latest @google-cloud/common ([#146](https://github.com/googleapis/nodejs-bigquery/pull/146))
- fix(deps): update dependency @google-cloud/common to ^0.25.0 ([#197](https://github.com/googleapis/nodejs-bigquery/pull/197))
- fix(deps): update dependency @google-cloud/common to ^0.24.0 ([#187](https://github.com/googleapis/nodejs-bigquery/pull/187))
- fix(deps): update dependency @google-cloud/storage to v2: edited ([#181](https://github.com/googleapis/nodejs-bigquery/pull/181))
- chore(deps): update dependency nyc to v13 ([#178](https://github.com/googleapis/nodejs-bigquery/pull/178))
- chore(deps): update dependency eslint-config-prettier to v3 ([#169](https://github.com/googleapis/nodejs-bigquery/pull/169))
- chore(deps): lock file maintenance ([#160](https://github.com/googleapis/nodejs-bigquery/pull/160))
- chore(deps): lock file maintenance ([#153](https://github.com/googleapis/nodejs-bigquery/pull/153))
- chore(deps): lock file maintenance ([#150](https://github.com/googleapis/nodejs-bigquery/pull/150))
- chore(deps): update dependency eslint-plugin-node to v7 ([#148](https://github.com/googleapis/nodejs-bigquery/pull/148))
- chore(deps): lock file maintenance ([#147](https://github.com/googleapis/nodejs-bigquery/pull/147))
- chore(deps): lock file maintenance ([#145](https://github.com/googleapis/nodejs-bigquery/pull/145))
- chore(deps): lock file maintenance ([#144](https://github.com/googleapis/nodejs-bigquery/pull/144))
- chore(deps): lock file maintenance ([#141](https://github.com/googleapis/nodejs-bigquery/pull/141))
- chore(deps): lock file maintenance ([#140](https://github.com/googleapis/nodejs-bigquery/pull/140))
- chore(deps): lock file maintenance ([#139](https://github.com/googleapis/nodejs-bigquery/pull/139))
- chore(deps): update dependency proxyquire to v2 ([#135](https://github.com/googleapis/nodejs-bigquery/pull/135))
- fix(deps): update dependency yargs to v12 ([#138](https://github.com/googleapis/nodejs-bigquery/pull/138))
- fix(deps): update dependency yargs to v11 ([#137](https://github.com/googleapis/nodejs-bigquery/pull/137))
- chore(deps): update dependency sinon to v6 ([#136](https://github.com/googleapis/nodejs-bigquery/pull/136))
- chore(deps): update dependency nyc to v12 ([#134](https://github.com/googleapis/nodejs-bigquery/pull/134))
- chore(deps): update dependency @google-cloud/nodejs-repo-tools to v2.3.0 ([#128](https://github.com/googleapis/nodejs-bigquery/pull/128))
- chore(deps): update dependency uuid to v3.3.0 ([#132](https://github.com/googleapis/nodejs-bigquery/pull/132))
- chore(deps): update dependency ava to v0.25.0 ([#129](https://github.com/googleapis/nodejs-bigquery/pull/129))
- chore(deps): update dependency sinon to v4.5.0 ([#131](https://github.com/googleapis/nodejs-bigquery/pull/131))

### Documentation
- docs: Correct table.load().format options. ([#206](https://github.com/googleapis/nodejs-bigquery/pull/206))
- fix: (docs): Correct query syntax. ([#180](https://github.com/googleapis/nodejs-bigquery/pull/180))
- docs: Fix create job links ([#164](https://github.com/googleapis/nodejs-bigquery/pull/164))
- fix(samples): Refactor query samples to follow python canonical and add disable cache sample ([#215](https://github.com/googleapis/nodejs-bigquery/pull/215))
- chore(samples): Remove unused BigQuery samples and fix comment typos ([#201](https://github.com/googleapis/nodejs-bigquery/pull/201))
- Use async/await in samples ([#193](https://github.com/googleapis/nodejs-bigquery/pull/193))
- remove asserts in samples ([#182](https://github.com/googleapis/nodejs-bigquery/pull/182))
- fix: fix the samples tests ([#167](https://github.com/googleapis/nodejs-bigquery/pull/167))
- fix: update linking for samples ([#125](https://github.com/googleapis/nodejs-bigquery/pull/125))
- chore: make samples test work ([#113](https://github.com/googleapis/nodejs-bigquery/pull/113))

### Internal / Testing Changes
- refactor(ts): re-enable fix and lint ([#232](https://github.com/googleapis/nodejs-bigquery/pull/232))
- fix(tests): fix system-test ([#231](https://github.com/googleapis/nodejs-bigquery/pull/231))
- Pass an empty object. ([#191](https://github.com/googleapis/nodejs-bigquery/pull/191))
- fix: (tests) Use a filter to locate datasets used in tests. ([#177](https://github.com/googleapis/nodejs-bigquery/pull/177))
- chore: update issue templates ([#229](https://github.com/googleapis/nodejs-bigquery/pull/229))
- chore: remove old issue template ([#224](https://github.com/googleapis/nodejs-bigquery/pull/224))
- build: run tests on node11 ([#223](https://github.com/googleapis/nodejs-bigquery/pull/223))
- chores(build): do not collect sponge.xml from windows builds ([#221](https://github.com/googleapis/nodejs-bigquery/pull/221))
- chores(build): run codecov on continuous builds ([#220](https://github.com/googleapis/nodejs-bigquery/pull/220))
- chore: update new issue template ([#219](https://github.com/googleapis/nodejs-bigquery/pull/219))
- build: fix codecov uploading on Kokoro ([#213](https://github.com/googleapis/nodejs-bigquery/pull/213))
- Update kokoro config ([#208](https://github.com/googleapis/nodejs-bigquery/pull/208))
- Don't publish sourcemaps ([#202](https://github.com/googleapis/nodejs-bigquery/pull/202))
- test: remove appveyor config ([#200](https://github.com/googleapis/nodejs-bigquery/pull/200))
- Enable prefer-const in the eslint config ([#198](https://github.com/googleapis/nodejs-bigquery/pull/198))
- Enable no-var in eslint ([#196](https://github.com/googleapis/nodejs-bigquery/pull/196))
- Retry npm install in CI ([#184](https://github.com/googleapis/nodejs-bigquery/pull/184))
- chore: make ci happy ([#175](https://github.com/googleapis/nodejs-bigquery/pull/175))
- chore: use let and const ([#161](https://github.com/googleapis/nodejs-bigquery/pull/161))
- chore: ignore package-lock.json ([#162](https://github.com/googleapis/nodejs-bigquery/pull/162))
- chore: update renovate config ([#156](https://github.com/googleapis/nodejs-bigquery/pull/156))
- remove that whitespace ([#155](https://github.com/googleapis/nodejs-bigquery/pull/155))
- chore: move mocha options to mocha.opts ([#152](https://github.com/googleapis/nodejs-bigquery/pull/152))
- refactor: use @google-cloud/promisify ([#151](https://github.com/googleapis/nodejs-bigquery/pull/151))
- fix: get eslint passing ([#149](https://github.com/googleapis/nodejs-bigquery/pull/149))
- Configure Renovate ([#123](https://github.com/googleapis/nodejs-bigquery/pull/123))
- chore(package): update eslint to version 5.0.0 ([#124](https://github.com/googleapis/nodejs-bigquery/pull/124))
- refactor: drop repo-tool as an exec wrapper ([#127](https://github.com/googleapis/nodejs-bigquery/pull/127))
- chore: update sample lockfiles ([#126](https://github.com/googleapis/nodejs-bigquery/pull/126))
- fix: drop support for node 4.x and 9.x ([#122](https://github.com/googleapis/nodejs-bigquery/pull/122))
- Added support for the NUMERIC values. ([#119](https://github.com/googleapis/nodejs-bigquery/pull/119))
- chore(package): update nyc to version 12.0.2 ([#116](https://github.com/googleapis/nodejs-bigquery/pull/116))
- chore: the ultimate fix for repo-tools EPERM ([#108](https://github.com/googleapis/nodejs-bigquery/pull/108))
- chore: fix prettier incompatibility ([#112](https://github.com/googleapis/nodejs-bigquery/pull/112))
- chore: lock files maintenance ([#111](https://github.com/googleapis/nodejs-bigquery/pull/111))
- chore: lock files ([#109](https://github.com/googleapis/nodejs-bigquery/pull/109))
- chore: timeout for system test ([#107](https://github.com/googleapis/nodejs-bigquery/pull/107))
- chore: lock files maintenance ([#106](https://github.com/googleapis/nodejs-bigquery/pull/106))

