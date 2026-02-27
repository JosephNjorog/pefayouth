// dev-server.ts — Local development server wrapping api/index.ts
// Enables local API testing without the Vercel CLI
//
// Usage (two terminals):
//   Terminal 1: npm run dev:api
//   Terminal 2: npm run dev:web

import http from 'http';
import https from 'https';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';

// ── Load .env BEFORE importing the API handler ────────────────────────────────
// db/client.ts reads process.env.DATABASE_URL at module-load time, so env must
// be populated first. We use a dynamic require() below to control load order.
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
  console.log('[dev-server] .env loaded');
} else {
  console.warn('[dev-server] WARNING: .env not found — DATABASE_URL must already be in env');
}

// ── Patch global fetch for Neon API ──────────────────────────────────────────
// Node v24's built-in fetch (undici) tries IPv6 first and gets ETIMEDOUT
// when IPv6 is unavailable locally. Route *.neon.tech via https.request
// (which honours family:4) to force IPv4.
const _origFetch = globalThis.fetch as typeof fetch;
(globalThis as any).fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const urlStr =
    typeof input === 'string'
      ? input
      : input instanceof URL
      ? input.href
      : (input as Request).url;

  if (urlStr.includes('neon.tech')) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(urlStr);
      const bodyStr =
        typeof init?.body === 'string' ? init.body : init?.body ? String(init.body) : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(bodyStr)),
        ...((init?.headers as Record<string, string>) || {}),
      };

      const req = https.request(
        {
          hostname: parsed.hostname,
          port: 443,
          path: parsed.pathname + parsed.search,
          method: (init?.method || 'GET').toUpperCase(),
          headers,
          family: 4, // force IPv4 — avoids ETIMEDOUT on IPv6-only resolution
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            resolve(new Response(buf, { status: res.statusCode ?? 200, headers: res.headers as HeadersInit }));
          });
        },
      );

      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }

  return _origFetch(input, init);
};

// ── Import API handler (dynamic require — env must be set before this) ────────
/* eslint-disable @typescript-eslint/no-require-imports */
const handler: (req: any, res: any) => Promise<void> = require('./api/index').default;

const PORT = 3000;
const VITE_ORIGIN = 'http://localhost:8080';

// ── Cookie parser ─────────────────────────────────────────────────────────────
function parseCookies(cookieHeader: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k) {
      try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
    }
  }
  return out;
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (nodeReq, nodeRes) => {
  // CORS — allow Vite dev origin
  nodeRes.setHeader('Access-Control-Allow-Origin', VITE_ORIGIN);
  nodeRes.setHeader('Access-Control-Allow-Credentials', 'true');
  nodeRes.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  nodeRes.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie');

  if (nodeReq.method === 'OPTIONS') {
    nodeRes.writeHead(200);
    nodeRes.end();
    return;
  }

  // Parse query string
  const parsedUrl = new URL(nodeReq.url || '/', `http://localhost:${PORT}`);
  const query: Record<string, string | string[]> = {};
  parsedUrl.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing !== undefined) {
      query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      query[key] = value;
    }
  });

  // Collect request body
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    nodeReq.on('data', (c: Buffer) => chunks.push(c));
    nodeReq.on('end', resolve);
    nodeReq.on('error', reject);
  });
  const rawBody = Buffer.concat(chunks).toString();
  let body: unknown = undefined;
  if (rawBody) {
    try { body = JSON.parse(rawBody); } catch { body = rawBody; }
  }

  // Mock VercelRequest
  const req: any = {
    method: nodeReq.method,
    url: nodeReq.url,
    headers: nodeReq.headers,
    query,
    body,
    cookies: parseCookies(nodeReq.headers.cookie || ''),
  };

  // Mock VercelResponse (chainable like Vercel/Express)
  let statusCode = 200;
  const res: any = {
    statusCode,
    status(code: number) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string | string[]) {
      nodeRes.setHeader(name, value);
      return this;
    },
    getHeader(name: string) {
      return nodeRes.getHeader(name);
    },
    removeHeader(name: string) {
      nodeRes.removeHeader(name);
      return this;
    },
    json(data: unknown) {
      if (!nodeRes.headersSent) {
        nodeRes.setHeader('Content-Type', 'application/json');
        nodeRes.writeHead(statusCode);
      }
      nodeRes.end(JSON.stringify(data));
    },
    send(data: unknown) {
      if (!nodeRes.headersSent) nodeRes.writeHead(statusCode);
      nodeRes.end(typeof data === 'string' ? data : JSON.stringify(data));
    },
    end(data?: unknown) {
      if (!nodeRes.headersSent) nodeRes.writeHead(statusCode);
      nodeRes.end(data as any);
    },
  };

  console.log(`[dev-server] ${req.method} ${req.url}`);

  try {
    await handler(req, res);
  } catch (e) {
    console.error('[dev-server] Handler error:', e);
    if (!nodeRes.headersSent) {
      nodeRes.writeHead(500, { 'Content-Type': 'application/json' });
      nodeRes.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════╗`);
  console.log(`║  PEFA Youth — Local Dev API Server         ║`);
  console.log(`╠═══════════════════════════════════════════╣`);
  console.log(`║  API   → http://localhost:${PORT}             ║`);
  console.log(`║  Vite  → ${VITE_ORIGIN}           ║`);
  console.log(`║  Proxy: /api/* → localhost:${PORT}            ║`);
  console.log(`╚═══════════════════════════════════════════╝\n`);
});
