const compose =
  (...fns) =>
    fns.reduce((f, g) =>
      (...args) =>
        f(g(...args)));

const isString =
  x =>
    typeof x === 'string';

const trim =
  s =>
    s.trim();

const isObject =
  x =>
    x !== null &&
    `${x}` === '[object Object]';

const replace =
  (...args) => s =>
    s.replace(...args);

const isAllStrings =
  xs =>
    Array.isArray(xs) &&
    xs.every(isString);

const fromEntries =
  xs =>
      Object.fromEntries ? Object.fromEntries(xs)
    : xs.reduce((o, [k, v]) => ({ [k]: v, ...o }), {});

const flatMap =
  f => xs =>
  'flatMap' in Array.prototype ?
    xs.flatMap(f)
    : xs.reduce((acc, x) => acc.concat(f(x)), []);

const pick =
  (keys, element) =>
    keys.reduce((pojo, key) =>
      Object.assign(pojo, { [key]: element[key] }), {});

const stripUndefinedVals =
  flatMap(([k, v]) => v === undefined ? [] : [[k, v]]);

const stripUndefined =
  compose(fromEntries, stripUndefinedVals, Object.entries);

const mark = x =>
    x instanceof Element ? `<mark class='string'>${x.outerHTML.replace(/</g, '&lt;').replace(/"/g, '\'')}</mark>`
  : isObject(x) || Array.isArray(x) ? x
  : `<mark class='${x === null ? 'null' : typeof x}'>${x}</mark>`;

const replacer =
  (k, v) =>
    k === '' ? v : mark(v);

const pretty =
  o =>
    JSON.stringify(o, replacer, 2);

const markKeys =
  replace(/"(.*)":/g, (_, key) =>
    `<mark class="key">"${key}"</mark>:`);

const wrapStrings =
  replace(/"<mark(.*)>(.*)<\/mark>"/g, (_, attrs, content) =>
    `<mark${attrs}>${attrs.includes('string') ? `"${content}"` : content}</mark>`);

const json =
  compose(wrapStrings, markKeys, pretty, stripUndefined);

const css = /* css */`
[hidden],
:host([hidden]) {
  display: none !important;
}

:host {
  display: block;
  position: relative;
  color: var(--json-viewer-color, currentColor);
}

code { white-space: pre; }
mark { background: none; }

@media (prefers-color-scheme: dark), (prefers-color-scheme: no-preference) {
  :host { background: var(--json-viewer-background, #212529); }
  .key { color: var(--json-viewer-key-color, #ff922b); }
  .boolean { color: var(--json-viewer-boolean-color, #22b8cf); }
  .number { color: var(--json-viewer-number-color, #51cf66); }
  .null { color: var(--json-viewer-null-color, #ff6b6b); }
  .string { color: var(--json-viewer-string-color, #22b8cf); }
}

@media (prefers-color-scheme: light) {
  :host { background: var(--json-viewer-background, white); }
  .key { color: var(--json-viewer-key-color, #f76707); }
  .boolean { color: var(--json-viewer-boolean-color, #0c8599); }
  .number { color: var(--json-viewer-number-color, #0ca678); }
  .null { color: var(--json-viewer-null-color, #e03131); }
  .string { color: var(--json-viewer-string-color, #0c8599); }
}
`;

const template =
  document.createElement('template');

template.innerHTML =
  `<code hidden part="code"></code>`;

const ALATTR = 'allowlist';

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
 * const template = html`<json-viewer .object="${properties}" allowlist="foo,bar"></json-viewer>`;
 * render(template, document.body);
 * ```
 *
 * @example
 * ```html
 * <json-viewer allowlist="meenie,minie">
 *   <script type="application/json">
 *     {
 *       "eenie": 1,
 *       "meenie": true,
 *       "minie": [{ "mo": "catch a tiger by the toe" }]
 *     }
 *   </script>
 * </json-viewer>
 * ```
 *
 * ![Example Markup](example.png)
 *
 * @cssprop --json-viewer-color - Color for generic text. Light white, Dark #212121
 * @cssprop --json-viewer-background - Color for generic text. Light #212121, Dark white
 * @cssprop --json-viewer-key-color - Color for keys. Light #f76707, Dark #ff922b
 * @cssprop --json-viewer-boolean-color - Color for booleans. Light #f76707, Dark #22b8cf
 * @cssprop --json-viewer-number-color - Color for numbers. Light #0ca678, Dark #51cf66
 * @cssprop --json-viewer-null-color - Color for nulls. Light #e03131, Dark #ff6b6b
 * @cssprop --json-viewer-string-color - Color for strings. Light #0c8599, Dark #22b8cf
 *
 * @csspart code - the wrapping `<code>` element
 *
 * @slot - JSON strings appended as text nodes will be parsed and displayed
 */
export class JsonViewer extends HTMLElement {
  static get is() {
    return 'json-viewer';
  }

  static get observedAttributes() {
    return [ALATTR];
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
   * allowlist of keys for the object.
   * Required if setting `object` to a non-serializable object (e.g. an HTMLElement)
   * @type {string|string[]}
   * @attr
   */
  get allowlist() {
    return this.__allowlist;
  }

  set allowlist(val) {
    if (!isAllStrings(val))
      throw new Error('allowlist must be an array of strings');

    this.__allowlist = val;
    const attr = val.join(',');
    this.setAttribute(ALATTR, attr);
    this.render();
  }

  constructor() {
    super();
    this.__mo = new MutationObserver(this.parse.bind(this));
    this.__mo.observe(this, { subtree: true, characterData: true });
    this.attachShadow({ mode: 'open' });
    if ('adoptedStyleSheets' in Document.prototype) {
      const styles = new CSSStyleSheet();
      styles.replaceSync(css);
      this.shadowRoot.adoptedStyleSheets = [styles];
    } else
      this.shadowRoot.innerHTML = `<style>${css}</style>`;

    this.shadowRoot.append(template.content.cloneNode(true));
  }

  attributeChangedCallback(_, __, newVal) {
    const previous = this.allowlist || [];
    const next = newVal || '';
    if (previous.join(',') === next) return;
    this.allowlist = next.split(',').map(trim).filter(Boolean);
  }

  connectedCallback() {
    this.parse();
  }

  /**
   * @private
   * @return {string} syntax-highlighted HTML string
   */
  getHighlightedDomString() {
    const { allowlist, object } = this;
    if (object === undefined) return '';
    const hasAllowList = Array.isArray(allowlist) && allowlist.length;
    const objectToRender = hasAllowList ? pick(allowlist, object) : object;
    return json(objectToRender);
  }

  /** @private */
  render() {
    const highlighted = this.getHighlightedDomString();
    this.shadowRoot.querySelector('code').hidden = !highlighted;
    this.shadowRoot.querySelector('code').innerHTML = highlighted;
  }

  /** @private */
  parse() {
    const parent =
       this.querySelector('script[type="application/json"]') ||
       this.querySelector('script[type="application/ld+json"]') ||
       this;
    const { textContent = '' } = parent;
    if (!textContent.trim()) return;
    try {
      this.object = JSON.parse(textContent);
    } catch (_) {
      this.object = undefined;
    }
  }
}

customElements.define(JsonViewer.is, JsonViewer);
