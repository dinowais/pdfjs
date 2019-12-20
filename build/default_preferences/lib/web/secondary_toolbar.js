"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SecondaryToolbar = void 0;

var _ui_utils = require("./ui_utils");

var _pdf_cursor_tools = require("./pdf_cursor_tools");

var _pdf_single_page_viewer = require("./pdf_single_page_viewer");

class SecondaryToolbar {
  constructor(options, mainContainer, eventBus) {
    this.toolbar = options.toolbar;
    this.toggleButton = options.toggleButton;
    this.toolbarButtonContainer = options.toolbarButtonContainer;
    this.buttons = [{
      element: options.presentationModeButton,
      eventName: 'presentationmode',
      close: true
    }, {
      element: options.openFileButton,
      eventName: 'openfile',
      close: true
    }, {
      element: options.printButton,
      eventName: 'print',
      close: true
    }, {
      element: options.downloadButton,
      eventName: 'download',
      close: true
    }, {
      element: options.viewBookmarkButton,
      eventName: null,
      close: true
    }, {
      element: options.firstPageButton,
      eventName: 'firstpage',
      close: true
    }, {
      element: options.lastPageButton,
      eventName: 'lastpage',
      close: true
    }, {
      element: options.pageRotateCwButton,
      eventName: 'rotatecw',
      close: false
    }, {
      element: options.pageRotateCcwButton,
      eventName: 'rotateccw',
      close: false
    }, {
      element: options.cursorSelectToolButton,
      eventName: 'switchcursortool',
      eventDetails: {
        tool: _pdf_cursor_tools.CursorTool.SELECT
      },
      close: true
    }, {
      element: options.cursorHandToolButton,
      eventName: 'switchcursortool',
      eventDetails: {
        tool: _pdf_cursor_tools.CursorTool.HAND
      },
      close: true
    }, {
      element: options.scrollVerticalButton,
      eventName: 'switchscrollmode',
      eventDetails: {
        mode: _ui_utils.ScrollMode.VERTICAL
      },
      close: true
    }, {
      element: options.scrollHorizontalButton,
      eventName: 'switchscrollmode',
      eventDetails: {
        mode: _ui_utils.ScrollMode.HORIZONTAL
      },
      close: true
    }, {
      element: options.scrollWrappedButton,
      eventName: 'switchscrollmode',
      eventDetails: {
        mode: _ui_utils.ScrollMode.WRAPPED
      },
      close: true
    }, {
      element: options.spreadNoneButton,
      eventName: 'switchspreadmode',
      eventDetails: {
        mode: _ui_utils.SpreadMode.NONE
      },
      close: true
    }, {
      element: options.spreadOddButton,
      eventName: 'switchspreadmode',
      eventDetails: {
        mode: _ui_utils.SpreadMode.ODD
      },
      close: true
    }, {
      element: options.spreadEvenButton,
      eventName: 'switchspreadmode',
      eventDetails: {
        mode: _ui_utils.SpreadMode.EVEN
      },
      close: true
    }, {
      element: options.documentPropertiesButton,
      eventName: 'documentproperties',
      close: true
    }];
    this.items = {
      firstPage: options.firstPageButton,
      lastPage: options.lastPageButton,
      pageRotateCw: options.pageRotateCwButton,
      pageRotateCcw: options.pageRotateCcwButton
    };
    this.mainContainer = mainContainer;
    this.eventBus = eventBus;
    this.opened = false;
    this.containerHeight = null;
    this.previousContainerHeight = null;
    this.reset();

    this._bindClickListeners();

    this._bindCursorToolsListener(options);

    this._bindScrollModeListener(options);

    this._bindSpreadModeListener(options);

    this.eventBus.on('resize', this._setMaxHeight.bind(this));
    this.eventBus.on('baseviewerinit', evt => {
      if (evt.source instanceof _pdf_single_page_viewer.PDFSinglePageViewer) {
        this.toolbarButtonContainer.classList.add('hiddenScrollModeButtons', 'hiddenSpreadModeButtons');
      } else {
        this.toolbarButtonContainer.classList.remove('hiddenScrollModeButtons', 'hiddenSpreadModeButtons');
      }
    });
  }

  get isOpen() {
    return this.opened;
  }

  setPageNumber(pageNumber) {
    this.pageNumber = pageNumber;

    this._updateUIState();
  }

