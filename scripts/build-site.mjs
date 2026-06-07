/**
 * build-site.mjs
 * Reads docs/*.md and writes site/{lint,std,typing,fmt}/index.html
 * Run: node scripts/build-site.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ── YAML front matter parser ────────────────────────────────────────────────

function parseFrontMatter(src) {
    const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (!m) return { meta: {}, body: src }
    const meta = {}
    for (const line of m[1].split('\n')) {
        const kv = line.match(/^(\w+):\s*"?(.*?)"?\s*$/)
        if (kv) meta[kv[1]] = kv[2]
    }
    return { meta, body: m[2] }
}

// ── TypeScript syntax highlighter ───────────────────────────────────────────

const KEYWORDS = new Set([
    'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while',
    'import', 'export', 'from', 'type', 'async', 'await', 'new', 'class',
    'interface', 'extends', 'null', 'undefined', 'true', 'false', 'void',
    'readonly', 'abstract', 'as', 'in', 'of', 'break', 'continue', 'switch',
    'case', 'default', 'throw', 'try', 'catch', 'finally', 'enum',
    'implements', 'declare', 'override', 'namespace', 'module', 'typeof',
    'instanceof', 'keyof', 'infer',
])

const PRIMITIVE_TYPES = new Set([
    'string', 'number', 'boolean', 'unknown', 'never', 'any', 'symbol',
    'bigint', 'object',
])

function escHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function highlightTs(code) {
    // We tokenise by scanning left-to-right, emitting HTML spans.
    // Order: comments > strings > identifiers
    let out = ''
    let i = 0
    const len = code.length

    while (i < len) {
        // Line comment
        if (code[i] === '/' && code[i + 1] === '/') {
            const end = code.indexOf('\n', i)
            const slice = end === -1 ? code.slice(i) : code.slice(i, end)
            out += `<span class="cm">${escHtml(slice)}</span>`
            i = end === -1 ? len : end
            continue
        }

        // Block comment
        if (code[i] === '/' && code[i + 1] === '*') {
            const end = code.indexOf('*/', i + 2)
            const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2)
            out += `<span class="cm">${escHtml(slice)}</span>`
            i = end === -1 ? len : end + 2
            continue
        }

        // Template literal
        if (code[i] === '`') {
            let j = i + 1
            let inner = '`'
            while (j < len) {
                if (code[j] === '\\') { inner += code[j] + code[j + 1]; j += 2; continue }
                if (code[j] === '`') { inner += '`'; j++; break }
                if (code[j] === '$' && code[j + 1] === '{') {
                    // find matching }
                    inner += '${'
                    j += 2
                    let depth = 1
                    let interp = ''
                    while (j < len && depth > 0) {
                        if (code[j] === '{') depth++
                        else if (code[j] === '}') { depth--; if (depth === 0) { j++; break } }
                        interp += code[j++]
                    }
                    // Highlight the interpolated expression as identifiers (.op)
                    out += `<span class="st">${escHtml(inner)}</span><span class="op">\${</span>`
                    out += `<span class="op">${escHtml(interp)}</span>`
                    out += `<span class="op">}</span>`
                    inner = ''
                    continue
                }
                inner += code[j++]
            }
            if (inner) out += `<span class="st">${escHtml(inner)}</span>`
            i = j
            continue
        }

        // Single-quoted string
        if (code[i] === "'") {
            let j = i + 1
            let s = "'"
            while (j < len) {
                if (code[j] === '\\') { s += code[j] + (code[j + 1] || ''); j += 2; continue }
                s += code[j]
                if (code[j++] === "'") break
            }
            out += `<span class="st">${escHtml(s)}</span>`
            i = j
            continue
        }

        // Double-quoted string
        if (code[i] === '"') {
            let j = i + 1
            let s = '"'
            while (j < len) {
                if (code[j] === '\\') { s += code[j] + (code[j + 1] || ''); j += 2; continue }
                s += code[j]
                if (code[j++] === '"') break
            }
            out += `<span class="st">${escHtml(s)}</span>`
            i = j
            continue
        }

        // Number
        if (/[0-9]/.test(code[i]) && (i === 0 || /\W/.test(code[i - 1]))) {
            let j = i
            while (j < len && /[0-9._xXa-fA-FnNoObBbB]/.test(code[j])) j++
            out += `<span class="nu">${escHtml(code.slice(i, j))}</span>`
            i = j
            continue
        }

        // Identifier or keyword
        if (/[a-zA-Z_$]/.test(code[i])) {
            let j = i
            while (j < len && /[a-zA-Z0-9_$]/.test(code[j])) j++
            const word = code.slice(i, j)
            const after = code[j]

            if (KEYWORDS.has(word)) {
                // Special case: "import type" — both words are kw but rendered together ok
                out += `<span class="kw">${escHtml(word)}</span>`
            } else if (PRIMITIVE_TYPES.has(word)) {
                out += `<span class="ty">${escHtml(word)}</span>`
            } else if (/^[A-Z]/.test(word)) {
                out += `<span class="ty">${escHtml(word)}</span>`
            } else if (after === '(') {
                out += `<span class="fn">${escHtml(word)}</span>`
            } else {
                out += `<span class="op">${escHtml(word)}</span>`
            }
            i = j
            continue
        }

        out += escHtml(code[i++])
    }

    return out
}

