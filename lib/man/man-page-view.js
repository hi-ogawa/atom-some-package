var { CompositeDisposable, TextEditor } = require('atom');

var { exec } = require('../internal/utils');
var manConfig = require('./man-config');

module.exports =
class ManPageView {
  constructor (state) {
    this.state = state;
    this.activated = false;
    this.subscriptions = new CompositeDisposable;
    this.textEditor = new TextEditor;

    this.textEditor.getElement().classList.add('man-page-view');
    this.subscriptions.add(
      atom.commands.add(this.textEditor.getElement(), {
        'some-package:man-page-view-fit-width': () => this.fitWidth(),
        'some-package:man-page-view-default-width': () => this.updateWidth(80),
        'some-package:man-page-view-search-toggle': () => this.searchToggle(),
      }),
      atom.workspace.observeActivePaneItem((view) => view == this && this.activateOnce())
      // TODO: when project is reopened and its focused item is ManPageView, workspace doesn't trigger this event...
    );

    // Override TextEditor.prototype
    this.textEditor.insertText = () => {};
  }

  activateOnce () {
    if (!this.activated) {
      this.activated = true;
      this.fitWidth();
    }
  }

  fitWidth () {
    this.updateWidth(this.textEditor.getEditorWidthInChars());
  }

  updateWidth (width) {
    return (
      exec(`man -l ${this.manPath()}`, {
        env: { MANWIDTH: width, MANPAGER: 'cat' }
      })
      .then((stdout) => {
        this.textEditor.setText(stdout);
        this.textEditor.moveCursors((cursor) => cursor.setBufferPosition([0, 0]));
        this.textEditor.update({ showIndentGuide: false });
      })
    );
  }

  manPath () {
    var m = this.state.url.match(new RegExp(`^${manConfig.URL_PREFIX}(.+)`));
    return m[1];
  }

  manFilename () {
    var path = this.manPath();
    var splits = path.split('/');
    return splits[splits.length - 1];
  }

  manEntry () {
    var splits = this.manFilename().split('.');
    return {
      name: splits[0],
      section: splits[1],
    };
  }

  // Interface as workspace item //

  getTitle () {
    var entry = this.manEntry();
    return `${ entry.name }(${ entry.section })`;
  }

  getURI () {
    return this.state.url;
  }

  getElement () {
    return this.textEditor.getElement();
  }

  destroy () {
    this.subscriptions.dispose();
    this.textEditor.destroy();
  }

  serialize () {
    return Object.assign({}, this.state, {
      deserializer: 'ManPageView'
    });
  }

  shouldPromptToSave () { return false; }

  save () {}

  isModified () { return false; }


  // Interface for find-and-replace

  // NOTE: Possibly hacky
  searchToggle () {
    if (atom.packages.isPackageDisabled('find-and-replace')) {
      console.log('find-and-replace package is needed.');
    } else {
      atom.packages.activatePackage('find-and-replace')
      .then(() => {
        atom.dispatchApplicationMenuCommand('find-and-replace:toggle');
        var findAndReplace = pack.mainModule;
        findAndReplace.findModel.setEditor(this.textEditor);
      });

      // NOTE: Force activation when package is waiting for activation command
      var pack = atom.packages.loadPackage('find-and-replace');
      if (!pack.mainActivated) {
        pack.activateNow();
      }
    }
  }
}
