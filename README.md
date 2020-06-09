# json-viewer

Custom Element that shows a JavaScript object's properties as syntax-highlighted JSON.

The element will respect `prefers-color-scheme` by default, but if you use the
CSS Custom Properties listed below, you should customize both light and dark themes.

❤️ Proudly uses [open-wc](https://open-wc.org) tools and recommendations.

## Examples

```javascript
const properties = {foo: 'foo', bar: 'bar', baz: 'baz'};
const template = html`<json-viewer .object="${properties}" allowlist="foo,bar"></json-viewer>`;
render(template, document.body);
```

```html
<json-viewer allowlist="foo,bar">
  <script type="application/json">
    {
      "foo": "foo",
      "bar": "bar",
      "baz": "baz"
    }
  </script>
</json-viewer>
```

## Properties

| Property    | Attribute   | Type       | Description                                      |
|-------------|-------------|------------|--------------------------------------------------|
| `allowlist` | `allowlist` | `string[]` | allowlist of keys for the object.<br />Required if setting `object` to a non-serializable object (e.g. an HTMLElement) |
| `object`    |             | `object`   | Object to display                                |

## Slots

| Name | Description                                      |
|------|--------------------------------------------------|
|      | JSON strings appended as text nodes will be parsed and displayed |

## CSS Shadow Parts

| Part   | Description                   |
|--------|-------------------------------|
| `code` | the wrapping `<code>` element |

## CSS Custom Properties

| Property                      | Description                                      |
|-------------------------------|--------------------------------------------------|
| `--json-viewer-background`    | Color for generic text. Light #212121, Dark white |
| `--json-viewer-boolean-color` | Color for booleans. Light #f76707, Dark #22b8cf  |
| `--json-viewer-color`         | Color for generic text. Light white, Dark #212121 |
| `--json-viewer-key-color`     | Color for keys. Light #f76707, Dark #ff922b      |
| `--json-viewer-null-color`    | Color for nulls. Light #e03131, Dark #ff6b6b     |
| `--json-viewer-number-color`  | Color for numbers. Light #0ca678, Dark #51cf66   |
| `--json-viewer-string-color`  | Color for strings. Light #0c8599, Dark #22b8cf   |
