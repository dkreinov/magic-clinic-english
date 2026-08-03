import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  // EVERY word clip in this app is .aac (2266 of them). Without this entry the
  // fallback is application/octet-stream, and browsers REFUSE to play audio
  // served as that -- new Audio() fails with MEDIA_ERR_SRC_NOT_SUPPORTED. So the
  // dictionary and the quiz were SILENT on the dev server while working perfectly
  // in production, which serves audio/x-aac. Found 2026-08-03 when the owner
  // pressed a speaker on a local gate and heard nothing; '.mp3' had been added for
  // the music feature and '.aac' was simply never noticed as missing.
  '.aac': 'audio/aac',
};

async function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
  const contents = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(contents);
}

async function serveSpaFallback(res) {
  await serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
}

async function handleApi(req, res, name) {
  if (!/^[a-z-]+$/.test(name)) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'not found' }));
    return;
  }
  let mod;
  try {
    mod = await import(new URL('../api/' + name + '.js', import.meta.url));
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'not found' }));
    return;
  }
  try {
    await mod.default(req, res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'internal error' }));
  }
}

async function handleStatic(req, res, pathname) {
  const requestPath = pathname === '/' ? '/index.html' : pathname;
  const candidate = path.resolve(PUBLIC_DIR, '.' + requestPath);

  if (candidate !== PUBLIC_DIR && !candidate.startsWith(PUBLIC_DIR + path.sep)) {
    await serveSpaFallback(res);
    return;
  }

  try {
    await serveFile(res, candidate);
  } catch (err) {
    await serveSpaFallback(res);
  }
}

async function requestListener(req, res) {
  const pathname = (req.url ?? '/').split('?')[0];

  if (pathname.startsWith('/api/')) {
    const name = pathname.slice('/api/'.length);
    await handleApi(req, res, name);
    return;
  }

  await handleStatic(req, res, pathname);
}

export function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      requestListener(req, res).catch((err) => {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'internal error' }));
      });
    });
    server.on('error', reject);
    server.listen(port, () => {
      resolve({ server, port: server.address().port });
    });
  });
}

if (pathToFileURL(process.argv[1]).href === import.meta.url) {
  const port = Number(process.env.PORT ?? 3000);
  startServer(port).then(({ port: actualPort }) => {
    console.log(`http://localhost:${actualPort}`);
  });
}