// ── CSS shared across all pages ──────────────────────────────────────────────

const SHARED_CSS = `
            :root {
                --bg: #0d0d10;
                --surface: #16161a;
                --border: #2a2a32;
                --text: #e8e8f0;
                --muted: #7a7a90;
                --accent: #c8702a;
                --green: #4ec994;
                --red: #e05c5c;
                --keyword: #c792ea;
                --string: #c3e88d;
                --type: #82aaff;
                --comment: #546e7a;
                --fn: #82aaff;
                --num: #f78c6c;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
                background: var(--bg);
                color: var(--text);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                font-size: 16px;
                line-height: 1.6;
            }

            a { color: var(--accent); text-decoration: none; }
            a:hover { text-decoration: underline; }
            a.ext::after { content: " ↗"; font-size: 0.75em; opacity: 0.5; }

            nav {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.25rem 2rem;
                border-bottom: 1px solid var(--border);
                position: sticky;
                top: 0;
                background: rgba(13, 13, 16, 0.92);
                backdrop-filter: blur(8px);
                z-index: 10;
            }

            .nav-logo {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 1.05rem;
                font-weight: 700;
                letter-spacing: -0.02em;
                text-decoration: none;
            }
            .nav-logo .brand { color: var(--accent); }
            .nav-logo .route { color: var(--text); }

            .nav-links {
                display: flex;
                gap: 0.2rem;
                list-style: none;
            }
            .nav-links a {
                font-size: 0.82rem;
                color: var(--muted);
                padding: 0.3rem 0.7rem;
                border-radius: 5px;
            }
            .nav-links a:hover {
                color: var(--text);
                background: rgba(255, 255, 255, 0.05);
                text-decoration: none;
            }
            .nav-links a[aria-current="page"] { color: var(--text); }

            .nav-divider {
                width: 1px;
                height: 1rem;
                background: var(--border);
                margin: 0 0.3rem;
                align-self: center;
                list-style: none;
            }

            .nav-ext { font-size: 0.78rem !important; }

            .page-header {
                max-width: 860px;
                margin: 0 auto;
                padding: 4rem 2rem 3rem;
            }

            .page-badge {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.68rem;
                letter-spacing: 0.14em;
                color: var(--accent);
                text-transform: uppercase;
                margin-bottom: 0.6rem;
            }

            .page-header h1 {
                font-size: clamp(1.8rem, 4vw, 2.4rem);
                font-weight: 800;
                letter-spacing: -0.035em;
                line-height: 1.2;
                margin-bottom: 0.75rem;
            }

            .page-header h1 em {
                font-style: normal;
                color: var(--accent);
            }

            .page-header .sub {
                font-size: 1rem;
                color: var(--muted);
                max-width: 540px;
                line-height: 1.7;
                margin-bottom: 2rem;
            }

            .content {
                max-width: 860px;
                margin: 0 auto;
                padding: 0 2rem 4rem;
            }

            .section-label {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.68rem;
                letter-spacing: 0.14em;
                color: var(--accent);
                text-transform: uppercase;
                margin-bottom: 0.6rem;
            }

            h2 {
                font-size: 1.35rem;
                font-weight: 700;
                letter-spacing: -0.025em;
                margin-bottom: 0.5rem;
            }

            .section-desc {
                color: var(--muted);
                font-size: 0.92rem;
                line-height: 1.7;
                margin-bottom: 1.75rem;
            }

            .section-desc code {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.85em;
                color: var(--type);
                background: rgba(130, 170, 255, 0.08);
                padding: 0.05rem 0.3rem;
                border-radius: 3px;
            }

            .install-block {
                max-width: 860px;
                margin: 0 auto;
                padding: 0 2rem 3rem;
            }

            .install-label {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.65rem;
                letter-spacing: 0.12em;
                color: var(--accent);
                text-transform: uppercase;
                margin-bottom: 0.6rem;
            }

            .install-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                margin-bottom: 1.25rem;
                align-items: center;
            }

            .install-cmd {
                display: inline-flex;
                align-items: center;
                gap: 0.6rem;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 0.6rem 1.1rem;
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.82rem;
            }
            .install-cmd .prompt { color: var(--muted); }
            .install-cmd .cmd { color: var(--green); }

            .install-note {
                font-size: 0.8rem;
                color: var(--muted);
            }
            .install-note code {
                font-family: "SF Mono", "Fira Code", monospace;
                color: var(--text);
                background: var(--surface);
                padding: 0.1rem 0.3rem;
                border-radius: 3px;
            }

            .install-step {
                border: 1px solid var(--border);
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 0.75rem;
            }
            .install-step-label {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.65rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: var(--accent);
                padding: 0.5rem 1.25rem;
                border-bottom: 1px solid var(--border);
                background: #0f0f13;
            }
            .install-step pre { background: var(--surface); margin: 0; }

            .comparison {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
                border: 1px solid var(--border);
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 2.5rem;
            }

            @media (max-width: 640px) {
                .comparison { grid-template-columns: 1fr; }
            }

            .pane-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.6rem 1rem;
                font-size: 0.72rem;
                font-weight: 600;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                border-bottom: 1px solid var(--border);
            }

            .pane-before .pane-label {
                background: rgba(224, 92, 92, 0.08);
                color: var(--red);
            }
            .pane-after .pane-label {
                background: rgba(78, 201, 148, 0.08);
                color: var(--green);
                border-left: 1px solid var(--border);
            }
            .pane-before { background: var(--surface); }
            .pane-after { background: #131318; border-left: 1px solid var(--border); }

            .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; }
            .dot-red { background: var(--red); opacity: 0.7; }
            .dot-green { background: var(--green); opacity: 0.7; }

            pre {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.8rem;
                line-height: 1.7;
                padding: 1.25rem 1.25rem 1.5rem;
                overflow-x: auto;
                white-space: pre;
            }

            .callout {
                background: var(--surface);
                border: 1px solid var(--border);
                border-left: 3px solid var(--accent);
                border-radius: 8px;
                padding: 1rem 1.25rem;
                font-size: 0.875rem;
                color: var(--muted);
                margin-bottom: 2.5rem;
            }
            .callout strong { color: var(--text); }
            .callout code {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.8em;
                color: var(--type);
                background: rgba(130, 170, 255, 0.08);
                padding: 0.05rem 0.3rem;
                border-radius: 3px;
            }

            .fn-block {
                margin-bottom: 2.5rem;
                padding-bottom: 2.5rem;
                border-bottom: 1px solid var(--border);
            }
            .fn-block:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .fn-header {
                display: flex;
                align-items: baseline;
                gap: 0.6rem;
                margin-bottom: 0.5rem;
            }

            .fn-name {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.95rem;
                font-weight: 700;
                color: var(--red);
            }

            .fn-kind {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.62rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: var(--muted);
                background: rgba(122, 122, 144, 0.12);
                border: 1px solid var(--border);
                border-radius: 4px;
                padding: 0.1em 0.45em;
            }

            .fn-desc {
                font-size: 0.875rem;
                color: var(--muted);
                line-height: 1.6;
                margin-bottom: 1rem;
            }

            .fn-desc code {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.82em;
                color: var(--type);
                background: rgba(130, 170, 255, 0.08);
                padding: 0.05rem 0.3rem;
                border-radius: 3px;
            }

            .fn-block pre {
                font-size: 0.78rem;
                padding: 1rem 1rem 1.25rem;
                background: #131318;
                border: 1px solid var(--border);
                border-radius: 8px;
            }

            .options-list {
                display: flex;
                flex-direction: column;
                border: 1px solid var(--border);
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 2.5rem;
            }

            .option-item {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: 1rem;
                padding: 0.85rem 1.25rem;
                background: var(--surface);
                border-bottom: 1px solid var(--border);
                align-items: start;
            }
            .option-item:last-child { border-bottom: none; }
            .option-item:nth-child(even) { background: #131318; }

            @media (max-width: 640px) {
                .option-item { grid-template-columns: 1fr; gap: 0.25rem; }
            }

            .option-name {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.78rem;
                color: var(--green);
                padding-top: 0.05rem;
            }

            .option-desc {
                font-size: 0.875rem;
                color: var(--muted);
                line-height: 1.55;
            }

            .option-desc code {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.8em;
                color: var(--type);
                background: rgba(130, 170, 255, 0.08);
                padding: 0.05rem 0.3rem;
                border-radius: 3px;
            }

            .spec-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1px;
                border: 1px solid var(--border);
                border-radius: 10px;
                overflow: hidden;
                background: var(--border);
                margin-bottom: 2.5rem;
            }

            .spec-card {
                background: var(--surface);
                padding: 1.1rem 1.35rem;
            }

            .spec-key {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.75rem;
                color: var(--muted);
                margin-bottom: 0.25rem;
            }

            .spec-value {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 1rem;
                font-weight: 700;
                color: var(--accent);
            }

            .kw { color: var(--keyword); }
            .ty { color: var(--type); }
            .fn { color: var(--fn); }
            .st { color: var(--string); }
            .cm { color: var(--comment); }
            .nu { color: var(--num); }
            .op { color: var(--muted); }
            .id { color: var(--muted); }

            hr { border: none; border-top: 1px solid var(--border); }

            footer {
                text-align: center;
                padding: 2.5rem 2rem;
                font-size: 0.825rem;
                color: var(--muted);
                border-top: 1px solid var(--border);
            }
`

