#!/bin/bash
DEST="$HOME/.vscode/extensions/figma2scss"
mkdir -p "$DEST"
cp "$(dirname "$0")/extension.js" "$DEST/"
cp "$(dirname "$0")/package.json" "$DEST/"
echo "Zainstalowano. Zrestartuj VSCode (Cmd+Shift+P → Reload Window)."
