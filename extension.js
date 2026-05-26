const vscode = require('vscode');

const DEFAULT_FAMILY_MAP = { 'display': 'display', 'text': 'text' };
const SKIP_PROPS = new Set(['font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing', 'font-style', 'leading-trim']);
const DROP_PROPS = new Set(['angle']);
const REM_PROPS = new Set([
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'top', 'right', 'bottom', 'left',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'gap', 'row-gap', 'column-gap',
    'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-width',
    'translate', 'transform', 'inset',
]);

let cachedFamilyMap = null;

async function buildFamilyMapFromScss() {
    const mainFiles = await vscode.workspace.findFiles('**/scss/includes/_fonts.scss', null, 1);
    if (!mainFiles.length) return null;

    const mainContent = Buffer.from(await vscode.workspace.fs.readFile(mainFiles[0])).toString();

    const mapMatch = mainContent.match(/\$fonts\s*:\s*\(([^)]+)\)/s);
    if (!mapMatch) return null;

    const tokenToVar = {};
    for (const m of mapMatch[1].matchAll(/^\s*(\w+)\s*:\s*(\$[\w-]+)/gm)) {
        tokenToVar[m[1]] = m[2];
    }
    if (!Object.keys(tokenToVar).length) return null;

    const varFiles = await vscode.workspace.findFiles('**/scss/includes/variables/_fonts.scss', null, 1);
    if (!varFiles.length) {
        const map = {};
        for (const token of Object.keys(tokenToVar)) map[token] = token;
        return map;
    }

    const varContent = Buffer.from(await vscode.workspace.fs.readFile(varFiles[0])).toString();

    const varDefs = {};
    for (const m of varContent.matchAll(/\$(font-[\w-]+)\s*:\s*["']([^"']+)["']/g)) {
        varDefs['$' + m[1]] = m[2];
    }

    const map = {};
    for (const [token, varName] of Object.entries(tokenToVar)) {
        const fontName = varDefs[varName];
        if (fontName) {
            map[fontName.toLowerCase().replace(/-/g, ' ')] = token;
        } else {
            map[token] = token;
        }
    }

    return Object.keys(map).length ? map : null;
}

async function getFamilyMap() {
    const config = vscode.workspace.getConfiguration('figma2scss');
    const fromSettings = config.get('fontFamilyMap');
    if (fromSettings && Object.keys(fromSettings).length) return fromSettings;
    if (cachedFamilyMap) return cachedFamilyMap;
    cachedFamilyMap = await buildFamilyMapFromScss() || DEFAULT_FAMILY_MAP;
    return cachedFamilyMap;
}

async function resolveFontFamily(value) {
    const normalized = value.toLowerCase().replace(/-/g, ' ');
    for (const [keyword, token] of Object.entries(await getFamilyMap())) {
        if (normalized.includes(keyword)) return token;
    }
    return 'text';
}

function percentToDecimal(value) {
    const n = parseFloat(value);
    return (n / 100).toFixed(2).replace(/\.?0+$/, '') || '0';
}

function resolveVar(value) {
    return value.replace(/var\([^,)]+,\s*([^)]+)\)/g, (_, fallback) => fallback.trim());
}

function resolveHexAlpha(value) {
    return value.replace(/#([0-9a-fA-F]{6})([0-9a-fA-F]{2})\b/g, (_, hex, alpha) => {
        const opacity = parseFloat((parseInt(alpha, 16) / 255).toFixed(2));
        return opacity === 1 ? `#${hex}` : `rgba(#${hex}, ${opacity})`;
    });
}

function resolveBlur(value) {
    return value.replace(/blur\((\d+(?:\.\d+)?)px\)/g, (_, n) => `blur(rem(${n}))`);
}

function resolveRem(prop, value) {
    if (!REM_PROPS.has(prop)) return value;
    if (/^\d+(\.\d+)?$/.test(value)) return `rem(${value})`;
    return value.replace(/(\d+(?:\.\d+)?)px/g, (_, n) => `rem(${n})`);
}

async function transform(input) {
    const lines = input.trim().split('\n');
    const props = {};

    for (const line of lines) {
        const match = line.match(/^\s*([\w-]+)\s*:\s*(.+?)\s*;?\s*$/);
        if (match) {
            props[match[1].trim()] = resolveHexAlpha(resolveBlur(resolveVar(match[2].trim())));
        }
    }

    const output = [];

    if (props['font-family']) {
        const family = await resolveFontFamily(props['font-family']);
        const weight = props['font-weight'] || '400';
        output.push(`@include font-family(${family}, ${weight});`);
    }

    if (props['font-size']) {
        const size = parseInt(props['font-size'], 10);
        let lhArg = '';
        if (props['line-height']) {
            const lh = props['line-height'];
            if (lh.endsWith('%')) {
                lhArg = `, ${percentToDecimal(lh)}`;
            } else if (!isNaN(parseFloat(lh))) {
                lhArg = `, ${lh}`;
            }
        }
        output.push(`@include font-size(${size}${lhArg});`);
    }

    if (props['letter-spacing']) {
        const ls = props['letter-spacing'];
        if (ls.endsWith('%')) {
            const num = parseFloat(ls);
            if (num !== 0) {
                const val = (num / 100).toFixed(4).replace(/0+$/, '');
                output.push(`letter-spacing: ${val}em;`);
            }
        } else if (ls !== '0' && ls !== 'normal') {
            output.push(`letter-spacing: ${ls};`);
        }
    }

    const passthroughProps = Object.entries(props).filter(([k, v]) => {
        if (SKIP_PROPS.has(k)) return false;
        if (DROP_PROPS.has(k)) return false;
        if (k === 'opacity' && v === '1') return false;
        return true;
    });

    for (const [prop, val] of passthroughProps) {
        output.push(`${prop}: ${resolveRem(prop, val)};`);
    }

    return output.join('\n');
}

function activate(context) {
    const invalidate = () => { cachedFamilyMap = null; };
    for (const pattern of ['**/scss/includes/_fonts.scss', '**/scss/includes/variables/_fonts.scss']) {
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);
        watcher.onDidChange(invalidate);
        watcher.onDidCreate(invalidate);
        context.subscriptions.push(watcher);
    }

    const disposable = vscode.commands.registerCommand('figma2scss.transform', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (selectedText.trim()) {
            const result = await transform(selectedText);
            editor.edit(editBuilder => editBuilder.replace(selection, result));
            return;
        }

        const clipboard = await vscode.env.clipboard.readText();
        if (!clipboard.trim()) {
            vscode.window.showWarningMessage('Figma → SCSS: brak zaznaczenia i pusty schowek');
            return;
        }

        const result = await transform(clipboard);
        editor.edit(editBuilder => editBuilder.insert(editor.selection.active, result));
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
exports.deactivate = function () {};