// ── Lint-page-specific CSS ───────────────────────────────────────────────────

const LINT_EXTRA_CSS = `
            .example-section {
                max-width: 860px;
                margin: 0 auto;
                padding: 0 2rem 4rem;
            }

            .rules-section {
                max-width: 860px;
                margin: 0 auto;
                padding: 0 2rem 2.5rem;
            }

            .rules-category {
                margin-bottom: 3rem;
            }

            .rules-category-header {
                display: flex;
                align-items: baseline;
                gap: 0.75rem;
                margin-bottom: 1.25rem;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--border);
            }

            .rules-category-header h3 {
                font-size: 1.05rem;
                font-weight: 700;
                letter-spacing: -0.02em;
            }

            .rule-count {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.68rem;
                color: var(--muted);
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 999px;
                padding: 0.1rem 0.55rem;
            }

            .rule-list {
                display: flex;
                flex-direction: column;
                border: 1px solid var(--border);
                border-radius: 10px;
                overflow: hidden;
            }

            .rule-item {
                display: grid;
                grid-template-columns: 240px 1fr;
                gap: 1rem;
                padding: 0.85rem 1.25rem;
                background: var(--surface);
                border-bottom: 1px solid var(--border);
                align-items: start;
            }
            .rule-item:last-child { border-bottom: none; }
            .rule-item:nth-child(even) { background: #131318; }

            @media (max-width: 620px) {
                .rule-item { grid-template-columns: 1fr; gap: 0.25rem; }
            }

            .rule-name {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.78rem;
                color: var(--red);
                padding-top: 0.05rem;
            }

            .rule-desc {
                font-size: 0.875rem;
                color: var(--muted);
                line-height: 1.55;
            }

            .rule-desc code {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.8em;
                color: var(--type);
                background: rgba(130, 170, 255, 0.08);
                padding: 0.05rem 0.3rem;
                border-radius: 3px;
            }

            .removed-section {
                max-width: 860px;
                margin: 0 auto;
                padding: 0 2rem 4rem;
            }

            .pct-grid {
                display: flex;
                flex-direction: column;
                gap: 1.1rem;
            }

            .pct-row {
                display: grid;
                grid-template-columns: 260px 1fr 64px;
                gap: 1.25rem;
                align-items: center;
            }

            @media (max-width: 620px) {
                .pct-row {
                    grid-template-columns: 1fr 80px 48px;
                    gap: 0.75rem;
                }
                .pct-meta { grid-column: 1 / -1; }
            }

            .pct-cat {
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 0.2rem;
            }

            .pct-items {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.68rem;
                color: var(--muted);
            }

            .pct-bar-wrap {
                height: 5px;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 3px;
                overflow: hidden;
            }

            .pct-bar-fill {
                height: 100%;
                background: var(--accent);
                border-radius: 3px;
                opacity: 0.65;
            }

            .pct-value {
                font-family: "SF Mono", "Fira Code", monospace;
                font-size: 0.72rem;
                color: var(--muted);
                text-align: right;
            }

            h2 {
                font-size: 1.4rem;
                font-weight: 700;
                letter-spacing: -0.025em;
                margin-bottom: 0.5rem;
            }
`

