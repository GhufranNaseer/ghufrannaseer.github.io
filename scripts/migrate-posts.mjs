import fs from 'node:fs';
import path from 'node:path';
import {
  AUTHOR_NAME,
  IMAGES_DIR,
  ensureDir,
  escapeHtml,
  estimateReadingTime,
  readPosts,
  writePosts,
} from './lib/utils.mjs';

const API_URL = 'https://my-blog-backend-phi.vercel.app/api/posts?author=ghufran';

function formatPlainContentToHtml(raw = '') {
  const normalized = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(`<ul>\n${listItems.map((item) => `  <li>${item}</li>`).join('\n')}\n</ul>`);
      listItems = [];
    }
  };

  const formatInline = (text) => {
    const escaped = escapeHtml(text.trim());
    // Bold lead-in label like "Independent Scaling: ..."
    return escaped.replace(/^([A-Za-z0-9 &\/\-()'"`]{2,48}):\s+(.+)$/, '<strong>$1:</strong> $2');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const isBulleted =
      /^[\u2022\-\*]\s+/.test(trimmed) ||
      /^\s*\t/.test(rawLine) ||
      /^\d+\.\t/.test(trimmed);

    if (isBulleted) {
      const cleaned = trimmed.replace(/^[\u2022\-\*]\s+/, '').replace(/^\d+\.\t/, '').trim();
      listItems.push(formatInline(cleaned));
      continue;
    }

    flushList();

    // Detect short section headings (e.g., "1. You are the Client", "Why Choose This Path?", "Conclusion")
    const isShortHeading =
      trimmed.length <= 80 &&
      !/[.;,]$/.test(trimmed) &&
      (/^\d+\.\s+[A-Z]/.test(trimmed) ||
        /^(What|Why|How|The|Key|Common|Conclusion|Example|System Design|Tip)/i.test(trimmed) ||
        trimmed.endsWith('?'));

    if (isShortHeading) {
      blocks.push(`<h2>${escapeHtml(trimmed)}</h2>`);
    } else {
      blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
    }
  }

  flushList();
  return blocks.join('\n');
}

async function downloadCoverImage(url, slug) {
  if (!url) return null;
  ensureDir(IMAGES_DIR);

  const extMatch = url.split('?')[0].match(/\.(png|jpe?g|webp|gif)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
  const filename = `${slug}.${ext}`;
  const destPath = path.join(IMAGES_DIR, filename);

  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
    return `blog/images/${filename}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    return `blog/images/${filename}`;
  } catch (err) {
    console.warn(`Warning: could not download image for ${slug} (${err.message}), keeping remote URL`);
    return url;
  }
}

async function main() {
  console.log(`Fetching existing posts from ${API_URL}...`);
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data.success || !Array.isArray(data.posts)) {
    throw new Error('Unexpected API response shape');
  }

  const existingBySlug = new Map(readPosts().map((p) => [p.slug, p]));
  const merged = [];

  for (const raw of data.posts) {
    const slug = raw.slug;
    const localImage = await downloadCoverImage(raw.coverImage || raw.image, slug);
    const contentHtml = formatPlainContentToHtml(raw.content || '');
    const tags = Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags.flatMap((t) => String(t).split(',').map((s) => s.trim()).filter(Boolean))
      : [raw.category || 'Engineering'];

    const normalized = {
      id: raw.id || raw._id || slug,
      slug,
      title: raw.title,
      excerpt: (raw.excerpt || '').replace(/\r?\n/g, ' ').trim(),
      contentHtml,
      category: raw.category || 'Software Engineering',
      tags: [...new Set(tags)],
      coverImage: localImage || raw.coverImage,
      readingTime: estimateReadingTime(contentHtml),
      publishedAt: raw.publishedAt || raw.createdAt || raw.date,
      createdAt: raw.createdAt || raw.publishedAt || raw.date,
      author: raw.author?.name || AUTHOR_NAME,
      source: 'migrated',
    };

    if (!existingBySlug.has(slug)) {
      merged.push(normalized);
    }
  }

  const combined = [...readPosts(), ...merged];
  const saved = writePosts(combined);
  console.log(`Migrated ${merged.length} posts. Total posts in data/posts.json: ${saved.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
