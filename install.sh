#!/bin/bash
set -e

VSIX=$(ls figma2scss-*.vsix 2>/dev/null | sort -V | tail -1)

if [ -z "$VSIX" ]; then
    echo "No .vsix file found. Building..."
    if ! command -v vsce &>/dev/null; then
        npm install -g @vscode/vsce
    fi
    vsce package
    VSIX=$(ls figma2scss-*.vsix | sort -V | tail -1)
fi

for CMD in code cursor codium; do
    if command -v "$CMD" &>/dev/null; then
        echo "Installing $VSIX via $CMD..."
        "$CMD" --install-extension "$VSIX"
        echo "Done. Restart your editor (Cmd+Shift+P → Reload Window)."
        exit 0
    fi
done

echo "No editor found (code, cursor, codium). Install VS Code or add it to PATH."
exit 1
