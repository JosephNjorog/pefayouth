/**
 * Uploads the 9 church asset images to Cloudinary and seeds the gallery_items table.
 * Run once with:  npm run db:seed-gallery
 *
 * IPv4 patch is included for local Node v24 environments where Neon/Cloudinary
 * APIs are unreachable over IPv6.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env ──────────────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim();
}

// ── IPv4 patch for Neon & Cloudinary ─────────────────────────────────────────
const _origFetch = globalThis.fetch.bind(globalThis);
(globalThis as any).fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input
    : input instanceof URL ? input.href
    : (input as Request).url;
  if (urlStr.includes('neon.tech') || urlStr.includes('cloudinary.com')) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(urlStr);
      const bodyStr = typeof init?.body === 'string' ? init.body
        : init?.body instanceof Buffer ? init.body.toString()
        : '';
      const req = https.request({
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + parsed.search,
        method: (init?.method || 'GET').toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(Buffer.byteLength(bodyStr)),
          ...((init?.headers as Record<string, string>) || {}),
        },
        family: 4,
      }, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString();
          resolve(new Response(body, { status: res.statusCode ?? 200, headers: res.headers as HeadersInit }));
        });
      });
      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }
  return _origFetch(input, init);
};

// ── Cloudinary config ─────────────────────────────────────────────────────────
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY    = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const FOLDER     = 'pefayouth/gallery';

// ── Assets to upload ──────────────────────────────────────────────────────────
const assets = [
  { file: 'church-hero.jpg',      title: 'Worship Service',    event: 'Sunday Service' },
  { file: 'youths-group.jpg',     title: 'Youth Group',        event: 'Youth Fellowship' },
  { file: 'youth-community.jpg',  title: 'Community',          event: 'Youth Outreach' },
  { file: 'events-retreats.jpg',  title: 'Events & Retreats',  event: 'Youth Retreat 2025' },
  { file: 'grow-faith.jpg',       title: 'Growing in Faith',   event: 'Bible Study' },
  { file: 'sermons-media.jpg',    title: 'Sermons & Media',    event: 'Sunday Service' },
  { file: 'fishers-of-men.jpg',   title: 'Fishers of Men',     event: 'Fishers Cell Group' },
  { file: 'one-more-soul.jpg',    title: 'One More Soul',      event: 'One More Soul Cell' },
  { file: 'by-grace.jpg',         title: 'By Grace',           event: 'By Grace Cell Group' },
];

const assetsDir = path.resolve(__dirname, '../apps/web/src/assets');

// ── Upload a single file to Cloudinary ────────────────────────────────────────
async function uploadFile(filePath: string): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${FOLDER}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(paramsToSign + API_SECRET).digest('hex');

  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  const ext = path.extname(filePath).slice(1).replace('jpg', 'jpeg');
  const dataUrl = `data:image/${ext};base64,${base64}`;

  const body = JSON.stringify({ file: dataUrl, api_key: API_KEY, timestamp, signature, folder: FOLDER });

  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const req = https.request({
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length },
      family: 4,
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const json = JSON.parse(Buffer.concat(chunks).toString());
        if (json.secure_url) resolve(json.secure_url);
        else reject(new Error(json.error?.message || 'Upload failed'));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Seed the DB ───────────────────────────────────────────────────────────────
// Import DB after env is loaded
const { db, galleryItems } = await import('./client.js');

async function run() {
  console.log('🚀 Seeding gallery with church photos...\n');

  for (const asset of assets) {
    const filePath = path.join(assetsDir, asset.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ Skipping ${asset.file} — file not found`);
      continue;
    }

    process.stdout.write(`  Uploading ${asset.file}... `);
    try {
      const url = await uploadFile(filePath);
      await db.insert(galleryItems).values({
        title: asset.title,
        event: asset.event,
        date: new Date().toISOString().split('T')[0],
        type: 'image',
        url,
      });
      console.log(`✅  ${url.split('/').pop()}`);
    } catch (e: any) {
      console.log(`❌  ${e.message}`);
    }

    // Small delay to avoid Cloudinary rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n✅ Gallery seeding complete!');
  process.exit(0);
}

run().catch(e => { console.error('Seed failed:', e); process.exit(1); });
