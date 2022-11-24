export class Console {
  constructor(debug) {
    this.base = window ? { ...window.console } : console;
    this._debug = debug || false;
    if (window) window.Console = this;
    //eslint-disable-next-line no-unused-vars
    if (globalThis) globalThis.Console = this;
  }

  log() {
    if (this._debug) {
      // console.log(...arguments)
      this.base.log(...arguments);
    }
  }
  warn() {
    if (this._debug) {
      // console.warn(...arguments);
      this.base.warn(...arguments);
    }
  }
  error() {
    if (this._debug) {
      // console.error(...arguments);
      this.base.error(...arguments);
    }
  }
}
