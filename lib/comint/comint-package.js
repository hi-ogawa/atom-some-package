var { CompositeDisposable } = require('atom');

var ComintView = require('./comint-view');

module.exports =
new class ComintPackage {
  constructor () {
    this.subscriptions = new CompositeDisposable;
  }

  activate () {
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'some-package:create-comint-view': () => this.createComintView(),
      })
    );
  }

  deactivate () {
    this.subscriptions.dispose();
  }

  createComintView () {
    var view = new ComintView();
    atom.workspace.open(view);
  }
}