// ── Nav builder ──────────────────────────────────────────────────────────────

function buildNav(page, route) {
    const links = [
        ['/', 'ShotScript', ''],
        ['/lint/', 'Lint', 'lint'],
        ['/fmt/', 'Fmt', 'fmt'],
        ['/typing/', 'Typing', 'typing'],
        ['/std/', 'Std', 'std'],
    ]
    const liItems = links.map(([href, label, key]) => {
        const cur = key === page ? ' aria-current="page"' : ''
        return `                <li><a href="${href}"${cur}>${label}</a></li>`
    }).join('\n')

    return `        <nav>
            <a href="/" class="nav-logo">
                <span class="brand">ShotScript</span><span class="route">${route}</span>
            </a>
            <ul class="nav-links">
${liItems}
                <li class="nav-divider" aria-hidden="true"></li>
                <li><a href="https://github.com/didley/shotscript" class="nav-ext" target="_blank" rel="noopener">GitHub ↗</a></li>
                <li><a href="https://www.npmjs.com/package/shotscript" class="nav-ext" target="_blank" rel="noopener">npm ↗</a></li>
            </ul>
        </nav>`
}

const FOOTER = `        <footer>
            <p>
                By <a href="https://github.com/didley" target="_blank" rel="noopener">didley</a> in Melbourne (Naarm), Australia.
            </p>
        </footer>`

// ── Inline markdown to HTML (for desc text in fn-desc / rule-desc) ───────────

function inlineMd(text) {
    return text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/&/g, '&amp;')
        // restore already-converted tags
        .replace(/&lt;code&gt;/g, '<code>')
        .replace(/&lt;\/code&gt;/g, '</code>')
        .replace(/&lt;strong&gt;/g, '<strong>')
        .replace(/&lt;\/strong&gt;/g, '</strong>')
}

