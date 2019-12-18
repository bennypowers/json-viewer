import './json-viewer.js';
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

describe('json-viewer', function() {
  it('instantiates without throwing', function() {
    expect(() => document.createElement('json-viewer')).not.to.throw;
  });

  describe('with object property set', function() {
    it('displays object properties', async function() {
      const object = { one: 1, two: 'two', null: null, true: true };
      const element = await fixture(html`<json-viewer .object="${object}"></json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>,
            <mark class="key">"two"</mark>:
            <mark class="string">"two"</mark>,
            <mark class="key">"null"</mark>:
            <mark class="null">null</mark>,
            <mark class="key">"true"</mark>:
            <mark class="boolean">true</mark>
          }
        </pre>
      </code>
      `);
    });

    it('hides object properties not in whitelist', async function() {
      const object = { one: 1, two: 'two' };
      const element = await fixture(html`<json-viewer whitelist="one" .object="${object}"></json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>
          }
        </pre>
      </code>
      `);
    });
  });

  describe('with valid JSON string as textContent', function() {
    it('displays object properties', async function() {
      const object = { one: 1 };
      const json = JSON.stringify(object, null, 2);
      const element = await fixture(html`<json-viewer>${json}</json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>
          }
        </pre>
      </code>
      `);
    });

    it('hides object properties not in whitelist', async function() {
      const object = { one: 1, two: 'two' };
      const json = JSON.stringify(object, null, 2);
      const element = await fixture(html`<json-viewer whitelist="one">${json}</json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>
          }
        </pre>
      </code>
      `);
    });
  });

  describe('with Element as property of object', function() {
    it('stringifies element', async function() {
      const object = { one: 1, element: document.createElement('json-viewer') };
      const element = await fixture(html`<json-viewer .object="${object}"></json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>,
            <mark class="key">"element"</mark>:
            <mark class="string">&lt;json-viewer&gt;&lt;/json-viewer&gt;""</mark>
          }
        </pre>
      </code>
      `);
    });
  });

  describe('with undefined property', function() {
    it('strips undefined', async function() {
      const object = { one: 1, undefined: undefined };
      const element = await fixture(html`<json-viewer .object="${object}"></json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>
          }
        </pre>
      </code>
      `);
    });
  });

  describe('with deep properties', function() {
    it('recurses', async function() {
      const object = { one: 1, two: { three: ['four', 'five'] } };
      const element = await fixture(html`<json-viewer .object="${object}"></json-viewer>`);
      // bug in semantic-dom-diff requires weird spacing on closing `}`
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>,
            <mark class="key">"two"</mark>: {
              <mark class="key">"three"</mark>: [
                <mark class="string">"four"</mark>,
                <mark class="string">"five"</mark>
              ]
  }
}
        </pre>
      </code>
      `);
    });
  });

  describe('with invalid JSON string as textContent', function() {
    it('does not display', async function() {
      const json = '{one: one}';
      const element = await fixture(html`<json-viewer>${json}</json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code hidden>
        <pre>
        </pre>
      </code>
      `);
    });
  });

  describe('with comma-separated whitelist attr', function() {
    it('sets whitelist property', async function() {
      const element = await fixture(html`<json-viewer whitelist="one, two,baz"></json-viewer>`);
      expect(element.whitelist).to.deep.equal(['one', 'two', 'baz']);
    });
  });

  describe('when setting invalid whitelist property', function() {
    it('sets whitelist property', async function() {
      const element = await fixture(html`<json-viewer></json-viewer>`);
      expect(() => element.whitelist = 'one').to.throw('whitelist must be an array of strings');
    });
  });

  describe('polyfills', function() {
    it('polyfills adoptedStyleSheets', async function() {
      delete Document.prototype.adoptedStyleSheets;
      const element = await fixture(html`<json-viewer>{"one":"two"}</json-viewer>`);
      const string = element.shadowRoot.querySelector('.string');
      expect(getComputedStyle(string).getPropertyValue('color')).to.equal('rgb(34, 184, 207)');
    });

    it('polyfills Object.fromEntries', async function() {
      delete Object.fromEntries;
      const object = { one: 1, two: 'two' };
      const element = await fixture(html`<json-viewer whitelist="one" .object="${object}"></json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>
          }
        </pre>
      </code>
      `);
    });

    it('polyfills Array#flatMap', async function() {
      delete Array.prototype.flatMap;
      const object = { one: 1, two: 'two' };
      const element = await fixture(html`<json-viewer whitelist="one" .object="${object}"></json-viewer>`);
      expect(element).shadowDom.to.equal(`
      <code>
        <pre>
          {
            <mark class="key">"one"</mark>:
            <mark class="number">1</mark>
          }
        </pre>
      </code>
      `);
    });
  });
});
