# stylelint-value-no-deprecated-custom-properties

stylelint-value-no-deprecated-custom-properties is a [stylelint] rule to disallow usage of deprecated custom properties by them with a comment containing `@deprecated`.

Handy for guiding Design System consumers though a deprecation cycle of vanilla CSS custom properties a.k.a Design Tokens in said context.

> [!NOTE]  
> Big shout out to the creators and contributors of the [stylelint-value-no-unknown-custom-properties](https://github.com/csstools/stylelint-value-no-unknown-custom-properties) plugin, of which this plugin reuses quite a lot from 🙌.

## Usage

Add [stylelint] and stylelint-value-no-deprecated-custom-properties to your project.

```bash
npm install stylelint stylelint-value-no-deprecated-custom-properties --save-dev
```

Add stylelint-value-no-deprecated-custom-properties to your [stylelint configuration].

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

To deprecate a custom property, add a comment on the line before starting with `@deprecated` and optionally add a description after `@deprecated` to guide the user to which custom property they should use instead.

## Options

### true

If the first option is `true`, then stylelint-value-no-deprecated-custom-properties requires all custom properties not to be deprecated.

The following patterns are considered violations:

```css
:root {
  /* @deprecated Use --brand-color-new */
  --brand-color: blue;
  --brand-color-new: green;
}

.example {
  color: var(--brand-blue);
}
```

custom properties can be imported using the second option.

### `null`

If the first option is `null`, then
stylelint-value-no-deprecated-custom-properties does nothing.

---

### importFrom

When the first option is `true`, then the second option can specify sources where custom properties should be imported from other CSS files by using an `importFrom` key.

The plugin resolves relative paths from the current working directory which may not work in monorepos, in which case it is best to pass only absolute paths to the plugin.

```js
// .stylelintrc
{
  "plugins": [
    "stylelint-value-no-deprecated-custom-properties"
  ],
  "rules": {
    "custom-properties/no-deprecated": [true, {
      "importFrom": [
        "path/to/file.css", // => :root { /* @deprecated */ --brand-blue: #33f; }
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
