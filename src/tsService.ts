import * as vscode from 'vscode';
import { File, createProgram, collectNodesBy, getTypeString } from './utils';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { IGNORE_COMMENT } from './extension';

export class TypeScriptService {
  static makeProgram(document: vscode.TextDocument) {
    const lib: File = {
      content: fs.readFileSync(path.resolve(__dirname, './lib/lib.es5.d.ts.txt')).toString(),
      fileName: 'lib.es2018.d.ts'
    };
    const doc: File = {
      content: document.getText(),
      fileName: document.fileName
    };
    return createProgram([doc, lib], {});
  }

  static lintDocument(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
    let diagnostics: vscode.Diagnostic[] = [];
    let program = this.makeProgram(document);
    let nodes = collectNodesBy(
      program,
      node => ts.isExpressionStatement(node) || ts.isVariableStatement(node)
    ) as (ts.ExpressionStatement | ts.VariableStatement)[];

    for (const node of nodes) {
      let warningNode: ts.Node;
      if (this.isIgnored(document, node)) {
        continue;
      }

      if (ts.isVariableStatement(node)) {
        let initializer = node.declarationList.declarations[0].initializer;
        if (ts.isCallExpression(initializer)) {
          warningNode = initializer;
        }
      } else {
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

  static isAsyncAndInappropriate(program: ts.Program, node: ts.Node) {
    if (!ts.isCallExpression(node)) {
      return false;
    }
    let type = getTypeString(program.getTypeChecker(), node);
    return type.startsWith('Promise');
  }

  static addWarning(warningNode: ts.Node, document: vscode.TextDocument) {
    let position = document.positionAt(warningNode.pos);
    let line = document.lineAt(position.line);
    let range = new vscode.Range(
      new vscode.Position(position.line, position.character),
      line.range.end
    );
    return {
      code: '',
      message: `⏱️ Shouldn't you await this function call?`,
      range,
      severity: vscode.DiagnosticSeverity.Warning,
      source: '',
      relatedInformation: []
    } as vscode.Diagnostic;
  }

  static isIgnored(document: vscode.TextDocument, node: ts.Node) {
    let comments = ts.getLeadingCommentRanges(document.getText(), node.getFullStart());
    if (!comments) { return false; }
    for (const comment of comments) {
      let text = document.getText().substring(comment.pos, comment.end);
      if (text.replace(/^\/\/\s*/i,'') === '@' + IGNORE_COMMENT) {
        return true;
      }
    }
    return false;
  }
}
