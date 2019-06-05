"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tsService_1 = require("./tsService");
const codeActionProvider_1 = require("./codeActionProvider");
exports.IGNORE_COMMENT = 'promise-warning-ignore';
function activate(context) {
    const collection = vscode.languages.createDiagnosticCollection('promise-warning');
    vscode.commands.registerCommand('promise-warning', () => {
        let document = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        if (document) {
            tsService_1.TypeScriptService.lintDocument(document, collection);
        }
    });
    vscode.workspace.onDidChangeTextDocument(e => {
        let document = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        if (document) {
            tsService_1.TypeScriptService.lintDocument(document, collection);
        }
    });
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('typescript', new codeActionProvider_1.Provider(collection), {
        providedCodeActionKinds: codeActionProvider_1.Provider.providedCodeActionKinds
    }));
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('javascript', new codeActionProvider_1.Provider(collection), {
        providedCodeActionKinds: codeActionProvider_1.Provider.providedCodeActionKinds
    }));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('typescript', {
        provideCompletionItems(document, position) {
            let linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.endsWith('//@')) {
                return undefined;
            }
            let item = new vscode.CompletionItem(exports.IGNORE_COMMENT, vscode.CompletionItemKind.Snippet);
            return [item];
        }
    }, '@'));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map