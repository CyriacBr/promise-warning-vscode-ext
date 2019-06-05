import * as vscode from 'vscode';
import { TypeScriptService } from './tsService';

export class Provider implements vscode.CodeActionProvider {
  _collection: vscode.DiagnosticCollection;
  constructor(collection: vscode.DiagnosticCollection) {
    this._collection = collection;
  }

  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] | undefined {
    let diagnostics = TypeScriptService.lintDocument(document, this._collection);
    if (diagnostics.length === 0) {
      this._collection.clear();
      return;
    }
    let fixes: vscode.CodeAction[] = [];
    for (const diag of diagnostics) {
      let awaitFix = this.createAwaitFix(document, diag);
      fixes.push(awaitFix);
    }
    fixes[0].isPreferred = true;

    return fixes;
  }

  createAwaitFix(document: vscode.TextDocument, diag: vscode.Diagnostic) {
    let range = diag.range;
    let fix = new vscode.CodeAction(`Add await`, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(document.uri, new vscode.Range(range.start, range.start), ' await');
    fix.diagnostics = [diag];
    fix.command = {
      command: 'promise-warning'
    } as vscode.Command;
    return fix;
  }
}
