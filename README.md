# figma2scss

VSCode extension that transforms Figma-copied CSS into project SCSS mixins.

## Install

```bash
bash ~/Work/figma2scss-vscode/install.sh
```

Reload VSCode after install (`Cmd+Shift+P → Reload Window`).

## Usage

`Cmd+Shift+G` — works two ways:

- **text selected** → transforms the selection in place
- **no selection** → reads from clipboard, inserts at cursor

## Font family map

The extension maps keywords found in Figma's `font-family` value to tokens used in your `font-family()` mixin. The default map:

```json
{
  "display": "display",
  "text": "text"
}
```

A font named `GT Era Display Trial` matches `display` → `@include font-family(display, 500);`.

To customize, add to your project or user `settings.json`:

```json
"figma2scss.fontFamilyMap": {
  "display": "display",
  "text": "text",
  "mono": "mono",
  "condensed": "condensed"
}
```

Keys are matched case-insensitively against the font name. The first match wins. If nothing matches, `text` is used as a fallback.

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
