var SelectListViewModalPanel = require('../internal/select-list-view-modal-panel');
var { exec } = require('../internal/utils');
var manConfig = require('./man-config');

module.exports =
class ManSearchModalPanel extends SelectListViewModalPanel {
  constructor () {
    super();

    this.modalPanel.element.classList.add('man-search-modal-panel');
    var props = {
      maxResults: 100,
      filter: this.filter.bind(this),
      filterKeyForItem: (item) => item.name,
      elementForItem: (item) => {
        var li = document.createElement('li');
        li.innerHTML = `
          <div class="man-item">
            <span class="man-item__section">${item.section}</span>
            <span class="man-item__name">${item.name}</span>
            <span class="man-item__description">${item.description}</span>
          </div>
        `;
        return li;
      },
      didConfirmSelection: (item) => {
        this.openItem(item);
        this.close();
      },
      didCancelSelection: () => {
        this.close();
      }
    };
    Object.assign(this.selectListView.props, props);

    this.manItemsPromise = null;
  }

  onOpen () {
    (this.manItemsPromise = this.manItemsPromise || this.getManItems())
    .then((items) => {
      this.selectListView.update({ items: items });
      this.selectListView.refs.queryEditor.setPlaceholderText('[ SECTION ] NAME');
      this.selectListView.focus();
    });
  }

  filter (items, query) {
    var qs = query.split(' ').filter(x => x);
    var section = qs[0] && items.find(item => item.section === qs[0]) && qs[0];
    var name = (section ? qs.slice(1, qs.length) : qs).join(' ');
    if (name) {
      // TODO: decouple our filter from selectListView.fuzzyFilter
      items = this.selectListView.fuzzyFilter(items, name);
    }
    if (section) {
      items = items.filter(item => item.section === section);
    }
    return items;
  }

  getManItems () {
    return (
      exec("man -k '.*'")
      .then((stdout) =>
        stdout.split('\n').filter(x => x).map(this.parseLine)
      )
    );
  }

  // input:  'printf (3)   - formatted output conversion'
  // output: { name: 'printf', section: '3', description: 'formatted output conversion' }
  parseLine (line) {
    var m = line.match(/^(.*)\ \((.*)\)\ +\-\ +(.*)$/);
    return {
      name: m[1],
      section: m[2],
      description: m[3],
    };
  }

  openItem (item) {
    exec(`man -w ${item.section} ${item.name}`)
    .then((stdout) => {
      atom.workspace.open(`${manConfig.URL_PREFIX}${stdout.trim()}`);
    })
  }
}
