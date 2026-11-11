import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import https from 'node:https';
import {
  AUTHOR_NAME,
  ROOT_DIR,
  estimateReadingTime,
  readPosts,
  slugify,
  writePosts,
} from './lib/utils.mjs';

dns.setDefaultResultOrder('ipv4first');
import { renderCoverImage } from './render-cover.mjs';
import { buildAllBlogPages } from './build-blog.mjs';

const DOMAINS = [
  {
    category: 'DevOps & Kubernetes',
    focus: 'Kubernetes workloads, Docker optimization, CI/CD pipelines, GitOps, observability, zero-downtime deployments, Linux/Nginx production tuning',
  },
  {
    category: 'Cybersecurity & Production Engineering',
    focus: 'Runtime vulnerability remediation, API authentication & JWT/OAuth2 hardening, SSRF/SQLi prevention, secrets management, supply-chain security, incident reliability',
  },
  {
    category: 'Backend & System Architecture',
    focus: 'Idempotent REST APIs, PostgreSQL indexing & query optimization, Redis caching patterns, message queues, rate limiting, webhooks, Laravel/Node.js service boundaries',
  },
  {
    category: 'Full Stack & Web Performance',
    focus: 'Core Web Vitals & LCP optimization, React state/rendering performance, TypeScript API contracts, HTTP caching & CDN strategies, accessible UI architecture',
  },
  {
    category: 'AI Integration & Engineering Automation',
    focus: 'Production RAG architectures, structured LLM outputs & validation, multi-model fallback & rate-limiting, evaluation pipelines, developer workflow automation',
  },
];

const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
];

function extractFirstJsonObject(raw = '') {
  const cleaned = String(raw)
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const start = cleaned.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON object start brace found');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return cleaned.slice(start, i + 1);
        }
      }
    }
  }

  return cleaned.slice(start);
}

function escapeRawControlCharsInStrings(jsonStr) {
  let out = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    if (inString) {
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { out += '\\r'; continue; }
      if (ch === '\t') { out += '\\t'; continue; }
    }
    out += ch;
  }

  return out;
}

function parseGeminiJsonResponse(rawText) {
  const extracted = extractFirstJsonObject(rawText);
  try {
    return JSON.parse(extracted);
  } catch {
    const repaired = escapeRawControlCharsInStrings(extracted);
    return JSON.parse(repaired);
  }
}

