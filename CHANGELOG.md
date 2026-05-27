# Changelog

## [1.0.3] - 2026-05-26

### Added
- Context menu entry (right-click → **Figma → SCSS: Transform selection**)
- Editor title bar button (icon in top-right corner of the editor)
- README reorganized: features overview, all trigger options, custom shortcut instructions

## [1.0.2] - 2026-05-26

### Fixed
- README: corrected default shortcut for Windows/Linux (`Ctrl+Shift+G`)

## [1.0.1] - 2026-05-26

### Fixed
- Skip `letter-spacing` when Figma returns `0%` (previously emitted `letter-spacing: 0em`)

## [1.0.0] - 2026-05-21

### Added
- `@vscode/vsce` as devDependency

## [0.0.4] - 2026-05-21

### Added
- Font family map configurable via VS Code settings (`figma2scss.fontFamilyMap`)
- Auto-detection of font family map from project `_fonts.scss`

## [0.0.3] - 2026-05-21

### Added
- npm scripts for packaging (`vsce package`) and publishing (`vsce publish`)
- MIT license and `.vscodeignore` for Marketplace publishing
- `.gitignore` to exclude VSIX build artifacts
- Publisher, author, and repository info in `package.json`

### Changed
- Rewrote install script to use VSIX with support for VS Code, Cursor, and Windsurf

## [0.0.2] - 2026-05-21

### Added
- Install script
- Clipboard fallback when no text is selected in the editor
- README translated to English

## [0.0.1] - 2026-05-21

### Added
- Initial release — transform Figma CSS selection to SCSS mixins via `Cmd+Shift+G` / `Ctrl+Shift+G`
