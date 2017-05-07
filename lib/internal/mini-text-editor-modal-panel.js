// NOTE: mostly followed go-to-line package

const { CompositeDisposable, TextEditor } = require('atom');

module.exports =
class MiniTextEditorModalPanel {
  constructor () {
    this.editor = null;
    this.element = null;
    this.modalPanel = null;
    this.subscriptions = null;
    this.previouslyFocusedElement = null;

    this._constructor();
  }

  _constructor () {
    this.editor = new TextEditor({ mini: true, placeholderText: 'placeholderText' });
    this.editor.element.addEventListener('blur', this.close.bind(this));
    this.editor.setPlaceholderText(this.options);

    this.modalPanel = atom.workspace.addModalPanel({ item: this.editor, visible: false });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add(this.editor.element, {
        'core:confirm': () => this.confirm(),
        'core:cancel': () => this.cancel()
      })
    );
  }

  destroy () {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
  }

  confirm () {
    console.log('MiniTextEditorModalPanel: confirm is not implemented');
  }

  cancel () {
    console.log('MiniTextEditorModalPanel: cancel is not implemented');
  }

  toggle () {
    this.modalPanel.isVisible() ? this.close() : this.open();
  }

  storeFocusedElement () {
    this.previouslyFocusedElement = document.activeElement;
    this.previouslyFocusedElement;
  }

  restoreFocus () {
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.parentElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
      return;
    }
    atom.views.getView(atom.workspace).focus();
  }

  open () {
    if (this.modalPanel.isVisible()) { return; }
    this.storeFocusedElement();
    this.modalPanel.show();
    this.editor.element.focus();
  }

  close () {
    if (!this.modalPanel.isVisible()) { return; }
    this.editor.setText('');
    this.modalPanel.hide();
    if (this.editor.element.hasFocus()) {
      this.restoreFocus();
    }
  }
}
