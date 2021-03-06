const { Elm } = require("./Main.elm");
import * as fs from "fs-extra";
import { GraphQLClient } from "graphql-request";
import * as http from "http";
import * as request from "request";
import { applyElmFormat } from "./formatted-write";
import { introspectionQuery } from "./introspection-query";
import * as glob from "glob";
import * as path from "path";
import {
  removeGenerated,
  isGenerated,
  warnAndExitIfContainsNonGenerated
} from "./cli/generated-code-handler";
const npmPackageVersion = require("../../package.json").version;
const elmPackageVersion = require("../../elm.json").version;

const targetComment = `-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql
`;

const versionMessage = `npm version ${npmPackageVersion}\nTargeting elm package dillonkearns/elm-graphql@${elmPackageVersion}`;

function prependBasePath(
  suffixPath: string,
  baseModule: string[],
  outputPath: string
): string {
  return path.join(outputPath, baseModule.join("/"), suffixPath);
}

let app = Elm.Main.init({ flags: { argv: process.argv, versionMessage } });
// app.ports.print.subscribe(console.log);
app.ports.printAndExitFailure.subscribe((message: string) => {
  console.log(message);
  process.exit(1);
});
app.ports.printAndExitSuccess.subscribe((message: string) => {
  console.log(message);
  process.exit(0);
});

app.ports.introspectSchemaFromFile.subscribe(
  ({
    introspectionFilePath,
    outputPath,
    baseModule
  }: {
    introspectionFilePath: string;
    outputPath: string;
    baseModule: string[];
  }) => {
    warnAndExitIfContainsNonGenerated({ baseModule, outputPath });
    const introspectionFileJson = JSON.parse(
      fs.readFileSync(introspectionFilePath).toString()
    );
    onDataAvailable(
      introspectionFileJson.data || introspectionFileJson,
      outputPath,
      baseModule
    );
  }
);

app.ports.introspectSchemaFromUrl.subscribe(
  ({
    graphqlUrl,
    excludeDeprecated,
    outputPath,
    baseModule,
    headers
  }: {
    graphqlUrl: string;
    excludeDeprecated: boolean;
    outputPath: string;
    baseModule: string[];
    headers: {};
  }) => {
    warnAndExitIfContainsNonGenerated({ baseModule, outputPath });

    console.log("Fetching GraphQL schema...");
    new GraphQLClient(graphqlUrl, {
      mode: "cors",
      headers: headers
    })
      .request(introspectionQuery, { includeDeprecated: !excludeDeprecated })
      .then(data => {
        onDataAvailable(data, outputPath, baseModule);
      })
      .catch(err => {
        console.log(err.response || err);
        process.exit(1);
      });
  }
);

function makeEmptyDirectories(
  baseModule: string[],
  outputPath: string,
  directoryNames: string[]
): void {
  directoryNames.forEach(dir => {
    fs.mkdirpSync(prependBasePath(dir, baseModule, outputPath));
  });
}

function onDataAvailable(data: {}, outputPath: string, baseModule: string[]) {
  console.log("Generating files...");
  app.ports.generatedFiles.subscribe(async function(generatedFile: {
    [s: string]: string;
  }) {
    removeGenerated(prependBasePath("/", baseModule, outputPath));
    makeEmptyDirectories(baseModule, outputPath, [
      "InputObject",
      "Object",
      "Interface",
      "Union",
      "Enum"
    ]);
    await Promise.all(writeGeneratedFiles(outputPath, generatedFile)).catch(
      err => {
        console.error("Error writing files", err);
      }
    );
    writeIntrospectionFile(baseModule, outputPath);
    applyElmFormat(prependBasePath("/", baseModule, outputPath));
    console.log("Success!");
    process.exit(0);
  });
  app.ports.generateFiles.send(data);
}

function writeGeneratedFiles(
  outputPath: string,
  generatedFile: {
    [s: string]: string;
  }
): Promise<void>[] {
  return Object.entries(generatedFile).map(([fileName, fileContents]) => {
    const filePath = path.join(outputPath, fileName);
    return fs.writeFile(filePath, targetComment + fileContents);
  });
}

function writeIntrospectionFile(baseModule: string[], outputPath: string) {
  fs.writeFileSync(
    prependBasePath("elm-graphql-metadata.json", baseModule, outputPath),
    `{"targetElmPackageVersion": "${elmPackageVersion}", "generatedByNpmPackageVersion": "${npmPackageVersion}"}`
  );
}
