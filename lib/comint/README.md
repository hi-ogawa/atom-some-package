Nodejs 'pipe' based shell view with built-in Atom's TextEditor.


# Usage

Example of working around some tty-based applications:

```
$ sudo --stdin <some-command>

$ irb --inf-ruby-mode
Switch to inspect mode.
irb(main):001:0> 1 + 2
1 + 2
3
irb(main):002:0> exit
exit

$ node -i
> 1 + 1
2
> process.exit()
```

Of course, heavy ncurses kind of non-line based applications won't work.


# TODO

- http://git.savannah.gnu.org/cgit/emacs.git/tree/lisp/comint.el
- pseudo terminal api
  - pty(7)
  - there's no official node api, so let's start with pipe.
    - I don't know how many interpreter works on pipe. (bash works though.)
  - let's not depending on 3rd party yet https://github.com/chjj/pty.js/
- laern node file operation (e.g. line buffering)
  - readable/writable stream file (or file descriptor)


Basic flow

```
- open pty
  - master-pty
  - slave-pty

- give slave-pty to child process's stdin, stdout, stderr


- child process output something =>
  - readFile(master-pty) =>
    - textEditor.insertText
    - (move cursor to the end and remember that point for recognize next user's input, we call it "last output position")

- user writes something =>
  - wait for enter key (or comint-send command ?)
  - get string between the "last output position" and current last cursor write to master-pty

- special keys  
  - enter (comint-enter)
```

- user interface
  - use bottom panel or split pane ? (want to support both somehow)

- further features
  - support find-and-replace based search
  - history
  - send invisible
  - eof
  - somehow send signal (currently there's no job control because there's no "foreground"-ness)
  - serialization (session restoration)
    - reopen by getURI ?
    - save as project buffer ?
    - or it's own persistence system ?
