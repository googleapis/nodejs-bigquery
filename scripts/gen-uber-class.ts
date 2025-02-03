import * as ts from 'typescript';
const fs = require('fs');
// TODO: maintainer - if a new client is added, add it to this list

// Intentionally not surfacing projectServiceClient - it has methods that do not follow these patterns
const clients = [
  'DatasetServiceClient',
  'TableServiceClient',
  'JobServiceClient',
  'ModelServiceClient',
  'RoutineServiceClient',
  'RowAccessPolicyServiceClient',
];
const files = [
  '../src/v2/dataset_service_client.ts',
  '../src/v2/table_service_client.ts',
  '../src/v2/job_service_client.ts',
  '../src/v2/model_service_client.ts',
  '../src/v2/routine_service_client.ts',
  '../src/v2/row_access_policy_service_client.ts',
];
const output = `
// /*!
//  * Copyright 2025 Google LLC
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */
`;
let foundNodes = [];
function extract(node: ts.Node, depth = 0, client): void {
  // Create a Program to represent the project, then pull out the
  // source file to parse its AST.

  function getKind(node: ts.Node) {
    return ts.SyntaxKind[node.kind];
  }
  const thingsWeCareAbout = ['MethodDeclaration'];
  const kind = getKind(node);
  if (thingsWeCareAbout.includes(kind)) {
    if (ts.isMethodDeclaration(node)) {
      // this typecasting has to be done because the name of a MethodDeclaration
      // can be one of a few different types but in our use case we know it's an identifier
      // and can therefore safely make this assumption to get the human readable name
      const name = node.name as ts.Identifier;
      const nameEscapedText = name.escapedText as string;

      // full implementation (not overload) of crud method for client
      if (node.body && nameEscapedText.search(client) > 0) {
        // type is the node.type and we can deal with union types later
        foundNodes.push([node.name, node]);
      }
    }
  }
  // Loop through the root AST nodes of the file
  ts.forEachChild(node, childNode => {
    extract(childNode, depth + 1, client);
  });
}

function ast(file, client) {
  let output = '';
  const program = ts.createProgram([file], {allowJs: true});
  const sourceFile = program.getSourceFile(file);

  // Run the extract function with the script's arguments
  extract(sourceFile!, undefined, client);
  // Either print the found nodes, or offer a list of what identifiers were found
  const checker = program.getTypeChecker();

  foundNodes.map(f => {
    const [name, node] = f;
    // create function name
    const functionName = `${name.escapedText}`;
    if (functionName.search('Stream')<0 && functionName.search('Async')<0){
    output = output.concat(`\n\t${functionName}(`);
    // add parameters
    let parametersList = '';
    let argumentsList = '';
    for (let i = 0; i < node.parameters.length; i++) {
      const name = node.parameters[i].name.escapedText;
      const typeString = node.parameters[i].type.getFullText();
      let parameter = `${name}: ${typeString}`;
      parametersList = parametersList.concat(name);
      // this has to do with function overloading - we will later surface code
      // that does type checking for options and callback
      if (name === 'optionsOrCallback') {
        argumentsList = argumentsList.concat('options');
      } else {
        argumentsList = argumentsList.concat(name);
      }
      if (i !== node.parameters.length - 1) {
        parameter += ', ';
        parametersList += ', ';
        argumentsList += ', ';
      }
      output = output.concat(`\n\t\t${parameter}`);
    }
    output = output.concat(')');
    // add return type

    const returnType = node.type!.getFullText();
    output = output.concat(`:${returnType}`);
    // call underlying client function
    if (node.body) {
      // this logic needs to be surfaced from underlying clients
      // to make sure our parameters play nicely with underlying overloads
      // otherwise you will run into issues similar to https://github.com/microsoft/TypeScript/issues/1805
      const optionsOrCallback = `
            let options: CallOptions;
            if (typeof optionsOrCallback === 'function' && callback === undefined) {
                callback = optionsOrCallback;
                options = {};
            }
            else {
                options = optionsOrCallback as CallOptions;
            }`;
      output = output.concat(
        `{\n${optionsOrCallback}\n\t\tthis.${client.toLowerCase()}Client.${functionName}(${argumentsList})\n\t}`
      );
    }
}
  });

  return output;
}

function astHelper(files, clients) {
  let output = '';
  for (const f in files) {
    foundNodes = [];
    const client = clients[f].split('Service')[0];
    output = output.concat(ast(files[f], client));
  }
  return output;
}

// TODO - make dynamic
function makeImports(clients) {
  let imports = 'import {protos';
  for (const client in clients) {
    imports = imports.concat(`, ${clients[client]}`);
  }

  imports = imports.concat('} from ".";\n');
  imports = imports.concat(
    'import {Callback, CallOptions, PaginationCallback} from "google-gax";\n'
  );
  return imports;
}

// convert client types to the names we'll use for variables
function parseClientName(client) {
  return client.split('ServiceClient')[0].toLowerCase() + 'Client';
}

// TODO modify to be able to pass option to subclients
function buildClientConstructor(clients) {
  let variableDecl = '';
  // TODO - deal with any, which has to do with options passing
  let constructorInitializers = '\tconstructor(options:any){\n';
  for (const client in clients) {
    const clientName = parseClientName(clients[client]);
    variableDecl = variableDecl.concat(
      `\t${clientName}: ${clients[client]};\n`
    );
    constructorInitializers = constructorInitializers.concat(
      `\t\tthis.${clientName} = options?.${clientName} ?? new ${clients[client]}();\n`
    );
  }
  constructorInitializers = constructorInitializers.concat('\t}');
  let output = 'export class BigQueryClient{\n';
  output = output.concat(variableDecl, '\n', constructorInitializers);
  return output;
}

function buildOutput() {
  let newoutput;
  newoutput = output.concat(makeImports(clients));
  newoutput = newoutput.concat(buildClientConstructor(clients));
  newoutput = newoutput.concat(astHelper(files, clients));
  newoutput = newoutput.concat('\n}');
  return newoutput;
}

const finaloutput = buildOutput();
fs.writeFile('../src/bigquery.ts', finaloutput, err => {
  if (err) throw err;
});
