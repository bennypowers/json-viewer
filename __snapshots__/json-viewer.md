# `json-viewer`

## `with object property set`

####   `hides object properties not in allowlist`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  }
</code>

```

## `with JSON script child`

####   `displays object properties`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  }
</code>

```

## `with JSON-LD script child`

####   `displays object properties`

```html
<code part="code">
  {
  <mark class="key">
    "@context"
  </mark>
  :
  <mark class="string">
    "https://json-ld.org/contexts/person.jsonld"
  </mark>
  ,
  <mark class="key">
    "@id"
  </mark>
  :
  <mark class="string">
    "http://dbpedia.org/resource/John_Lennon"
  </mark>
  ,
  <mark class="key">
    "name"
  </mark>
  :
  <mark class="string">
    "John Lennon"
  </mark>
  ,
  <mark class="key">
    "born"
  </mark>
  :
  <mark class="string">
    "1940-10-09"
  </mark>
  ,
  <mark class="key">
    "spouse"
  </mark>
  :
  <mark class="string">
    "http://dbpedia.org/resource/Cynthia_Lennon"
  </mark>
  }
</code>

```

## `with valid JSON string as textContent`

####   `displays object properties`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  }
</code>

```

####   `hides object properties not in allowlist`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  }
</code>

```

## `with Element as property of object`

####   `stringifies element`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  ,
  <mark class="key">
    "el"
  </mark>
  :
  <mark class="string">
    <json-viewer></json-viewer>""
  </mark>
  }
</code>

```

## `with undefined property`

####   `strips undefined`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  }
</code>

```

## `with deep properties`

####   `recurses`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  ,
  <mark class="key">
    "two"
  </mark>
  : {
  <mark class="key">
    "three"
  </mark>
  : [
  <mark class="string">
    "four"
  </mark>
  ,
  <mark class="string">
    "five"
  </mark>
  ]
  }
}
</code>

```

## `with invalid JSON string`

####   `does not display`

```html
<code
  hidden=""
  part="code"
>
</code>

```

## `with invalid JSON string as textContent`

####   `does not display`

```html
<code
  hidden=""
  part="code"
>
</code>

```

## `polyfills`

####   `polyfills Object.fromEntries`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  }
</code>

```

####   `polyfills Array#flatMap`

```html
<code part="code">
  {
  <mark class="key">
    "one"
  </mark>
  :
  <mark class="number">
    1
  </mark>
  }
</code>

```

