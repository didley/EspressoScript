/**
 * serve-site.mjs — serves the site/ directory as a local static server
 * Run: node scripts/serve-site.mjs
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site')
const PORT = 4000

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.mjs':  'text/javascript',
    '.json': 'application/json',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
    '.woff': 'font/woff',
}

const server = createServer(async (req, res) => {
    let pathname = req.url.split('?')[0]
    // Netlify-style pretty URLs: /lint/ → /lint/index.html
    if (pathname.endsWith('/')) pathname += 'index.html'

    const file = join(ROOT, pathname)
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return }

    try {
        const body = await readFile(file)
        res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
        res.end(body)
    } catch {
        // Try appending /index.html for extensionless paths
        try {
            const body = await readFile(file + '/index.html')
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(body)
        } catch {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('404 Not Found')
        }
    }
})

server.listen(PORT, '127.0.0.1', () => {
    const url = `http://localhost:${PORT}`
    console.log(`\nShotScript site → ${url}\n`)

    // Open in default browser (Linux / macOS / WSL)
    const cmd = process.platform === 'darwin' ? `open ${url}`
              : process.platform === 'win32'  ? `start ${url}`
              : `xdg-open ${url}`
    exec(cmd)
})
