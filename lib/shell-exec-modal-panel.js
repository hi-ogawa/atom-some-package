var MiniTextEditorModalPanel = require('./internal/mini-text-editor-modal-panel');
var { exec } = require('./internal/utils');

module.exports =
class ShellExecModalPanel extends MiniTextEditorModalPanel {
  constructor () {
    super();
    this.editor.setPlaceholderText('Shell Comamnd');
  }

  confirm () {
    exec(this.editor.getText())
    .then(() => this.close());
  }

  cancel () {
    this.close();
  }
}
