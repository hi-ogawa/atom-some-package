var { CompositeDisposable } = require('atom');

var ShellExecModalPanel = require('./shell-exec-modal-panel');
var { exec } = require('./internal/utils');

var ManPackage = require('./man/man-package');
var ComintPackage = require('./comint/comint-package');

module.exports =
new class SomePackage {
  constructor () {
    this.shellExecModalPanel = null;
    this.subscriptions = null;
  }

  activate () {
    this.shellExecModalPanel = new ShellExecModalPanel();

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'some-package:open-terminal': () => exec('x-terminal-emulator'),
        'some-package:toggle-exec-modal': () => this.shellExecModalPanel.toggle(),
      })
    );

    ManPackage.activate();
    ComintPackage.activate();
  }

  deactivate () {
    this.shellExecModalPanel.destroy();
    this.subscriptions.dispose();

    ManPackage.deactivate();
    ComintPackage.deactivate();
  }

  deserializeManPageView (state, atomEnvironment) {
    return ManPackage.deserializeManPageView(state, atomEnvironment);
  }
}
