var process = require('process');
var child_process = require('child_process');
var { CompositeDisposable, Emitter, Point, TextEditor } = require('atom');

module.exports =
class ComintView {
  constructor (state) {
    this.subscriptions = new CompositeDisposable;
    this.emitter = new Emitter;
    this.textEditor = new TextEditor;
    this.element = this.textEditor.getElement();
    this.process = null;
    this.lastProcessOutputPosition = new Point([0, 0]);
    this.commandHistory = [""];
    this.commandHistoryIndex = 0;

    this.element.classList.add('comint-view');
    this.textEditor.setText('');
    this.subscriptions.add(
      this.textEditor.onWillInsertText((e) => this.onUserWillInsertText(e)),
      atom.commands.add(this.element, {
        'some-package:comint-send-input': (e) => this.sendInputToProcess(e),
        'some-package:comint-search-toggle': () => this.searchToggle(),
        'some-package:comint-recreate': () => this.recreateShell(),
        'some-package:comint-kill': () => this.killShell(),
        'some-package:comint-previous-history': () => this.previousHistory(),
        'some-package:comint-next-history': () => this.nextHistory(),
      })
    );
    this.createShell();
  }

  deactivate () {
    this.killShell();
  }

  killShell () {
    if (this.process) {
      // NOTE/TODO: SIGHUP tells bash to kill its children (see bash(1)) but it crushes whole atom somehow ?
      // this.process.kill('SIGHUP');
      this.process.kill('SIGKILL');
      this.process = null;
      this.onProcessOutput("\n===PROCESS IS DEAD===\n");
    }
  }

  recreateShell () {
    this.killShell();
    this.createShell();
  }

  createShell () {
    this.process = (
      child_process.spawn(
        '/bin/bash',
        ['--noediting', '-i'],
        Object.assign({
          cwd: atom.project.rootDirectories[0].path,
          env: Object.assign({}, process.env, {
            TERM: 'dumb'
          }),
          // stdio: [] // NOTE: default 'pipe' works ?
          shell: false,
        })
      )
    );

    this.process.stdout.on('data', (chunk) => this.onProcessOutput(chunk.toString()));
    this.process.stderr.on('data', (chunk) => this.onProcessOutput(chunk.toString()));

    this.process.on('exit', () => this.deactivate());
    this.process.on('error', () => this.deactivate());
    this.process.stdin.on('close', () => this.deactivate());
    this.process.stdout.on('close', () => this.deactivate());
    this.process.stderr.on('close', () => this.deactivate());
  }

  onUserWillInsertText ({ cancel }) {
    if (this.textEditor.getCursorBufferPosition().isLessThan(this.lastProcessOutputPosition)) {
      cancel();
    }
  }

  sendInputToProcess (e) {
    if (this.process) {
      var input = this.textEditor.getTextInBufferRange([
        this.lastProcessOutputPosition,
        this.textEditor.buffer.getEndPosition()
      ]);
      this.onProcessOutput("\n");
      this.process.stdin.write(input + "\n");
      e.stopPropagation();

      this.commandHistory.pop();
      this.commandHistory.push(input);
      this.commandHistory.push("");
      this.commandHistoryIndex = this.commandHistory.length - 1;
    }
  }

  onProcessOutput (chunk) {
    // NOTE: simple huristics
    var cursorWantsToFollow = this.textEditor.getCursorBufferPosition().isGreaterThanOrEqual(this.lastProcessOutputPosition);

    this.textEditor.buffer.append(chunk, { undo: 'skip' });
    this.lastProcessOutputPosition = this.textEditor.buffer.getEndPosition();

    if (cursorWantsToFollow) {
      this.textEditor.setCursorBufferPosition(this.lastProcessOutputPosition);
    }
  }

  previousHistory () {
    this.commandHistoryIndex = Math.max(0, this.commandHistoryIndex - 1);
    var entry = this.commandHistory[this.commandHistoryIndex];
    this.textEditor.buffer.setTextInRange([
      this.lastProcessOutputPosition,
      this.textEditor.buffer.getEndPosition()
    ], entry, { undo: 'skip' });
  }

  nextHistory () {
    this.commandHistoryIndex = Math.min(this.commandHistory.length - 1, this.commandHistoryIndex + 1);
    var entry = this.commandHistory[this.commandHistoryIndex];
    this.textEditor.buffer.setTextInRange([
      this.lastProcessOutputPosition,
      this.textEditor.buffer.getEndPosition()
    ], entry, { undo: 'skip' });
  }


  // Interface as workspace item

  getTitle () {
    return 'COMINT';
  }

  getElement () {
    return this.element;
  }

  destroy () {
    this.process && this.process.kill();
    this.subscriptions.dispose();
    this.textEditor.destroy();
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
