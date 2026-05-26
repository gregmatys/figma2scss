# figma2scss

VSCode extension that transforms Figma-copied CSS into project SCSS mixins.

## Features

- **Font family & weight** — converts `font-family` + `font-weight` into `@include font-family(token, weight)`
- **Font size & line height** — converts `font-size` + `line-height` into `@include font-size(size, lh)`
- **Letter spacing** — converts percentage values to `em` units
- **Pixel → rem** — wraps `px` values in `rem()` for layout properties (width, height, padding, margin, gap, border-radius, and more)
- **CSS variables** — resolves `var(--Name, fallback)` to the fallback value
- **8-digit hex colors** — converts `#RRGGBBAA` to `rgba(#RRGGBB, opacity)`
- **Blur** — converts `blur(25px)` to `blur(rem(25))`
- **Noise removal** — strips `opacity: 1`, `leading-trim`, `font-style`, `angle`
- **Auto font detection** — reads your project SCSS files to map font names automatically, no config needed
- **Context menu** — right-click in the editor to run the transform

## Usage

Select Figma CSS in the editor and trigger the command — or copy it to the clipboard and trigger without a selection.

**Trigger options:**

- Keyboard shortcut: `Cmd+Shift+G` (Mac) / `Ctrl+Shift+G` (Windows/Linux)
- Right-click in the editor → **Figma → SCSS: Transform selection**
- Command Palette: `Cmd+Shift+P` → search **Figma → SCSS**

| Figma CSS | SCSS output |
|-----------|-------------|
| `font-family: GT Era Display Trial` + `font-weight: 500` | `@include font-family(display, 500);` |
| `font-size: 18px` + `line-height: 87%` | `@include font-size(18, 0.87);` |
| `letter-spacing: -1%` | `letter-spacing: -0.01em;` |
| `width: 390` / `top: 285px` | `width: rem(390)` / `top: rem(285)` |
| `background: var(--Name, &#35;191919)` | `background: &#35;191919` |
| `background: &#35;EAEAE3B2` | `background: rgba(&#35;EAEAE3, 0.7)` |
| `backdrop-filter: blur(25px)` | `backdrop-filter: blur(rem(25))` |
| `opacity: 1` | *(removed)* |
| `leading-trim`, `font-style`, `angle` | *(removed)* |

## Configuration

### Custom keyboard shortcut

Open the keyboard shortcuts editor (`Cmd+K Cmd+S` on Mac, `Ctrl+K Ctrl+S` on Windows/Linux), search for **Figma → SCSS: Transform selection**, and assign any key combination you prefer.

### Font family map

The extension maps Figma's `font-family` value to the token used in your `font-family()` mixin.

**Auto-detection**

The extension reads your project SCSS files automatically — no configuration needed. It expects:

- `scss/includes/_fonts.scss` — `$fonts` map: token → variable
- `scss/includes/variables/_fonts.scss` — variable definitions

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

A font named `GT Era Display Trial` from Figma matches `GT-Era-Display` → `@include font-family(display, 500)`.

Both files are watched — changes take effect immediately without reloading the editor.

**Manual override**

To override auto-detection, set `figma2scss.fontFamilyMap` in `settings.json`. Keys are matched case-insensitively against the Figma font name; first match wins.

```json
"figma2scss.fontFamilyMap": {
  "gt era display": "display",
  "gt era text": "text",
  "helvetica": "helvetica"
}
```