// Actually we need a different approach — do the substitutions without double-escaping.
function inlineMdSafe(text) {
    // Escape html first, then handle markdown
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    return escaped
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

// ── Markdown block parser ────────────────────────────────────────────────────

// Split body into tokens: paragraph, heading, fence, blockquote, hr, custom-container
function tokenise(body) {
    const tokens = []
    const lines = body.split('\n')
    let i = 0

    while (i < lines.length) {
        const line = lines[i]

        // Custom container :::type[args]{attrs}
        const containerM = line.match(/^:::([\w-]+)(?:\[([^\]]*)\])?(?:\{([^}]*)\})?$/)
        if (containerM) {
            const kind = containerM[1]
            const arg = containerM[2] || ''
            const attrs = containerM[3] || ''
            const innerLines = []
            i++
            while (i < lines.length && lines[i] !== ':::') {
                innerLines.push(lines[i])
                i++
            }
            i++ // skip closing :::
            tokens.push({ type: 'container', kind, arg, attrs, inner: innerLines.join('\n') })
            continue
        }

        // HR
        if (/^---+$/.test(line.trim())) {
            tokens.push({ type: 'hr' })
            i++
            continue
        }

        // Heading
        const headM = line.match(/^(#{1,3})\s+(.+)$/)
        if (headM) {
            tokens.push({ type: 'heading', level: headM[1].length, text: headM[2] })
            i++
            continue
        }

        // Blockquote (callout)
        if (line.startsWith('> ')) {
            const bqLines = []
            while (i < lines.length && lines[i].startsWith('> ')) {
                bqLines.push(lines[i].slice(2))
                i++
            }
            tokens.push({ type: 'blockquote', text: bqLines.join(' ') })
            continue
        }

        // Fenced code block
        const fenceM = line.match(/^```(.*)$/)
        if (fenceM) {
            const info = fenceM[1].trim()
            const codeLines = []
            i++
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i])
                i++
            }
            i++ // skip closing ```
            tokens.push({ type: 'fence', info, code: codeLines.join('\n') })
            continue
        }

        // Section label: {label} text
        const labelM = line.match(/^\{label\}\s*(.+)$/)
        if (labelM) {
            tokens.push({ type: 'section-label', text: labelM[1] })
            i++
            continue
        }

        // Rule ref: Rule: `name` or Rules: `a`, `b`
        const ruleM = line.match(/^Rules?:\s*(.+)$/)
        if (ruleM) {
            tokens.push({ type: 'rule-ref', text: ruleM[1] })
            i++
            continue
        }

        // Empty line
        if (line.trim() === '') {
            i++
            continue
        }

        // Paragraph — collect until blank line
        const paraLines = []
        while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('```') && !lines[i].startsWith(':::') && !lines[i].startsWith('#') && !lines[i].startsWith('> ') && !lines[i].match(/^---+$/)) {
            paraLines.push(lines[i])
            i++
        }
        if (paraLines.length > 0) {
            tokens.push({ type: 'paragraph', text: paraLines.join(' ') })
        }
    }

    return tokens
}

// Merge consecutive fence tokens with info "ts ❌" followed by "ts ✅" into comparison pairs
function mergeComparisons(tokens) {
    const result = []
    let j = 0
    while (j < tokens.length) {
        const t = tokens[j]
        if (t.type === 'fence' && t.info === 'ts ❌' && j + 1 < tokens.length && tokens[j + 1].type === 'fence' && tokens[j + 1].info === 'ts ✅') {
            result.push({ type: 'comparison', before: t.code, after: tokens[j + 1].code })
            j += 2
        } else {
            result.push(t)
            j++
        }
    }
    return result
}

// ── Page-specific context for labels ────────────────────────────────────────

const PAGE_LABELS = {
    lint: { before: 'TypeScript', after: 'ShotScript' },
    std: { before: 'TypeScript', after: 'ShotScript' },
    typing: { before: 'without strict', after: 'ShotScriptTyping' },
    fmt: { before: 'unformatted', after: 'ShotScriptFmt' },
}

// ── Render tokens to HTML ────────────────────────────────────────────────────

