"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
function createProgram(files, compilerOptions) {
    const tsConfigJson = ts.parseConfigFileTextToJson('tsconfig.json', compilerOptions
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
    `);
    let { options, errors } = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, '.');
    if (errors.length) {
        throw errors;
    }
    const compilerHost = ts.createCompilerHost(options);
    compilerHost.getSourceFile = function (fileName, languageVersion, onError, shouldCreateNewSourceFile) {
        const file = files.find(f => f.fileName === fileName);
        if (!file)
            return undefined;
        file.sourceFile =
            file.sourceFile || ts.createSourceFile(fileName, file.content, ts.ScriptTarget.ES2015, true);
        return file.sourceFile;
    };
    compilerHost.resolveTypeReferenceDirectives = function (typeReferenceDirectiveNames, containingFile) {
        return [];
    };
    return ts.createProgram(files.map(f => f.fileName), options, compilerHost);
}
exports.createProgram = createProgram;
// ---------------
exports.EQUAL_TOKEN = 59;
exports.THIS_TOKEN = 100;
function traverseProgram(program, callback) {
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            ts.forEachChild(sourceFile, callback);
        }
    }
}
exports.traverseProgram = traverseProgram;
function getTypeString(checker, node) {
    let type = checker.getTypeAtLocation(node);
    if (node.getText().match(/^\s*new\s+(.+?)\(.*\)/i)) {
        return RegExp.$1.trim();
    }
    if (type.isLiteral()) {
        type = checker.getBaseTypeOfLiteralType(type);
    }
    const value = checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation);
    if (value === 'null')
        return 'any';
    if (value === 'false' || value === 'true')
        return 'boolean';
    return value;
}
exports.getTypeString = getTypeString;
function collectNodesBy(program, constraint, startingNode) {
    let nodes = [];
    let visit = (node) => {
        if (constraint(node)) {
            nodes.push(node);
        }
        else {
            node.forEachChild(visit);
        }
    };
    if (startingNode) {
        startingNode.forEachChild(visit);
    }
    else {
        traverseProgram(program, visit);
    }
    return nodes;
}
exports.collectNodesBy = collectNodesBy;
//# sourceMappingURL=utils.js.map