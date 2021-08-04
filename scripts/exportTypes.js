/*!
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
This little utility recognizes the TypeScript types defined in the input folder
and automatically updates the exports in the specified output file.

usage:

node node scripts/exportTypes ./src ./src/index.ts types.d.ts index.ts
  This captures the type definitions in ./src, writes to ./src/index.ts, and skips types.d.ts and index.ts.
*/

const fs = require('fs');

const regex = new RegExp(/export (((class|interface|type|const) \w*)|{\w+})/g);
const COPYRIGHT_REGEX = new RegExp(/\/\*(.|\r|\s|\t)*?\*\/{1}/);
let newText = '';

async function main(args) {
  const filePath = args.shift();
  const outputFile = args.shift();

  fs.readdir(filePath, (err, files) => {
    const indexContents = fs.readFileSync(outputFile, 'utf8');
    const copyright = indexContents.match(COPYRIGHT_REGEX)
      ? indexContents.match(COPYRIGHT_REGEX)[0]
      : '';
    newText += copyright;

    // Files to skip
    for (const fn of args) {
      files.splice(files.indexOf(fn), 1);
    }

    const seen = [];
    for (const fileName of files) {
      const unique = new Set();
      // Skip if not .ts file.
      if (!fileName.endsWith('.ts')) {
        continue;
      }
      // Read file contents.
      const path = `${filePath}/${fileName}`;
      const contents = fs.readFileSync(path, 'utf8');
      // Match TypeScript type definition statements.
      let statements = contents.match(regex) || [];
      statements = statements
        .map(e => {
          return e.split(/\W/)[2];
        })
        .sort();
      for (const statement of statements) {
        // Add type to collection if it hasn't already been seen.
        if (!seen.includes(statement)) {
          unique.add(statement);
          seen.push(statement);
        }
      }
      if (unique.size > 0) {
        statements = Array.from(unique).join(',\n');
        // statements = statements.join(',\n');
        // Build export statement.
        const template = `export {\n${statements}\n} from './${fileName.replace(
          '.ts',
          ''
        )}';`;
        newText += `\n\n${template}`;
      }
    }
    fs.writeFileSync(outputFile, newText);
  });
}

main(Array.from(process.argv).slice(2)).catch(e => {
  console.error(e);
  process.exitCode = 1;
});
