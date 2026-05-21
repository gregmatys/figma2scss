# figma2scss

VSCode extension that transforms selected Figma CSS into project SCSS mixins.

## Install

```bash
bash ~/Work/figma2scss-vscode/install.sh
```

Then reload VSCode (`Cmd+Shift+P → Reload Window`).

## Usage

`Cmd+Shift+G` — działa dwojako:

- **zaznaczony tekst** → zamienia zaznaczenie w miejscu
- **brak zaznaczenia** → czyta ze schowka, wstawia w miejscu kursora

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
