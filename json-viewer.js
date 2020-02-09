const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const isString = x => typeof x === 'string';
const trim = s => s.trim();
const isObject = x => x !== null && `${x}` === '[object Object]';
const replace = (...args) => s => s.replace(...args);
const isAllStrings = xs => Array.isArray(xs) && xs.every(isString);
const fromEntries = xs => Object.fromEntries ? Object.fromEntries(xs) :
  xs.reduce((o, [k, v]) => Object.assign({ [k]: v }, o), {});
const flatMap = f => xs =>
  'flatMap' in Array.prototype ?
    xs.flatMap(f) :
    xs.reduce((acc, x) => acc.concat(f(x)), []);

const pick = (keys, element) =>
  keys.reduce((pojo, key) =>
    Object.assign(pojo, { [key]: element[key] }), {});

const stripUndefinedVals = flatMap(([k, v]) => v === undefined ? [] : [[k, v]]);
const stripUndefined = compose(fromEntries, stripUndefinedVals, Object.entries);

const mark = x =>
    x instanceof Element ? `<mark class='string'>${x.outerHTML.replace(/</g, '&lt;').replace(/"/g, '\'')}</mark>` :
  isObject(x) || Array.isArray(x) ? x :
  `<mark class='${x === null ? 'null' : typeof x}'>${x}</mark>`;

const replacer = (k, v) => k === '' ? v : mark(v);
const pretty = o => JSON.stringify(o, replacer, 2);

const markKeys = replace(/"(.*)":/g, (_, key) => `<mark class="key">"${key}"</mark>:`);
const wrapStrings = replace(/"<mark(.*)>(.*)<\/mark>"/g, (_, attrs, content) =>
  `<mark${attrs}>${attrs.includes('string') ? `"${content}"` : content}</mark>`);

const json = compose(wrapStrings, markKeys, pretty, stripUndefined);

const css = `
[hidden],
:host([hidden]) {
  display: none !important;
}

:host {
  display: block;
  position: relative;
  padding: 10px;
  color: var(--json-viewer-color, currentColor);
  background: var(--json-viewer-background);
}

mark { background: none; }
mark.key { color: var(--json-viewer-key-color); }
mark.boolean { color: var(--json-viewer-boolean-color); }
mark.number { color: var(--json-viewer-number-color); }
mark.null { color: var(--json-viewer-null-color); }
mark.string { color: var(--json-viewer-string-color); }

@media (prefers-color-scheme: dark), (prefers-color-scheme: no-preference) {
  :host {
    --json-viewer-color: white;
    --json-viewer-background: #212529;
    --json-viewer-key-color: #ff922b;
    --json-viewer-boolean-color: #22b8cf;
    --json-viewer-number-color: #51cf66;
    --json-viewer-null-color: #ff6b6b;
    --json-viewer-string-color: #22b8cf;
  }
}

@media (prefers-color-scheme: light) {
  :host {
    --json-viewer-color: #212529;
    --json-viewer-background: white;
    --json-viewer-key-color: #f76707;
    --json-viewer-boolean-color: #0c8599;
    --json-viewer-number-color: #0ca678;
    --json-viewer-null-color: #e03131;
    --json-viewer-string-color: #0c8599;
  }
}
`;

const template = document.createElement('template');
template.innerHTML = `
<code hidden>
  <pre></pre>
</code>
`;

const WLATTR = 'whitelist';

/**
 * Custom Element that shows a JavaScript object's properties as syntax-highlighted JSON.
 *
 * The element will respect `prefers-color-scheme` by default, but if you use the
 * CSS Custom Properties listed below, you should customize both light and dark themes.
 *
 * ❤️ Proudly uses [open-wc](https://open-wc.org) tools and recommendations.
 *
 * @example
 * ```javascript
 * const properties = {foo: 'foo', bar: 'bar', baz: 'baz'};
 * const template = html`<json-viewer .object="${properties}" whitelist="foo,bar"></json-viewer>`;
 * render(template, document.body);
 * ```
 *
 * @example
 * ```html
 * <json-viewer whitelist="foo,bar">
 * {
 *   "foo": "foo",
 *   "bar": "bar",
 *   "baz": "baz"
 * }
 * </json-viewer>
 * ```
 *
 * @cssprop --json-viewer-color - Color for generic text. Light white, Dark #212121
 * @cssprop --json-viewer-background - Color for generic text. Light #212121, Dark white
 * @cssprop --json-viewer-key-color - Color for keys. Light #f76707, Dark #ff922b
 * @cssprop --json-viewer-boolean-color - Color for booleans. Light #f76707, Dark #22b8cf
 * @cssprop --json-viewer-number-color - Color for numbers. Light #0ca678, Dark #51cf66
 * @cssprop --json-viewer-null-color - Color for nulls. Light #e03131, Dark #ff6b6b
 * @cssprop --json-viewer-string-color - Color for strings. Light #0c8599, Dark #22b8cf
 *
 * @slot - JSON strings appended as text nodes will be parsed and displayed
 */
export class JsonViewer extends HTMLElement {
  static get is() {
    return 'json-viewer';
  }

  static get observedAttributes() {
    return [WLATTR];
  }

  /**
   * Object to display
   * @type {object}
   */
  get object() {
    return this.__object;
  }

  set object(val) {
    this.__object = val;
    this.render();
  }

  /**
   * Whitelist of keys for the object.
   * Required if setting `object` to a non-serializable object (e.g. an HTMLElement)
   * @type {string[]}
   * @attr
   */
  get whitelist() {
    return this.__whitelist;
  }

  set whitelist(val) {
    if (!isAllStrings(val)) {
      throw new Error('whitelist must be an array of strings');
    }
    this.__whitelist = val;
    const attr = val.join(',');
    this.setAttribute(WLATTR, attr);
    this.render();
  }

  constructor() {
    super();
    this.__mo = new MutationObserver(this.parse.bind(this));
    this.__mo.observe(this, { subtree: false, characterData: true });
    this.attachShadow({ mode: 'open' });
    if ('adoptedStyleSheets' in Document.prototype) {
      const styles = new CSSStyleSheet();
      styles.replaceSync(css);
      this.shadowRoot.adoptedStyleSheets = [styles];
    } else {
      this.shadowRoot.innerHTML = `<style>${css}</style>`;
    }
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  attributeChangedCallback(_, __, whitelist) {
    this.whitelist = whitelist.split(',').map(trim);
  }

  connectedCallback() {
    this.parse();
  }

  /**
   * @private
   * @return {string} syntax-highlighted HTML string
   */
  getHighlightedDomString() {
    const { whitelist, object } = this;
    return object === undefined ?
      '' : json(whitelist ? pick(whitelist, object) : object);
  }

  /** @private */
  render() {
    const highlighted = this.getHighlightedDomString();
    this.shadowRoot.querySelector('code').hidden = !highlighted;
    this.shadowRoot.querySelector('pre').innerHTML = highlighted;
  }

  /** @private */
  parse() {
    if (!this.textContent.trim()) return;
    try {
      this.object = JSON.parse(this.textContent);
    } catch (_) {
      this.object = undefined;
    }
  }
}

customElements.define(JsonViewer.is, JsonViewer);
