# Stylelint Value No Deprecated Custom Properties

[Stylelint Value No Deprecated Custom Properties] is a [stylelint] rule to disallow usage of
deprecated custom properties.

> [!NOTE]  
> All credits to the creators and contributors of the [stylelint-value-no-deprecated-custom-properties](https://github.com/csstools/stylelint-value-no-deprecated-custom-properties) plugin, of which this plugin very much relies on.

## Usage

Add [stylelint] and [Stylelint Value No Deprecated Custom Properties] to your project.

```bash
npm install stylelint stylelint-value-no-deprecated-custom-properties --save-dev
```

Add [Stylelint Value No Deprecated Custom Properties] to your [stylelint configuration].

```js
{
  "plugins": [
    "stylelint-value-no-deprecated-custom-properties"
  ],
  "rules": {
    "custom-properties/no-deprecated": true || null
  }
}
```

## Options

### true

If the first option is `true`, then [Stylelint Value No Deprecated Custom Properties]
requires all custom properties not to be deprecated, and the following patterns are
_not_ considered violations:

```css
:root {
  --brand-blue: #33f;
}

.example {
  color: var(--brand-blue);
}
```

```css
.example {
  color: var(--brand-blue);
}

.some-other-class {
  --brand-blue: #33f;
}
```

```css
:root {
  --brand-blue: #33f;
  --brand-color: var(--brand-blue);
}
```

While the following patterns are considered violations:

```css
.example {
  color: var(--brand-blue);
}
```

```css
:root {
  /* @deprecated */
  --brand-color: var(--brand-blue);
}
```

Custom Properties can be imported using the second option.

### `null`

If the first option is `null`, then
[Stylelint Value No Deprecated Custom Properties] does nothing.

---

### importFrom

When the first option is `true`, then the second option can specify sources
where Custom Properties should be imported from by using an `importFrom` key.
These imports might be CSS, JS, and JSON files, functions, and directly passed
objects.

The plugin resolves relative paths from the current working directory
which may not work in monorepos, in which case it is best to pass only absolute
paths to the plugin.

```js
// .stylelintrc
{
  "plugins": [
    "stylelint-value-no-deprecated-custom-properties"
  ],
  "rules": {
    "custom-properties/no-deprecated": [true, {
      "importFrom": [
        "path/to/file.css", // => :root { --brand-blue: #33f; }
      ]
    }]
  }
}
```

### resolver

Use this option to configure how the rule solve paths of `@import` rules.

```js
// .stylelintrc
{
  "plugins": [
    "stylelint-value-no-deprecated-custom-properties"
  ],
  "rules": {
    "custom-properties/no-deprecated": [true, {
      "resolver": {
        "extensions": [".css"], // => default to [".css"]
        "paths": ["./assets/css", "./static/css"], // => paths to look for files, default to []
        "moduleDirectories": ["node_modules"] // => modules folder to look for files, default to ["node_modules"]
      }
    }]
  }
}
```
