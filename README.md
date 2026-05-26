# figma2scss

VSCode extension that transforms Figma-copied CSS into project SCSS mixins.

## Install

Search for **figma2scss** in the VS Code Extensions panel and click Install.

## Usage

`Cmd+Shift+G` — works two ways:

- **text selected** → transforms the selection in place
- **no selection** → reads from clipboard, inserts at cursor

## Font family map

The extension maps Figma's `font-family` value to the token used in your `font-family()` mixin.

### Auto-detection

The extension reads your project's SCSS files automatically — no configuration needed. It expects:

- `scss/includes/_fonts.scss` — `$fonts` map: token → variable
- `scss/includes/variables/_fonts.scss` — variable definitions: `$font-display: "GT-Era-Display", ...`

```scss
// variables/_fonts.scss
$font-display: "GT-Era-Display", sans-serif;
$font-text: "GT-Era-Text", sans-serif;

// _fonts.scss
$fonts: (
  display: $font-display,
  text: $font-text,
);
```

A font named `GT Era Display Trial` from Figma matches `GT-Era-Display` → `@include font-family(display, 500);`.

Both files are watched — changes take effect immediately without reloading the editor.

### Manual override

To override auto-detection, set `figma2scss.fontFamilyMap` in `settings.json`. Keys are matched case-insensitively against the Figma font name; first match wins.

```json
"figma2scss.fontFamilyMap": {
  "gt era display": "display",
  "gt era text": "text",
  "helvetica": "helvetica"
}
```

## Transforms

| Figma CSS | SCSS output |
|-----------|-------------|
| `font-family: GT Era Display Trial` + `font-weight: 500` | `@include font-family(display, 500);` |
| `font-size: 18px` + `line-height: 87%` | `@include font-size(18, 0.87);` |
| `letter-spacing: -1%` | `letter-spacing: -0.01em;` |
| `width: 390` / `top: 285px` | `width: rem(390)` / `top: rem(285)` |
| `background: var(--Name, #191919)` | `background: #191919` |
| `background: #EAEAE3B2` | `background: rgba(#EAEAE3, 0.7)` |
| `backdrop-filter: blur(25px)` | `backdrop-filter: blur(rem(25))` |
| `opacity: 1` | *(removed)* |
| `leading-trim`, `font-style`, `angle` | *(removed)* |
