import * as ts from 'typescript';

export interface File {
  fileName: string;
  content: string;
  sourceFile?: ts.SourceFile;
}

export function createProgram(files: File[], compilerOptions?: ts.CompilerOptions): ts.Program {
  const tsConfigJson = ts.parseConfigFileTextToJson(
    'tsconfig.json',
    compilerOptions
      ? JSON.stringify(compilerOptions)
      : `{
      "compilerOptions": {
        "target": "es2018",   
        "module": "commonjs",
        "rootDir": ".",
        "strict": false,   
        "esModuleInterop": true,
        "allowJs": true
      }
    `
  );
  let { options, errors } = ts.convertCompilerOptionsFromJson(
    tsConfigJson.config.compilerOptions,
    '.'
  );
  if (errors.length) {
    throw errors;
  }
  const compilerHost = ts.createCompilerHost(options);
  compilerHost.getSourceFile = function(
    fileName: string,
    languageVersion: ts.ScriptTarget,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean
  ): ts.SourceFile | undefined {
    const file = files.find(f => f.fileName === fileName);
    if (!file) return undefined;
    file.sourceFile =
      file.sourceFile || ts.createSourceFile(fileName, file.content, ts.ScriptTarget.ES2015, true);
    return file.sourceFile;
  };
  compilerHost.resolveTypeReferenceDirectives = function(
    typeReferenceDirectiveNames: string[],
    containingFile: string
  ): (ts.ResolvedTypeReferenceDirective | undefined)[] {
    return [];
  };
  return ts.createProgram(files.map(f => f.fileName), options, compilerHost);
}

// ---------------

export const EQUAL_TOKEN = 59;
export const THIS_TOKEN = 100;

export function traverseProgram(program: ts.Program, callback: (node: ts.Node) => any) {
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, callback);
    }
  }
}

export function getTypeString(checker: ts.TypeChecker, node: ts.Node) {
  let type = checker.getTypeAtLocation(node);
  if (node.getText().match(/^\s*new\s+(.+?)\(.*\)/i)) {
    return RegExp.$1.trim();
  }
  if (type.isLiteral()) {
    type = checker.getBaseTypeOfLiteralType(type);
  }
  const value = checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation);
  if (value === 'null') return 'any';
  if (value === 'false' || value === 'true') return 'boolean';
  return value;
}

export function collectNodesBy(
  program: ts.Program,
  constraint: (node: ts.Node) => boolean,
  startingNode?: ts.Node
) {
  let nodes = [];
  let visit = (node: ts.Node) => {
    if (constraint(node)) {
      nodes.push(node);
    } else {
      node.forEachChild(visit);
    }
  };
  if (startingNode) {
    startingNode.forEachChild(visit);
  } else {
    traverseProgram(program, visit);
  }
  return nodes;
}
