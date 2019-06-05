"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tsService_1 = require("./tsService");
class Provider {
    constructor(collection) {
        this._collection = collection;
    }
    provideCodeActions(document, range) {
        let diagnostics = tsService_1.TypeScriptService.lintDocument(document, this._collection);
        if (diagnostics.length === 0) {
            this._collection.clear();
            return;
        }
        let fixes = [];
        for (const diag of diagnostics) {
            let awaitFix = this.createAwaitFix(document, diag);
            fixes.push(awaitFix);
        }
        fixes[0].isPreferred = true;
        return fixes;
    }
    createAwaitFix(document, diag) {
        let range = diag.range;
        let fix = new vscode.CodeAction(`Add await`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(document.uri, new vscode.Range(range.start, range.start), ' await');
        fix.diagnostics = [diag];
        fix.command = {
            command: 'promise-warning'
        };
        return fix;
    }
}
Provider.providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];
exports.Provider = Provider;
//# sourceMappingURL=codeActionProvider.js.map