function httpsPostJson(urlString, bodyObj, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const payload = JSON.stringify(bodyObj);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        family: 4,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 0, data: JSON.parse(raw) });
          } catch (e) {
            reject(new Error(`Invalid JSON (HTTP ${res.statusCode}): ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error(`Request timed out after ${timeoutMs}ms`)));
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function callGeminiJson(apiKey, prompt) {
  let lastError = null;

  for (const model of MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      console.log(`Generating article with ${model}...`);
      const { status, data } = await httpsPostJson(endpoint, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }, 120000);

      if (status < 200 || status >= 300) {
        throw new Error(`HTTP ${status} (${model}): ${data?.error?.message || JSON.stringify(data)}`);
      }

      const rawText = data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('')
        .trim();

      if (!rawText) {
        throw new Error(`Empty response from ${model}`);
      }

      return parseGeminiJsonResponse(rawText);
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} failed: ${err.message}`);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

function buildPrompt({ domain, preferredStyle, existingTitles, todayIso }) {
  const existingList = existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');

  const coverSchemaGuide =
    preferredStyle === 'architecture'
      ? `{
    "style": "architecture",
    "badgeLeft": "SHORT UPPERCASE LABEL (e.g. BACKEND ARCHITECTURE • PATTERNS)",
    "badgeRight": "SHORT RIGHT PILL (e.g. 3 PATTERNS • PRODUCTION)",
    "titleParts": [
      { "text": "Concept A", "accent": "blue" },
      { "text": "vs", "accent": "muted" },
      { "text": "Concept B", "accent": "emerald" },
      { "text": "vs", "accent": "muted" },
      { "text": "Concept C", "accent": "orange" }
    ],
    "columns": [
      {
        "title": "Short Card Title",
        "tag": "3-4 WORD UPPERCASE TAG",
        "accent": "blue",
        "nodes": [
          { "label": "layer-1", "spec": "short monospace detail" },
          { "label": "layer-2", "spec": "short monospace detail" },
          { "label": "layer-3", "spec": "short monospace detail" }
        ],
        "summary": "One crisp 6-9 word takeaway line",
        "useFor": "SHORT USE CASE"
      }
    ]
  }
  (Provide exactly 3 columns with accents: "blue", "emerald", "orange". Keep every string super concise so it fits cleanly inside 1200x630 without overflow!)`
      : `{
    "style": "infographic",
    "eyebrow": "SHORT UPPERCASE TOPIC (e.g. PRODUCTION SECURITY)",
    "headline": "Short Bold 4-7 Word Headline",
    "highlightWord": "1-2 key words from headline",
    "subtitle": "One crisp sentence summarizing the engineering lesson.",
    "highlights": [
      { "icon": "shield", "title": "Short Title 1", "detail": "2-line concise detail max 60 chars" },
      { "icon": "code", "title": "Short Title 2", "detail": "2-line concise detail max 60 chars" },
      { "icon": "alert", "title": "Short Title 3", "detail": "2-line concise detail max 60 chars" }
    ],
    "takeaway": "A sharp reminder that reliability isn't just about ",
    "takeawayHighlight": "writing code — it's verifying production state.",
    "pillars": ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4"],
    "panelTitle": "verify-runtime.sh",
    "panelStatus": "VERIFIED",
    "panelTopic": "Short Panel Header",
    "panelSubtopic": "Short 4-6 word subtext",
    "panelLines": [
      { "key": "check-1", "value": "PASS", "status": "ok" },
      { "key": "latency-p95", "value": "18ms", "status": "ok" },
      { "key": "retry-budget", "value": "3x exp", "status": "info" },
      { "key": "drift-state", "value": "0 gaps", "status": "ok" }
    ],
    "footerTag": "DESIGN / VERIFY / OPERATE"
  }`;

  return `You are a senior software & DevOps engineer writing an industrial-grade technical blog post for Muhammad Ghufran Naseer's engineering portfolio (${todayIso}).

TARGET DOMAIN: ${domain.category}
TOPIC AREAS: ${domain.focus}

EXISTING BLOG TITLES (DO NOT REPEAT OR CLOSELY OVERLAP THESE):
${existingList || '(none yet)'}

WRITING & QUALITY RULES:
1. Pick a specific, practical, high-signal engineering topic inside "${domain.category}" that developers and engineering leads care about in production.
2. Do NOT fabricate fake personal anecdotes about specific companies or clients. Frame everything from solid first-principles engineering, production patterns, trade-offs, and actionable architecture.
3. Structure the HTML article body ("contentHtml") cleanly using ONLY semantic HTML tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <code>, <pre><code>, <blockquote>, and <div class="table-wrap"><table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table></div>.
4. Include:
   - An engaging 2-3 paragraph introduction explaining the real production problem and why it matters.
   - 4 to 5 well-structured <h2> sections (numbered or clearly titled) with <h3> subsections where helpful, concrete bullet lists ("Key Features", "Common Operational Mistakes", or "Production Checklist"), and either a practical comparison table OR a concise realistic code/config snippet in <pre><code>.
   - A "Common Mistakes to Avoid" or "Engineering Lessons" section.
   - A crisp "Conclusion" with a memorable 3-line summary ("Remember: ...").
5. Aim for 900–1300 words of crisp, readable, non-fluffy technical prose.
6. Return strictly valid JSON matching this schema:
{
  "title": "Clear, specific SEO-friendly article title (max 85 chars)",
  "excerpt": "Compelling 1-2 sentence summary (130-165 chars) for article cards and meta description",
  "category": "${domain.category}",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "seoKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "contentHtml": "<p>...</p><h2>...</h2>...",
  "coverSpec": ${coverSchemaGuide}
}`;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required.');
  }

  const existingPosts = readPosts();
  const domainIndex = existingPosts.length % DOMAINS.length;
  const domain = DOMAINS[domainIndex];
  const preferredStyle = existingPosts.length % 2 === 0 ? 'architecture' : 'infographic';
  const todayIso = new Date().toISOString().slice(0, 10);

  const existingTitles = existingPosts.map((p) => p.title);
  const existingSlugs = new Set(existingPosts.map((p) => p.slug));

  const generated = await callGeminiJson(apiKey, buildPrompt({
    domain,
    preferredStyle,
    existingTitles,
    todayIso,
  }));

  if (!generated?.title || !generated?.contentHtml) {
    throw new Error('Generated JSON missing required title or contentHtml');
  }

  let slug = slugify(generated.title);
  if (!slug) slug = `engineering-post-${Date.now()}`;
  if (existingSlugs.has(slug)) {
    slug = `${slug}-${todayIso}`;
  }

  console.log(`Rendering cover diagram (${generated.coverSpec?.style || preferredStyle}) for ${slug}...`);
  const coverImage = await renderCoverImage(slug, generated.coverSpec);

  const nowIso = new Date().toISOString();
  const newPost = {
    id: `${todayIso}-${slug}`,
    slug,
    title: generated.title.trim(),
    excerpt: (generated.excerpt || '').trim(),
    contentHtml: generated.contentHtml.trim(),
    category: generated.category || domain.category,
    tags: Array.isArray(generated.tags) && generated.tags.length > 0
      ? generated.tags.slice(0, 6)
      : [domain.category],
    seo: {
      metaDescription: (generated.excerpt || generated.title).trim(),
      keywords: Array.isArray(generated.seoKeywords) ? generated.seoKeywords : generated.tags || [],
    },
    coverImage,
    readingTime: estimateReadingTime(generated.contentHtml),
    publishedAt: nowIso,
    createdAt: nowIso,
    author: AUTHOR_NAME,
    source: 'automated-daily',
  };

  writePosts([newPost, ...existingPosts]);
  buildAllBlogPages();

  // Store metadata for industrial-grade Conventional Commit in GitHub Actions
  const commitMeta = {
    title: newPost.title,
    slug: newPost.slug,
    category: newPost.category,
    readingTime: newPost.readingTime,
    coverImage: newPost.coverImage,
  };
  fs.writeFileSync(path.join(ROOT_DIR, '.last-commit-meta.json'), JSON.stringify(commitMeta, null, 2), 'utf8');

  console.log(`Published new post: "${newPost.title}" -> blog/${newPost.slug}/`);
}

main().catch((err) => {
  console.error('Daily post generation failed:', err);
  process.exit(1);
});
