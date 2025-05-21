// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context) {

  let panel

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "seqcode-support" is now active!');

  const disposable = vscode.commands.registerCommand('seqcode-support.start', () => {
    const _disposables = [];

    // Create and show panel
    panel = vscode.window.createWebviewPanel(
      'seqcode-support',
      'SeqCode',
      vscode.ViewColumn.Beside,
      {
        // Enable scripts in the webview
        enableScripts: true
      }
    );

    function getWebviewContent() {

      const jsUrl = panel.webview.asWebviewUri(
        vscode.Uri.file(context.asAbsolutePath('node_modules/seqcode/dist/seqcode.js'))
      );

      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SeqCode Preview</title>
</head>
<body>
    <div id="diagram">loading...</div>
    <script type="module">
    import seqcode from "${jsUrl}"

const vscode = acquireVsCodeApi();
const diagram = document.getElementById('diagram');

let count = 0;
setTimeout(() => {
  diagram.textContent = seqcode//count++;
}, 100);

vscode.postMessage({
  command: 'alert',
  text: '🐛  on line ' + count
})

window.addEventListener('message', event => {
  const msg = event.data
    let { svg, errors } = seqcode(msg.text)
  diagram.innerHTML = svg

  vscode.postMessage({
    command: 'alert',
    text: JSON.stringify(errors)
  })
})

    </script>
</body>
</html>`;
    }

    const previewHandler = () => {
      const editor = vscode.window.activeTextEditor;
      const text = editor.document.getText();
      // const cursor = editor.document.offsetAt(editor.selection.anchor);
console.log("got document content: " + text)
      panel.webview.postMessage({
        text: text,
      });
    };

    vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document === vscode.window.activeTextEditor.document) {
          previewHandler();
        }
      },
      null,
      _disposables
    );

    vscode.workspace.onDidChangeConfiguration(
      (e) => {
        panel.webview.html = getWebviewContent();
      },
      null,
      _disposables
    );

    vscode.window.onDidChangeTextEditorSelection(
      (e) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
          previewHandler();
        }
      },
      null,
      _disposables
    );

    panel.webview.onDidReceiveMessage(
      message => {
        console.log("got message from webview",message)
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      undefined,
      context.subscriptions
    );

    panel.onDidDispose(
      () => {
        console.log('panel closed');

        while (_disposables.length) {
          const item = _disposables.pop();
          if (item) {
            item.dispose();
          }
        }
      },
      null,
      context.subscriptions
    );

    // And set its HTML content
    panel.webview.html = getWebviewContent();
    // panel.webview.postMessage({ command: 'refactor' });

    context.subscriptions.push(disposable);
  })

}

// This method is called when your extension is deactivated
export function deactivate() { }

