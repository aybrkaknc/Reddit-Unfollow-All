/**
 * Hot reload watcher (development only). Requires Node.js 20+ and no packages.
 * Run from the project root: node dev/watch.js
 *
 * Watches manifest.json, src/ and icons/. The helper extension in dev/hot-reload/
 * polls this server and reloads the extension when the version changes.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = 35729;
const ROOT = path.resolve(__dirname, '..');
const DEBOUNCE_MS = 200;

let version = String(Date.now());
let timer = null;

function isWatched(filename) {
    const file = filename.split(path.sep).join('/');
    return file === 'manifest.json' || file.startsWith('src/') || file.startsWith('icons/');
}

fs.watch(ROOT, { recursive: true }, (eventType, filename) => {
    if (!filename || !isWatched(filename)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
        version = String(Date.now());
        console.log(`[${new Date().toLocaleTimeString()}] Changed: ${filename}`);
    }, DEBOUNCE_MS);
});

http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ version }));
}).listen(PORT, '127.0.0.1', () => {
    console.log(`Watching ${ROOT}`);
    console.log(`Hot reload server: http://127.0.0.1:${PORT} (Ctrl+C to stop)`);
});