function renderTokens(tokens, page) {
    const labels = PAGE_LABELS[page] || { before: 'TypeScript', after: 'ShotScript' }
    let html = ''

    for (const t of tokens) {
        switch (t.type) {
            case 'hr':
                html += '\n            <hr />\n'
                break

            case 'heading': {
                const tag = `h${t.level}`
                html += `\n            <${tag}>${inlineMdSafe(t.text)}</${tag}>\n`
                break
            }

            case 'paragraph':
                html += `\n            <p class="section-desc">${inlineMdSafe(t.text)}</p>\n`
                break

            case 'section-label':
                html += `\n            <div class="section-label">${escHtml(t.text)}</div>\n`
                break

            case 'rule-ref':
                // just a note, skip rendering (rules are in the rule-list below)
                break

            case 'blockquote': {
                const inner = inlineMdSafe(t.text)
                html += `\n            <div class="callout">${inner}</div>\n`
                break
            }

            case 'fence': {
                const highlighted = highlightTs(t.code)
                html += `\n            <pre>${highlighted}</pre>\n`
                break
            }

            case 'comparison': {
                const beforeHl = highlightTs(t.before)
                const afterHl = highlightTs(t.after)
                html += `
            <div class="comparison">
                <div class="pane-before">
                    <div class="pane-label">
                        <span class="dot dot-red"></span>${escHtml(labels.before)}
                    </div>
                    <pre>${beforeHl}</pre>
                </div>
                <div class="pane-after">
                    <div class="pane-label">
                        <span class="dot dot-green"></span>${escHtml(labels.after)}
                    </div>
                    <pre>${afterHl}</pre>
                </div>
            </div>
`
                break
            }

            case 'container':
                html += renderContainer(t, page, labels)
                break
        }
    }

    return html
}

function renderContainer(t, page, labels) {
    if (t.kind === 'fn') {
        // :::fn[name|kind]{#id}
        const parts = t.arg.split('|')
        const fnName = parts[0] || ''
        const fnKind = parts[1] || 'sync'
        const idAttr = t.attrs ? ` id="${t.attrs.replace(/^#/, '')}"` : ''
        const innerTokens = mergeComparisons(tokenise(t.inner))
        let innerHtml = ''
        for (const tok of innerTokens) {
            if (tok.type === 'paragraph') {
                innerHtml += `                <p class="fn-desc">${inlineMdSafe(tok.text)}</p>\n`
            } else if (tok.type === 'fence') {
                innerHtml += `                <pre>${highlightTs(tok.code)}</pre>\n`
            }
        }
        return `
            <div class="fn-block"${idAttr}>
                <div class="fn-header">
                    <span class="fn-name">${escHtml(fnName)}</span>
                    <span class="fn-kind">${escHtml(fnKind)}</span>
                </div>
${innerHtml}            </div>
`
    }

    if (t.kind === 'options') {
        const items = t.inner.split('\n').filter(l => l.trim().startsWith('-'))
        let itemsHtml = ''
        for (const item of items) {
            const m = item.match(/^-\s+\*\*([^*]+)\*\*\s+[—–-]\s+(.+)$/)
            if (m) {
                itemsHtml += `                <div class="option-item">
                    <div class="option-name">${escHtml(m[1])}</div>
                    <div class="option-desc">${inlineMdSafe(m[2])}</div>
                </div>\n`
            }
        }
        return `
            <div class="options-list">
${itemsHtml}            </div>
`
    }

    if (t.kind === 'spec') {
        const items = t.inner.split('\n').filter(l => l.trim().startsWith('-'))
        let cardsHtml = ''
        for (const item of items) {
            const m = item.match(/^-\s+([^:]+):\s+(.+)$/)
            if (m) {
                cardsHtml += `                <div class="spec-card">
                    <div class="spec-key">${escHtml(m[1].trim())}</div>
                    <div class="spec-value">${escHtml(m[2].trim())}</div>
                </div>\n`
            }
        }
        return `
            <div class="spec-grid">
${cardsHtml}            </div>
`
    }

    if (t.kind === 'install-step') {
        const innerTokens = tokenise(t.inner)
        let pre = ''
        for (const tok of innerTokens) {
            if (tok.type === 'fence') {
                pre = `<pre>${highlightTs(tok.code)}</pre>`
            }
        }
        return `
            <div class="install-step">
                <div class="install-step-label">${escHtml(t.arg)}</div>
                ${pre}
            </div>
`
    }

    if (t.kind === 'install-cmd') {
        const cmd = t.inner.trim()
        return `
            <div class="install-cmd">
                <span class="prompt">$</span>
                <span class="cmd">${escHtml(cmd)}</span>
            </div>
`
    }

    return ''
}

// ── Lint page builder (special: has rules-section, removed-section) ──────────

