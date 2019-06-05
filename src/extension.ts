import * as vscode from 'vscode';
import { TypeScriptService } from './tsService';
import { Provider } from './codeActionProvider';

export const IGNORE_COMMENT = 'promise-warning-ignore';

export function activate(context: vscode.ExtensionContext) {
  const collection = vscode.languages.createDiagnosticCollection('promise-warning');

  vscode.commands.registerCommand('promise-warning', () => {
    let document = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
    if (document) {
      TypeScriptService.lintDocument(document, collection);
    }
  });

  vscode.workspace.onDidChangeTextDocument(e => {
    let document = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
    if (document) {
      TypeScriptService.lintDocument(document, collection);
    }
  });

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('typescript', new Provider(collection), {
      providedCodeActionKinds: Provider.providedCodeActionKinds
    })
  );
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('javascript', new Provider(collection), {
      providedCodeActionKinds: Provider.providedCodeActionKinds
    })
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'typescript',
      {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
          let linePrefix = document.lineAt(position).text.substr(0, position.character);
          if (!linePrefix.endsWith('//@')) {
            return undefined;
          }
          let item = new vscode.CompletionItem(IGNORE_COMMENT, vscode.CompletionItemKind.Snippet);
          return [item];
        }
      },
      '@'
    )
  );
}

export function deactivate() {}