  setPagesCount(pagesCount) {
    this.pagesCount = pagesCount;

    this._updateUIState();
  }

  reset() {
    this.pageNumber = 0;
    this.pagesCount = 0;

    this._updateUIState();

    this.eventBus.dispatch('secondarytoolbarreset', {
      source: this
    });
  }

  _updateUIState() {
    this.items.firstPage.disabled = this.pageNumber <= 1;
    this.items.lastPage.disabled = this.pageNumber >= this.pagesCount;
    this.items.pageRotateCw.disabled = this.pagesCount === 0;
    this.items.pageRotateCcw.disabled = this.pagesCount === 0;
  }

  _bindClickListeners() {
    this.toggleButton.addEventListener('click', this.toggle.bind(this));

    for (let button in this.buttons) {
      let {
        element,
        eventName,
        close,
        eventDetails
      } = this.buttons[button];
      element.addEventListener('click', evt => {
        if (eventName !== null) {
          let details = {
            source: this
          };

          for (let property in eventDetails) {
            details[property] = eventDetails[property];
          }

          this.eventBus.dispatch(eventName, details);
        }

        if (close) {
          this.close();
        }
      });
    }
  }

  _bindCursorToolsListener(buttons) {
    this.eventBus.on('cursortoolchanged', function ({
      tool
    }) {
      buttons.cursorSelectToolButton.classList.toggle('toggled', tool === _pdf_cursor_tools.CursorTool.SELECT);
      buttons.cursorHandToolButton.classList.toggle('toggled', tool === _pdf_cursor_tools.CursorTool.HAND);
    });
  }

  _bindScrollModeListener(buttons) {
    function scrollModeChanged({
      mode
    }) {
      buttons.scrollVerticalButton.classList.toggle('toggled', mode === _ui_utils.ScrollMode.VERTICAL);
      buttons.scrollHorizontalButton.classList.toggle('toggled', mode === _ui_utils.ScrollMode.HORIZONTAL);
      buttons.scrollWrappedButton.classList.toggle('toggled', mode === _ui_utils.ScrollMode.WRAPPED);
      const isScrollModeHorizontal = mode === _ui_utils.ScrollMode.HORIZONTAL;
      buttons.spreadNoneButton.disabled = isScrollModeHorizontal;
      buttons.spreadOddButton.disabled = isScrollModeHorizontal;
      buttons.spreadEvenButton.disabled = isScrollModeHorizontal;
    }

    this.eventBus.on('scrollmodechanged', scrollModeChanged);
    this.eventBus.on('secondarytoolbarreset', evt => {
      if (evt.source === this) {
        scrollModeChanged({
          mode: _ui_utils.ScrollMode.VERTICAL
        });
      }
    });
  }

  _bindSpreadModeListener(buttons) {
    function spreadModeChanged({
      mode
    }) {
      buttons.spreadNoneButton.classList.toggle('toggled', mode === _ui_utils.SpreadMode.NONE);
      buttons.spreadOddButton.classList.toggle('toggled', mode === _ui_utils.SpreadMode.ODD);
      buttons.spreadEvenButton.classList.toggle('toggled', mode === _ui_utils.SpreadMode.EVEN);
    }

    this.eventBus.on('spreadmodechanged', spreadModeChanged);
    this.eventBus.on('secondarytoolbarreset', evt => {
      if (evt.source === this) {
        spreadModeChanged({
          mode: _ui_utils.SpreadMode.NONE
        });
      }
    });
  }

  open() {
    if (this.opened) {
      return;
    }

    this.opened = true;

    this._setMaxHeight();

    this.toggleButton.classList.add('toggled');
    this.toolbar.classList.remove('hidden');
  }

  close() {
    if (!this.opened) {
      return;
    }

    this.opened = false;
    this.toolbar.classList.add('hidden');
    this.toggleButton.classList.remove('toggled');
  }

  toggle() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  _setMaxHeight() {
    if (!this.opened) {
      return;
    }

    this.containerHeight = this.mainContainer.clientHeight;

    if (this.containerHeight === this.previousContainerHeight) {
      return;
    }

    this.toolbarButtonContainer.setAttribute('style', 'max-height: ' + (this.containerHeight - _ui_utils.SCROLLBAR_PADDING) + 'px;');
    this.previousContainerHeight = this.containerHeight;
  }

}

exports.SecondaryToolbar = SecondaryToolbar;