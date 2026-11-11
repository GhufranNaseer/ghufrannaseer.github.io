import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import https from 'node:https';
import {
  AUTHOR_NAME,
  ROOT_DIR,
  SITE_URL,
  estimateReadingTime,
  readPosts,
  slugify,
  stripHtml,
  writePosts,
} from './lib/utils.mjs';

dns.setDefaultResultOrder('ipv4first');
import { renderCoverImage, sanitizeSvgMarkup } from './render-cover.mjs';
import { buildAllBlogPages } from './build-blog.mjs';

const TOPIC_PILLARS = [
  {
    category: 'Full Stack Engineering',
    focus: 'Laravel, PHP, React, JavaScript, REST/GraphQL APIs, state synchronization, form concurrency, local-vs-production environment mismatches',
  },
  {
    category: 'Enterprise Systems & Automation',
    focus: 'ERP/PMS data integrity, inventory reconciliation, idempotent approval workflows, audit trails, background queues on constrained servers',
  },
  {
    category: 'AI Integration & Agents',
    focus: 'Production RAG reliability, structured output validation, AI agent failure modes beyond demos, tool-call guardrails, latency and fallback routing',
  },
  {
    category: 'DevOps & Production Infrastructure',
    focus: 'Docker resource limits, VPS hosting constraints, reverse proxies, zero-downtime deployments, CI/CD failure gates, environment drift',
  },
  {
    category: 'Database Architecture & Recovery',
    focus: 'PostgreSQL/MySQL indexing and execution plans, locking & race conditions, backup verification vs actual disaster recovery, safe schema migrations',
  },
  {
    category: 'Web Performance & Scalability',
    focus: 'Core Web Vitals (LCP, INP, CLS), N+1 query bottlenecks, caching invalidation traps, payload budgeting, main-thread blocking diagnosis',
  },
  {
    category: 'Software Architecture & Multi-Tenancy',
    focus: 'Multi-tenant data isolation, modular monolith vs microservices trade-offs, boundary contracts, event-driven decoupling, failure containment',
  },
  {
    category: 'WordPress Engineering & Migrations',
    focus: 'Zero-downtime WordPress migrations, Elementor/plugin performance bloat, database serialization pitfalls, security hardening, headless trade-offs',
  },
  {
    category: 'API Integrations & Security',
    focus: 'Debugging flaky third-party APIs, webhook signature verification & replay protection, OAuth/JWT rotation, rate-limit backoff, SSRF/IDOR prevention',
  },
  {
    category: 'Engineering Workflows & Maintainability',
    focus: 'Managing changing requirements, legacy code refactoring without rewrites, regression testing strategies, observability and post-incident debugging',
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
          } catch {
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

async function callGeminiJson(apiKey, prompt, temperature = 0.7) {
  let lastError = null;

  for (const model of MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      console.log(`Calling ${model}...`);
      const { status, data } = await httpsPostJson(endpoint, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
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

/**
 * Pick a domain pillar not recently covered in the latest posts so topics rotate naturally.
 */
function selectNextPillar(existingPosts) {
  const recentCategories = new Set(
    existingPosts.slice(0, 5).map((p) => String(p.category || '').toLowerCase())
  );

  const unusedRecent = TOPIC_PILLARS.filter(
    (pillar) => !recentCategories.has(pillar.category.toLowerCase())
  );

  const pool = unusedRecent.length > 0 ? unusedRecent : TOPIC_PILLARS;
  return pool[existingPosts.length % pool.length];
}

function buildArticlePrompt({ pillar, existingPosts, todayIso }) {
  const existingSummary = existingPosts
    .map((p, i) => `${i + 1}. [${p.category || 'General'}] ${p.title} — ${(p.excerpt || '').slice(0, 110)}`)
    .join('\n');

  return `You are a pragmatic Senior Full Stack & Systems Engineer writing an original technical article for Muhammad Ghufran Naseer's engineering portfolio (${todayIso}).

SUGGESTED DOMAIN PILLAR: ${pillar.category}
RELEVANT FOCUS AREAS: ${pillar.focus}
(You may also bridge across adjacent domains or emerging real-world engineering challenges when it produces a stronger, non-overlapping problem.)

EXISTING PUBLISHED ARTICLES — ANALYZE CAREFULLY & DO NOT OVERLAP OR REWORD THESE TOPICS:
${existingSummary || '(none yet)'}

CONTENT STRATEGY & TOPIC SELECTION:
1. Choose a specific, practical, real-world engineering problem that software engineers, technical founders, or engineering teams actually encounter in production (for example: why systems pass locally yet fail in production, inventory/ledger drift under concurrency, backup vs verified recovery, multi-tenant data boundary leaks, third-party webhook failure handling, background jobs on constrained VPS infrastructure, WordPress migration/serialization pitfalls, or why AI agents break outside simple demos). Do NOT copy those exact titles — invent a fresh, specific angle not already covered above.
2. NEVER write generic "What is X?" or "Introduction to X" beginner tutorials or repetitive SEO fluff.
3. Demonstrate genuine engineering judgment:
   - Diagnose root causes and failure modes.
   - Explain the architecture, implementation approach, and trade-offs.
   - Include realistic, accurate code, SQL, or configuration snippets in <pre><code> where they genuinely clarify the fix.
   - Highlight common anti-patterns and operational considerations (security, concurrency, performance, observability, maintainability) naturally where relevant — do NOT force identical boilerplate headings into every post.

STRICT AUTHENTICITY & CREDIBILITY RULES:
- NO hype, buzzwords ("revolutionary", "game-changing"), or generic AI-sounding filler.
- NEVER invent fake client stories, fabricated company names, or made-up benchmark numbers (e.g., do not claim "cut latency by 83% for a Fortune 500 client").
- Do not claim unimplemented personal experience; frame insights from sound engineering principles, documented platform behavior, and anonymized real-world architectural patterns.

HTML & LINKEDIN FORMAT RULES:
- Use ONLY semantic HTML tags in "contentHtml": <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <code>, <pre><code>, <blockquote>, and <div class="table-wrap"><table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table></div>.
- Aim for 950–1350 words of crisp, readable technical writing with a clear problem statement and a grounded closing takeaway.
- Write "linkedinPost" (900–1450 characters, plain text, no markdown asterisks) tailored for technical leads, recruiters, and engineers:
  - Opening hook naming the real engineering problem
  - Concise context (2 lines)
  - 3–4 numbered technical insights (1., 2., 3., 4.)
  - Short closing engineering principle
  - 4–6 relevant hashtags at the very bottom
  (Do NOT include any URL placeholder in linkedinPost; our publisher appends the live article URL automatically.)

Return strictly valid JSON:
{
  "title": "Specific, credible engineering title (max 85 chars)",
  "excerpt": "Crisp 1-2 sentence problem summary (130-165 chars)",
  "category": "${pillar.category}",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "seoKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "contentHtml": "<p>...</p><h2>...</h2>...",
  "linkedinPost": "...",
  "fallbackCover": {
    "eyebrow": "SHORT UPPERCASE TOPIC",
    "headline": "4-6 Word Visual Headline",
    "highlightWord": "1-2 key words",
    "subtitle": "Concise 1-line summary",
    "highlights": [
      { "icon": "layers", "title": "Root Cause", "detail": "Max 55 chars" },
      { "icon": "code", "title": "Mechanism", "detail": "Max 55 chars" },
      { "icon": "shield", "title": "Safeguard", "detail": "Max 55 chars" }
    ],
    "takeaway": "Core engineering principle: ",
    "takeawayHighlight": "short key insight.",
    "pillars": ["Concept 1", "Concept 2", "Concept 3"],
    "panelTitle": "diagnostics.log",
    "panelStatus": "ANALYZED",
    "panelTopic": "System State",
    "panelSubtopic": "Short 4-word summary",
    "panelLines": [
      { "key": "check-1", "value": "VALUE", "status": "ok" },
      { "key": "check-2", "value": "VALUE", "status": "warn" },
      { "key": "check-3", "value": "VALUE", "status": "info" }
    ]
  }
}`;
}

function extractArticleDigest(article) {
  const headings = [...String(article.contentHtml || '').matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean);
  const plainSummary = stripHtml(article.contentHtml || '').slice(0, 1800);
  return { headings, plainSummary };
}

function buildVisualArchitectPrompt(article) {
  const { headings, plainSummary } = extractArticleDigest(article);

  return `You are a Principal Technical Illustrator & Information Designer creating a bespoke 1200x630 cover diagram for a software engineering article.

ARTICLE TO VISUALIZE:
- Title: ${article.title}
- Category: ${article.category}
- Excerpt: ${article.excerpt}
- Main Sections: ${headings.join(' | ')}
- Technical Digest: ${plainSummary}

YOUR MISSION:
Analyze the actual technical mechanism, failure mode, or architecture in this article, and design ONE custom, educational, publication-grade inline SVG diagram (<svg viewBox="0 0 1120 440" xmlns="http://www.w3.org/2000/svg">) that visually teaches that exact concept.

CHOOSE THE VISUAL APPROACH THAT FITS THIS TOPIC BEST (do NOT force every topic into 3 columns):
- Infrastructure / Kubernetes / Containers -> Cluster boundary, Control Plane, Worker Nodes, Pods, Service routing arrows.
- Web Performance (LCP, INP, Hydration) -> Horizontal browser/main-thread timeline bars comparing blocking work vs optimized critical path.
- CI/CD / Deployment / Migration -> Connected stage pipeline with validation gates and failure/rollback branch.
- Database / Indexing / Locking -> Query execution tree (Seq Scan vs B-Tree Index lookup) or transaction timeline showing race condition vs lock/atomic update.
- Multi-Tenant / Security / APIs -> Request flow crossing tenant/auth boundary walls, token validation, rate limiter, webhook idempotency ledger.
- AI Agents / RAG -> Execution loop (Query -> Retrieval/Tools -> Schema Validator -> Deterministic Output / Fallback branch).
- ERP / Approval / State Machines -> State nodes, transition guards, ledger reconciliation flow.

STRICT VISUAL & SVG CRAFTSMANSHIP RULES:
1. Viewport is EXACTLY viewBox="0 0 1120 440". Keep ALL shapes and text inside x: 24..1096 and y: 20..420 so nothing ever clips.
2. Minimal, crisp text ONLY: short labels (1–4 words), generous padding inside boxes (at least 16px margin from edges), font-family="Inter, Arial, sans-serif", font-size between 11 and 16. NEVER overlap text and shapes.
3. Choose theme "light" or "dark" based on what makes the diagram clearest:
   - If "light": surface background is #ffffff, use crisp slate borders (#cbd5e1, #94a3b8), dark ink (#0f172a), muted (#475569), subtle fills (#f8fafc, #eff6ff, #ecfdf5, #fffbeb, #fef2f2), accents (#1d4ed8 royal blue, #059669 emerald, #d97706 amber, #dc2626 red for errors/bottlenecks).
   - If "dark": surface background is #0f1625, use crisp subtle borders (#334155, #475569), light ink (#f8fafc), muted (#94a3b8), node fills (#162033, #111827), accents (#60a5fa cobalt, #34d399 emerald, #fbbf24 amber, #f87171 red for errors/bottlenecks).
4. Include clear directional connectors (<defs><marker id="arrow" ...>...</marker></defs>) or timeline tracks so the viewer understands relationships, cause-and-effect, or data flow at a glance.
5. NO <script>, NO <foreignObject>, NO external URLs (http/https), NO tacky clipart or random decorative circles. Pure clean architectural diagramming.

Return strictly valid JSON:
{
  "conceptAnalysis": "1 sentence describing the exact technical mechanism depicted",
  "visualTypeLabel": "SHORT 1-3 WORD BADGE (e.g. QUERY PLAN, FRAME TIMELINE, CLUSTER TOPOLOGY, STATE FLOW, PIPELINE GATE)",
  "theme": "light" or "dark",
  "title": "Concise diagram title (max 68 chars)",
  "subtitle": "Short 1-line educational caption (max 85 chars)",
  "svgMarkup": "<svg viewBox=\\"0 0 1120 440\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>"
}`;
}

async function designTopicVisual(apiKey, article) {
  try {
    const visualSpec = await callGeminiJson(apiKey, buildVisualArchitectPrompt(article), 0.55);
    const cleanedSvg = sanitizeSvgMarkup(visualSpec?.svgMarkup || '');
    if (!cleanedSvg) {
      throw new Error('Visual architect returned empty or invalid SVG markup');
    }
    return {
      mode: 'custom-svg',
      category: article.category,
      theme: visualSpec.theme === 'dark' ? 'dark' : 'light',
      visualTypeLabel: visualSpec.visualTypeLabel || 'ARCHITECTURE',
      title: visualSpec.title || article.title,
      subtitle: visualSpec.subtitle || '',
      svgMarkup: cleanedSvg,
      fallbackSpec: article.fallbackCover || {},
    };
  } catch (err) {
    console.warn(`Stage 2 custom visual generation fell back: ${err.message}`);
    return article.fallbackCover || {
      eyebrow: article.category,
      headline: article.title,
      subtitle: article.excerpt,
    };
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required.');
  }

  const existingPosts = readPosts();
  const pillar = selectNextPillar(existingPosts);
  const todayIso = new Date().toISOString().slice(0, 10);

  console.log(`Stage 1: Generating problem-driven article (pillar: ${pillar.category})...`);
  const generated = await callGeminiJson(
    apiKey,
    buildArticlePrompt({ pillar, existingPosts, todayIso }),
    0.72
  );

  if (!generated?.title || !generated?.contentHtml) {
    throw new Error('Generated JSON missing required title or contentHtml');
  }

  const existingSlugs = new Set(existingPosts.map((p) => p.slug));
  let slug = slugify(generated.title);
  if (!slug) slug = `engineering-post-${Date.now()}`;
  if (existingSlugs.has(slug)) {
    slug = `${slug}-${todayIso}`;
  }

  console.log(`Stage 2: Designing topic-specific technical diagram for "${generated.title}"...`);
  const coverSpec = await designTopicVisual(apiKey, {
    ...generated,
    category: generated.category || pillar.category,
  });

  const linkedinCoverPngPath = path.join(ROOT_DIR, '.linkedin-cover.png');
  const coverImage = await renderCoverImage(slug, coverSpec, {
    tempPngPath: linkedinCoverPngPath,
  });

  const nowIso = new Date().toISOString();
  const newPost = {
    id: `${todayIso}-${slug}`,
    slug,
    title: generated.title.trim(),
    excerpt: (generated.excerpt || '').trim(),
    contentHtml: generated.contentHtml.trim(),
    category: generated.category || pillar.category,
    tags: Array.isArray(generated.tags) && generated.tags.length > 0
      ? generated.tags.slice(0, 6)
      : [pillar.category],
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

  // Store metadata for Conventional Commit & LinkedIn publishing in GitHub Actions
  const blogUrl = `${SITE_URL}/blog/${newPost.slug}/`;
  const commitMeta = {
    title: newPost.title,
    slug: newPost.slug,
    category: newPost.category,
    readingTime: newPost.readingTime,
    coverImage: newPost.coverImage,
    blogUrl,
    linkedinPost: (generated.linkedinPost || `${newPost.title}\n\n${newPost.excerpt}`).trim(),
    linkedinCoverPngPath: '.linkedin-cover.png',
  };
  fs.writeFileSync(path.join(ROOT_DIR, '.last-commit-meta.json'), JSON.stringify(commitMeta, null, 2), 'utf8');

  console.log(`Published new post: "${newPost.title}" -> blog/${newPost.slug}/`);
}

main().catch((err) => {
  console.error('Daily post generation failed:', err);
  process.exit(1);
});
