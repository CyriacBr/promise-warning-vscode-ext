"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const extension_1 = require("./extension");
class TypeScriptService {
    static makeProgram(document) {
        const lib = {
            content: fs.readFileSync(path.resolve(__dirname, './lib/lib.es5.d.ts.txt')).toString(),
            fileName: 'lib.es2018.d.ts'
        };
        const doc = {
            content: document.getText(),
            fileName: document.fileName
        };
        return utils_1.createProgram([doc, lib], {});
    }
    static lintDocument(document, collection) {
        let diagnostics = [];
        let program = this.makeProgram(document);
        let nodes = utils_1.collectNodesBy(program, node => ts.isExpressionStatement(node) || ts.isVariableStatement(node));
        for (const node of nodes) {
            let warningNode;
            if (this.isIgnored(document, node)) {
                continue;
            }
            if (ts.isVariableStatement(node)) {
                let initializer = node.declarationList.declarations[0].initializer;
                if (ts.isCallExpression(initializer)) {
                    warningNode = initializer;
                }
            }
            else {
                let expr = node.expression;
                if (ts.isBinaryExpression(expr)) {
                    if (ts.isCallExpression(expr.right)) {
                        warningNode = expr.right;
                    }
                }
            }
            if (warningNode) {
                diagnostics.push(this.addWarning(warningNode, document));
            }
        }
        collection.set(document.uri, diagnostics);
        return diagnostics;
    }
    static isAsyncAndInappropriate(program, node) {
        if (!ts.isCallExpression(node)) {
            return false;
        }
        let type = utils_1.getTypeString(program.getTypeChecker(), node);
        return type.startsWith('Promise');
    }
    static addWarning(warningNode, document) {
        let position = document.positionAt(warningNode.pos);
        let line = document.lineAt(position.line);
        let range = new vscode.Range(new vscode.Position(position.line, position.character), line.range.end);
        return {
            code: '',
            message: `⏱️ Shouldn't you await this function call?`,
            range,
            severity: vscode.DiagnosticSeverity.Warning,
            source: '',
            relatedInformation: []
        };
    }
    static isIgnored(document, node) {
        let comments = ts.getLeadingCommentRanges(document.getText(), node.getFullStart());
        if (!comments) {
            return false;
        }
        for (const comment of comments) {
            let text = document.getText().substring(comment.pos, comment.end);
            if (text.replace(/^\/\/\s*/i, '') === '@' + extension_1.IGNORE_COMMENT) {
                return true;
            }
        }
        return false;
    }
}
exports.TypeScriptService = TypeScriptService;
//# sourceMappingURL=tsService.js.map