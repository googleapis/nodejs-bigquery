# Changelog

[npm history][1]

[1]: https://www.npmjs.com/package/@google-cloud/bigquery?activeTab=versions

### [4.1.8](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.7...v4.1.8) (2019-08-02)


### Bug Fixes

* allow calls with no request, add JSON proto ([885a98a](https://www.github.com/googleapis/nodejs-bigquery/commit/885a98a))

### [4.1.7](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.6...v4.1.7) (2019-08-01)


### Bug Fixes

* **docs:** duplicate readme sample names ([#512](https://www.github.com/googleapis/nodejs-bigquery/issues/512)) ([56040f5](https://www.github.com/googleapis/nodejs-bigquery/commit/56040f5))
* **docs:** fix formatting of the docs ([#513](https://www.github.com/googleapis/nodejs-bigquery/issues/513)) ([d823014](https://www.github.com/googleapis/nodejs-bigquery/commit/d823014))

### [4.1.6](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.5...v4.1.6) (2019-07-29)


### Bug Fixes

* **deps:** update dependency @google-cloud/storage to v3 ([#508](https://www.github.com/googleapis/nodejs-bigquery/issues/508)) ([bdca2ea](https://www.github.com/googleapis/nodejs-bigquery/commit/bdca2ea))

### [4.1.5](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.4...v4.1.5) (2019-07-17)


### Performance Improvements

* pull in paginator refactor ([#499](https://www.github.com/googleapis/nodejs-bigquery/issues/499)) ([8daafcc](https://www.github.com/googleapis/nodejs-bigquery/commit/8daafcc))

### [4.1.4](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.3...v4.1.4) (2019-07-02)


### Bug Fixes

* **docs:** link to reference docs section on googleapis.dev ([#486](https://www.github.com/googleapis/nodejs-bigquery/issues/486)) ([a76cc5b](https://www.github.com/googleapis/nodejs-bigquery/commit/a76cc5b))

### [4.1.3](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.2...v4.1.3) (2019-06-17)


### Bug Fixes

* **docs:** move to new client docs URL ([#479](https://www.github.com/googleapis/nodejs-bigquery/issues/479)) ([7db57d2](https://www.github.com/googleapis/nodejs-bigquery/commit/7db57d2))

### [4.1.2](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.1...v4.1.2) (2019-06-11)


### Bug Fixes

* link to new googleapis.dev docs ([#477](https://www.github.com/googleapis/nodejs-bigquery/issues/477)) ([9dfcda0](https://www.github.com/googleapis/nodejs-bigquery/commit/9dfcda0))

### [4.1.1](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.1.0...v4.1.1) (2019-05-30)


### Bug Fixes

* **job:** remove job instance from request params ([#465](https://www.github.com/googleapis/nodejs-bigquery/issues/465)) ([27f080d](https://www.github.com/googleapis/nodejs-bigquery/commit/27f080d))
* correct name in .repo-metadata.json ([#467](https://www.github.com/googleapis/nodejs-bigquery/issues/467)) ([6add722](https://www.github.com/googleapis/nodejs-bigquery/commit/6add722))

## [4.1.0](https://www.github.com/googleapis/nodejs-bigquery/compare/v4.0.0...v4.1.0) (2019-05-29)


### Features

* **model:** dataset model support ([#449](https://www.github.com/googleapis/nodejs-bigquery/issues/449)) ([3ad884f](https://www.github.com/googleapis/nodejs-bigquery/commit/3ad884f))
* accept apiEndpoint override ([#455](https://www.github.com/googleapis/nodejs-bigquery/issues/455)) ([1eda8ff](https://www.github.com/googleapis/nodejs-bigquery/commit/1eda8ff))

## [4.0.0](https://www.github.com/googleapis/nodejs-bigquery/compare/v3.0.0...v4.0.0) (2019-05-20)


### ⚠ BREAKING CHANGES

* **deps:** this will ship async/await with the generated code.
* upgrade engines field to >=8.10.0 (#424)
* This removes the `autoCreate` option which may result in a breaking change for TypeScript users.

### Bug Fixes

* **deps:** update dependency @google-cloud/common to ^0.32.0 ([8e28b62](https://www.github.com/googleapis/nodejs-bigquery/commit/8e28b62)), closes [#8203](https://www.github.com/googleapis/nodejs-bigquery/issues/8203)
* **deps:** update dependency @google-cloud/common to v1 ([#434](https://www.github.com/googleapis/nodejs-bigquery/issues/434)) ([0e4aeef](https://www.github.com/googleapis/nodejs-bigquery/commit/0e4aeef))
* **deps:** update dependency @google-cloud/paginator to v1 ([#428](https://www.github.com/googleapis/nodejs-bigquery/issues/428)) ([5d925af](https://www.github.com/googleapis/nodejs-bigquery/commit/5d925af))
* **deps:** update dependency @google-cloud/promisify to v1 ([#427](https://www.github.com/googleapis/nodejs-bigquery/issues/427)) ([fdeb862](https://www.github.com/googleapis/nodejs-bigquery/commit/fdeb862))
* **deps:** update dependency arrify to v2 ([de0f687](https://www.github.com/googleapis/nodejs-bigquery/commit/de0f687))
* **table:** allow for TableSchema to be used ([#438](https://www.github.com/googleapis/nodejs-bigquery/issues/438)) ([7995be0](https://www.github.com/googleapis/nodejs-bigquery/commit/7995be0))
* **types:** correct  interface ([#407](https://www.github.com/googleapis/nodejs-bigquery/issues/407)) ([da5ed01](https://www.github.com/googleapis/nodejs-bigquery/commit/da5ed01))
* correctly encode nested struct/array params ([#439](https://www.github.com/googleapis/nodejs-bigquery/issues/439)) ([d7006bd](https://www.github.com/googleapis/nodejs-bigquery/commit/d7006bd))
* remove teeny-request as a direct dependency ([#412](https://www.github.com/googleapis/nodejs-bigquery/issues/412)) ([c6de54a](https://www.github.com/googleapis/nodejs-bigquery/commit/c6de54a))


### Build System

* upgrade engines field to >=8.10.0 ([#424](https://www.github.com/googleapis/nodejs-bigquery/issues/424)) ([cea017e](https://www.github.com/googleapis/nodejs-bigquery/commit/cea017e))


### Code Refactoring

* drop autoCreate in table.insert in favor of schema ([#421](https://www.github.com/googleapis/nodejs-bigquery/issues/421)) ([b59cd7f](https://www.github.com/googleapis/nodejs-bigquery/commit/b59cd7f))


### Miscellaneous Chores

* **deps:** update dependency gts to v1 ([#419](https://www.github.com/googleapis/nodejs-bigquery/issues/419)) ([7b0e76a](https://www.github.com/googleapis/nodejs-bigquery/commit/7b0e76a))

## v3.0.0

04-02-2019 10:02 PDT


### Implementation Changes

- fix(job): check for `errorResult` when polling jobs ([#387](https://github.com/googleapis/nodejs-bigquery/pull/387))


**BREAKING CHANGE** Previously when polling a BigQuery Job the Node.js client would check for the presence of the `errors` field when trying to determine if the job suceeded. We have since changed this logic to instead check for the `errorResult` field. This is significant because the `errors` array may now be present for passing jobs, however these errors should serve more as warnings. If your application logic depended on this functionality you'll need to manually check for `errors` now.

```js
await job.promise();

if (job.metadata.status.errors) {
  // optionally handle warnings
}
```

- fix(ts): provide complete and correct types ([#385](https://github.com/googleapis/nodejs-bigquery/pull/385))

**BREAKING CHANGE** A number of the BigQuery TypeScript types were incomplete, this change provides more complete types for the entire client.

### New Features
- feat(geo): add support for geography ([#397](https://github.com/googleapis/nodejs-bigquery/pull/397))

### Bug Fixes
- fix: correctly encode nested custom date/time parameters ([#393](https://github.com/googleapis/nodejs-bigquery/pull/393))

### Dependencies
- chore(deps): update dependency tmp to v0.1.0 ([#398](https://github.com/googleapis/nodejs-bigquery/pull/398))
- chore(deps): update dependency @types/tmp to v0.1.0
- chore(deps): update dependency typescript to ~3.4.0

### Documentation
- docs(samples): adds queryParamsNamed and queryParamsPositional ([#381](https://github.com/googleapis/nodejs-bigquery/pull/381))
- refactor(samples): split query and table samples into separate files ([#384](https://github.com/googleapis/nodejs-bigquery/pull/384))
- refactor(samples): fix loadJSONFromGCSTruncate wrong function ([#386](https://github.com/googleapis/nodejs-bigquery/pull/386))
- refactor(samples): add main() function wrappers to samples

### Internal / Testing Changes
- build: use per-repo npm publish token ([#382](https://github.com/googleapis/nodejs-bigquery/pull/382))
- chore: publish to npm using wombat ([#390](https://github.com/googleapis/nodejs-bigquery/pull/390))
- fix(tests): update TIMESTAMP param tests ([#394](https://github.com/googleapis/nodejs-bigquery/pull/394))

## v2.1.0

03-12-2019 15:30 PDT

### New Features
- feat: throw errors for missing resource ids ([#342](https://github.com/googleapis/nodejs-bigquery/pull/342))

### Bug Fixes
- fix(types): move JobLoadMetadata writeDisposition ([#365](https://github.com/googleapis/nodejs-bigquery/pull/365))
- fix(types): Allow views to be configured using an object or a string ([#333](https://github.com/googleapis/nodejs-bigquery/pull/333))
- fix(types): add missing parameters (selectedFields, startIndex) in table.getRows() options ([#331](https://github.com/googleapis/nodejs-bigquery/pull/331))

### Dependencies
- fix(deps): update dependency @google-cloud/paginator to ^0.2.0 ([#373](https://github.com/googleapis/nodejs-bigquery/pull/373))
- fix(deps): update dependency @google-cloud/common to ^0.31.0 ([#371](https://github.com/googleapis/nodejs-bigquery/pull/371))
- fix(deps): update dependency @google-cloud/promisify to ^0.4.0 ([#356](https://github.com/googleapis/nodejs-bigquery/pull/356))
- fix(deps): update dependency duplexify to v4 ([#343](https://github.com/googleapis/nodejs-bigquery/pull/343))

### Documentation
- docs(table): link to upstream limit docs ([#376](https://github.com/googleapis/nodejs-bigquery/pull/376))
- docs: update samples and docs to match rubric ([#374](https://github.com/googleapis/nodejs-bigquery/pull/374))
- docs: update links in contrib guide ([#358](https://github.com/googleapis/nodejs-bigquery/pull/358))
- docs: update contributing path in README ([#350](https://github.com/googleapis/nodejs-bigquery/pull/350))
- docs: move CONTRIBUTING.md to root ([#349](https://github.com/googleapis/nodejs-bigquery/pull/349))
- docs: add lint/fix example to contributing guide ([#344](https://github.com/googleapis/nodejs-bigquery/pull/344))

### Internal / Testing Changes
- testing: remove nextQuery assertion ([#377](https://github.com/googleapis/nodejs-bigquery/pull/377))
- refactor(samples): split samples into their own files ([#368](https://github.com/googleapis/nodejs-bigquery/pull/368))
- build: Add docuploader credentials to node publish jobs ([#370](https://github.com/googleapis/nodejs-bigquery/pull/370))
- build: use node10 to run samples-test, system-test etc ([#369](https://github.com/googleapis/nodejs-bigquery/pull/369))
- build: system-tests only delete stale resources
- chore: make test prefix unique per run ([#363](https://github.com/googleapis/nodejs-bigquery/pull/363))
- chore(deps): update dependency mocha to v6 ([#360](https://github.com/googleapis/nodejs-bigquery/pull/360))
- test: skip installation test if GOOGLE_CLOUD_TESTS_IN_VPCSC is passed ([#345](https://github.com/googleapis/nodejs-bigquery/pull/345))
- build: use linkinator for docs test ([#354](https://github.com/googleapis/nodejs-bigquery/pull/354))
- fix(deps): update dependency yargs to v13 ([#353](https://github.com/googleapis/nodejs-bigquery/pull/353))
- chore(deps): update dependency @types/tmp to v0.0.34 ([#355](https://github.com/googleapis/nodejs-bigquery/pull/355))
- build: create docs test npm scripts ([#352](https://github.com/googleapis/nodejs-bigquery/pull/352))
- build: test using @grpc/grpc-js in CI ([#351](https://github.com/googleapis/nodejs-bigquery/pull/351))
- build: check for 404s in the docs ([#337](https://github.com/googleapis/nodejs-bigquery/pull/337))
- build: output benchmark data in csv format ([#339](https://github.com/googleapis/nodejs-bigquery/pull/339))
- chore(deps): update dependency eslint-config-prettier to v4 ([#338](https://github.com/googleapis/nodejs-bigquery/pull/338))

## v2.0.6

01-08-2019 13:52 PST

### Fixes
- fix: correctly iterate query results within stream ([#323](https://github.com/googleapis/nodejs-bigquery/pull/323))
- fix: remove Job.setMetadata method ([#319](https://github.com/googleapis/nodejs-bigquery/pull/319))
- fix(deps): update dependency @google-cloud/common to ^0.29.0 ([#314](https://github.com/googleapis/nodejs-bigquery/pull/314))

### Documentation
- fix(docs): package exports an object, not the BigQuery ctor ([#322](https://github.com/googleapis/nodejs-bigquery/pull/322))
- docs: regenerate README.md ([#321](https://github.com/googleapis/nodejs-bigquery/pull/321))

### Internal / Testing Changes
- refactor: modernize the sample tests ([#318](https://github.com/googleapis/nodejs-bigquery/pull/318))

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
