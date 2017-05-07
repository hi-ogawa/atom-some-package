// TODO: Abstract ModalPanel for MiniTextEditorModalPanel and SelectListViewModalPanel

module.exports =
class ModalPanel {
  constructor () {
    this.modalPanel = null;
    this.previouslyFocusedElement = null;

    this._constructor();
  }

  _constructor () {
  }
}
