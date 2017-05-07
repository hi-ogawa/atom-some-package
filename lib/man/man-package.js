var { CompositeDisposable } = require('atom');

var manConfig = require('./man-config');
var ManPageView = require('./man-page-view');
var ManSearchModalPanel = require('./man-search-modal-panel');

module.exports =
new class ManPackage {
  constructor () {
    this.subscriptions = new CompositeDisposable;
  }

  activate () {
    this.manSearchModalPanel = new ManSearchModalPanel();

    this.subscriptions.add(
      atom.workspace.addOpener((url) => {
        if (url.match(new RegExp(`^${manConfig.URL_PREFIX}(.+)`))) {
          return new ManPageView({ url: url });
        }
      }),
      atom.commands.add('atom-workspace', {
        'some-package:toggle-man-search-modal': () => this.manSearchModalPanel.toggle(),
      })
    );
  }

  deactivate () {
    this.manSearchModalPanel.destroy();
    this.subscriptions.dispose();
  }

  deserializeManPageView (state, atomEnvironment) {
    var view = new ManPageView(state);
    return view;
  }

  // TOOD: Provide interface (e.g. via MiniTextEditorModal, via tree view, via current TextEditor ?)
  preview (path) {
    atom.workspace.open(`${manConfig.URL_PREFIX}${path}`);
  }
}
