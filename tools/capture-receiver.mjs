// Local-only sink for browser-generated captures. Never included in the app.
import http from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const directory = process.argv[2];
if (!directory || !path.isAbsolute(directory)) throw new Error('Pass an absolute output directory.');
await mkdir(directory, { recursive: true });
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3012');
  const origin = req.headers.origin;
  if (origin && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const match = /^\/capture\/([a-z0-9-]+)\/(\d{1,5})$/.exec(req.url || '');
  if (req.method !== 'POST' || !match) { res.writeHead(404); res.end(); return; }
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 5_000_000) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
  try {
    const data = Buffer.from(Buffer.concat(chunks).toString(), 'base64');
    if (data[0] !== 0xff || data[1] !== 0xd8) throw new Error('Expected JPEG');
    const folder = path.join(directory, match[1]); await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, `${match[2].padStart(5, '0')}.jpg`), data);
    res.writeHead(200); res.end('saved');
  } catch { res.writeHead(400); res.end('invalid capture'); }
});
server.listen(3019, '127.0.0.1', () => console.log(`Capture sink: http://127.0.0.1:3019 -> ${directory}`));
