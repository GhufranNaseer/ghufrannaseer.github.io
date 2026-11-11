import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
export const BLOG_DIR = path.join(ROOT_DIR, 'blog');
export const IMAGES_DIR = path.join(BLOG_DIR, 'images');
export const SITE_URL = 'https://ghufrannaseer.github.io';
export const AUTHOR_NAME = 'Muhammad Ghufran Naseer';
export const AUTHOR_SHORT = 'Muhammad Ghufran';

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(str = '') {
  return escapeHtml(str);
}

export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estimateReadingTime(htmlOrText = '') {
  const words = stripHtml(htmlOrText).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function formatDisplayDate(isoDate) {
  const date = new Date(isoDate || Date.now());
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Karachi',
  });
}

export function formatShortDate(isoDate) {
  const date = new Date(isoDate || Date.now());
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Karachi',
  });
}

export function readPosts() {
  if (!fs.existsSync(POSTS_FILE)) return [];
  const raw = fs.readFileSync(POSTS_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.posts) ? parsed.posts : [];
}

export function writePosts(posts) {
  ensureDir(DATA_DIR);
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );
  const payload = {
    updatedAt: new Date().toISOString(),
    count: sorted.length,
    posts: sorted,
  };
  fs.writeFileSync(POSTS_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return sorted;
}

export function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}