function buildLintContent(body) {
    // The lint page has structured sections we need to handle:
    // Install block, Example section, What gets removed section, All rules section
    // We parse the markdown and emit the appropriate HTML.
    const tokens = mergeComparisons(tokenise(body))
    let html = ''
    let inInstall = false
    let inExample = false
    let inRemoved = false
    let inRulesSection = false
    let currentCategory = null
    let currentRuleItems = []

    function flushCategory() {
        if (currentCategory) {
            const { name, count, items } = currentCategory
            html += `
            <div class="rules-category" id="${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}">
                <div class="rules-category-header">
                    <h3>${escHtml(name)}</h3>
                    <span class="rule-count">${count} rules</span>
                </div>
                <div class="rule-list">
${items.join('')}                </div>
            </div>
`
            currentCategory = null
        }
    }

    // We process tokens sequentially and handle the structural sections
    // by detecting headings and containers
    for (let idx = 0; idx < tokens.length; idx++) {
        const t = tokens[idx]

        if (t.type === 'container' && t.kind === 'install-step') {
            if (!inInstall) {
                html += '\n        <div class="install-block">\n'
                html += '            <div class="install-label">Install</div>\n'
                inInstall = true
            }
            const innerTokens = tokenise(t.inner)
            let pre = ''
            for (const tok of innerTokens) {
                if (tok.type === 'fence') pre = `<pre>${highlightTs(tok.code)}</pre>`
            }
            html += `            <div class="install-step">
                <div class="install-step-label">${escHtml(t.arg)}</div>
                ${pre}
            </div>\n`
            continue
        }

        if (t.type === 'container' && t.kind === 'install-cmd') {
            if (inInstall) {
                html += `\n            <div style="margin-top: 1rem">
                <div class="install-label">Run</div>
                <div class="install-cmd">
                    <span class="prompt">$</span>
                    <span class="cmd">${escHtml(t.inner.trim())}</span>
                </div>\n`
                // Look ahead for install-note paragraph
                if (idx + 1 < tokens.length && tokens[idx + 1].type === 'paragraph') {
                    idx++
                    html += `                <p class="install-note" style="margin-top: 0.4rem">${inlineMdSafe(tokens[idx].text)}</p>\n`
                }
                html += `            </div>\n`
                html += `        </div>\n`
                inInstall = false
            }
            continue
        }

        if (t.type === 'hr') {
            if (inInstall) { html += '        </div>\n'; inInstall = false }
            if (inExample) { html += '        </div>\n'; inExample = false }
            if (inRemoved) { html += '        </div>\n'; inRemoved = false }
            html += '\n        <hr />\n'
            continue
        }

        // Detect section headers
        if (t.type === 'section-label') {
            const text = t.text.toLowerCase()
            if (text === 'example') {
                html += '\n        <div class="example-section" style="padding-top: 3rem">\n'
                html += '            <div class="section-label">Example</div>\n'
                inExample = true
                continue
            }
            if (text === 'what gets removed') {
                if (inExample) { html += '        </div>\n'; inExample = false }
                html += '\n        <div class="removed-section" style="padding-top: 3rem">\n'
                html += '            <div class="section-label">What gets removed</div>\n'
                inRemoved = true
                continue
            }
            if (text === 'all rules') {
                if (inRemoved) { html += '        </div>\n'; inRemoved = false }
                html += '\n        <div class="rules-section" style="padding-top: 3rem">\n'
                html += '            <div class="section-label" style="margin-bottom: 1.5rem">All rules</div>\n'
                inRulesSection = true
                continue
            }
            html += `            <div class="section-label">${escHtml(t.text)}</div>\n`
            continue
        }

        if (inRemoved && t.type === 'container' && t.kind === 'pct-grid') {
            // Parse pct items from inner
            const rows = t.inner.split('\n').filter(l => l.trim().startsWith('-'))
            html += '            <div class="pct-grid">\n'
            for (const row of rows) {
                const m = row.match(/^-\s+\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|\s*([^|]+)$/)
                if (m) {
                    const [, cat, items, val] = m
                    const pct = val.trim() === 'all of it' ? '100%' : val.trim().replace(/~/, '').replace(/%/, '') + '%'
                    html += `                <div class="pct-row">
                    <div class="pct-meta">
                        <div class="pct-cat">${escHtml(cat.trim())}</div>
                        <div class="pct-items">${escHtml(items.trim())}</div>
                    </div>
                    <div class="pct-bar-wrap">
                        <div class="pct-bar-fill" style="width: ${pct}"></div>
                    </div>
                    <div class="pct-value">${escHtml(val.trim())}</div>
                </div>\n`
                }
            }
            html += '            </div>\n'
            continue
        }

        // Rules category heading (h3 inside rules section)
        if (inRulesSection && t.type === 'heading' && t.level === 3) {
            flushCategory()
            // Format: "Name — N rules" or just "Name"
            const m = t.text.match(/^(.+?)\s+—\s+(\d+)\s+rules?$/)
            if (m) {
                currentCategory = { name: m[1], count: m[2], items: [] }
            } else {
                currentCategory = { name: t.text, count: '?', items: [] }
            }
            continue
        }

        // Rule item (heading level 4 inside a category)
        if (inRulesSection && currentCategory && t.type === 'heading' && t.level === 4) {
            // h4: rule name heading, followed by paragraph description
            // but we need to collect rule-name + desc
            // Actually in our md format rules are `rule-name` paragraphs
            continue
        }

        // Rule items: structured as "- `rule-name` — description" list items
        // We detect these as paragraphs starting with a backtick or as container rule-item
        if (inRulesSection && currentCategory && t.type === 'container' && t.kind === 'rule') {
            const m = t.inner.match(/^`([^`]+)`\s*[—–]\s*(.+)$/s)
            if (m) {
                currentCategory.items.push(`                    <div class="rule-item">
                        <div class="rule-name">${escHtml(m[1])}</div>
                        <div class="rule-desc">${inlineMdSafe(m[2].trim())}</div>
                    </div>\n`)
            }
            continue
        }

        // Default rendering
        if (inExample || inRemoved || (!inRulesSection)) {
            switch (t.type) {
                case 'heading':
                    html += `            <h${t.level}>${inlineMdSafe(t.text)}</h${t.level}>\n`
                    break
                case 'paragraph':
                    html += `            <p class="section-desc">${inlineMdSafe(t.text)}</p>\n`
                    break
                case 'comparison': {
                    const beforeHl = highlightTs(t.before)
                    const afterHl = highlightTs(t.after)
                    html += `
            <div class="comparison">
                <div class="pane-before">
                    <div class="pane-label">
                        <span class="dot dot-red"></span>TypeScript
                    </div>
                    <pre>${beforeHl}</pre>
                </div>
                <div class="pane-after">
                    <div class="pane-label">
                        <span class="dot dot-green"></span>ShotScript
                    </div>
                    <pre>${afterHl}</pre>
                </div>
            </div>
`
                    break
                }
                case 'blockquote': {
                    html += `            <div class="callout">${inlineMdSafe(t.text)}</div>\n`
                    break
                }
                default:
                    break
            }
        }
    }

    // Close any open sections
    flushCategory()
    if (inRulesSection) html += '        </div>\n'
    if (inInstall) html += '        </div>\n'
    if (inExample) html += '        </div>\n'
    if (inRemoved) html += '        </div>\n'

    return html
}

// ── Page wrapper ─────────────────────────────────────────────────────────────

function buildPage(meta, bodyHtml, page, route, title, extraCss = '') {
    const headTitle = meta.title
        ? `${meta.badge || 'ShotScript'} — ${meta.title.replace(/<[^>]+>/g, '')}`
        : title

    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escHtml(headTitle)}</title>
        <style>${SHARED_CSS}${extraCss}        </style>
    </head>
    <body>
${buildNav(page, route)}

        <div class="page-header">
            <div class="page-badge">${escHtml(meta.badge || '')}</div>
            <h1>${buildH1(meta)}</h1>
            <p class="sub">${inlineMdSafe(meta.sub || '')}</p>
        </div>

${bodyHtml}
${FOOTER}
    </body>
</html>
`
}

function buildH1(meta) {
    if (!meta.title) return ''
    if (!meta.title_em) return escHtml(meta.title)
    const plain = escHtml(meta.title)
    const em = escHtml(meta.title_em)
    return plain.replace(em, `<em>${em}</em>`)
}

// ── Per-page renderers ────────────────────────────────────────────────────────

function renderLintPage(meta, body) {
    const bodyHtml = buildLintContent(body)
    return buildPage(meta, bodyHtml, 'lint', 'Lint',
        'ShotScriptLint — 95+ rules for canonical TypeScript', LINT_EXTRA_CSS)
}

function renderGenericPage(meta, body, page, route, title) {
    const tokens = mergeComparisons(tokenise(body))
    const bodyHtml = `        <div class="content">\n${renderTokens(tokens, page)}        </div>\n`
    return buildPage(meta, bodyHtml, page, route, title)
}

// ── Main ──────────────────────────────────────────────────────────────────────

const pages = [
    {
        src: 'docs/lint.md',
        dst: 'site/lint/index.html',
        page: 'lint',
        route: 'Lint',
        title: 'ShotScriptLint — 95+ rules for canonical TypeScript',
        renderer: 'lint',
    },
    {
        src: 'docs/std.md',
        dst: 'site/std/index.html',
        page: 'std',
        route: 'Std',
        title: 'ShotScriptStd — Standard library',
        renderer: 'generic',
    },
    {
        src: 'docs/typing.md',
        dst: 'site/typing/index.html',
        page: 'typing',
        route: 'Typing',
        title: 'ShotScriptTyping — Full strict mode for TypeScript',
        renderer: 'generic',
    },
    {
        src: 'docs/fmt.md',
        dst: 'site/fmt/index.html',
        page: 'fmt',
        route: 'Fmt',
        title: 'ShotScriptFmt — Opinionated TypeScript formatter',
        renderer: 'generic',
    },
]

for (const p of pages) {
    const srcPath = join(root, p.src)
    const dstPath = join(root, p.dst)

    let src
    try {
        src = readFileSync(srcPath, 'utf8')
    } catch {
        console.error(`ERROR: Could not read ${p.src}`)
        process.exit(1)
    }

    const { meta, body } = parseFrontMatter(src)

    let html
    if (p.renderer === 'lint') {
        html = renderLintPage(meta, body)
    } else {
        html = renderGenericPage(meta, body, p.page, p.route, p.title)
    }

    mkdirSync(dirname(dstPath), { recursive: true })
    writeFileSync(dstPath, html, 'utf8')
    console.log(`  wrote ${p.dst}  (${html.split('\n').length} lines)`)
}

console.log('Done.')
