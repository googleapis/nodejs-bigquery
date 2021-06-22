// const outputFile = './src/index.ts'
const fs = require('fs');

const regex = new RegExp(/export (((class|interface|type|const) \w*)|{\w+})/g);
const COPYRIGHT_REGEX = new RegExp(/\/\*(.|\r|\s|\t)*?\*\/{1}/);
let newText = '';

async function main(args) {
  const filePath = args.shift();
  const outputFile = args.shift();

  fs.readdir(filePath, (err, files) => {
    const indexContents = fs.readFileSync(outputFile, 'utf8');
    const copyright = indexContents.match(COPYRIGHT_REGEX) ? indexContents.match(COPYRIGHT_REGEX)[0] : '';
    newText += copyright;

    // Files to skip
    for (const fn of args) {
      files.splice(files.indexOf(fn), 1);
    }

    const seen = [];
    for (const fileName of files) {
      const unique = [];
      const path = `${filePath}/${fileName}`;
      const contents = fs.readFileSync(path, 'utf8');
      let statements = contents.match(regex) || [];
      statements = statements
        .map(e => {
          e = e.split(/\W/);
          // console.log(e);
          return e[2];
        })
        .sort();
      // console.log(statements);
      for (const statement of statements) {
        if (!seen.includes(statement)) {
          unique.push(statement);
          seen.push(statement);
        }
      }
      if (unique.length > 0) {
        statements = unique.join(',\n');
        const template = `export {\n${statements}\n} from './${fileName.replace(
          '.ts',
          ''
        )}'`;
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