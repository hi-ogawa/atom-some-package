// NOTE: mostly followed command-palette package

var SelectListView = require('atom-select-list');

module.exports =
class SelectListViewModalPanel {
  constructor () {
    this.selectListView = null;
    this.modalPanel = null;
    this.previouslyFocusedElement = null;

    this._constructor();
  }

  _constructor () {
    this.selectListView = new SelectListView({
      items: [],
      emptyMessage: 'No matches found',
      didChangeQuery: null,             // (query: string) => void
      filter: null,                     // (items: T[], query: string) => T[]
      filterKeyForItem: (item) => item, // if `filter` is not set, this will be used with built-in fuzzaldrin
      elementForItem: (item) => {
        var li = document.createElement('li');
        li.innerText = item;
        return li;
      },
      didConfirmSelection: (item) => {},
      didCancelSelection: () => {}
    })

    this.modalPanel = atom.workspace.addModalPanel({ item: this.selectListView, visible: false });
  }

  destroy () {
    this.selectListView.destroy();
    this.modalPanel.destroy();
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
    this.onOpen && this.onOpen();
  }

  close () {
    if (!this.modalPanel.isVisible()) { return; }
    this.selectListView.refs.queryEditor.setText('');
    this.modalPanel.hide();
    if (this.selectListView.refs.queryEditor.element.hasFocus()) {
      this.restoreFocus();
    }
  }
}
