import fs from 'node:fs';
import path from 'node:path';
import {
  AUTHOR_NAME,
  AUTHOR_SHORT,
  BLOG_DIR,
  ROOT_DIR,
  SITE_URL,
  ensureDir,
  escapeHtml,
  escapeXml,
  estimateReadingTime,
  formatDisplayDate,
  formatShortDate,
  readPosts,
} from './lib/utils.mjs';

function resolveAbsoluteImageUrl(coverImage) {
  if (!coverImage) return `${SITE_URL}/favicon.svg`;
  if (/^https?:\/\//i.test(coverImage)) return coverImage;
  const clean = coverImage.replace(/^\/+/, '');
  return `${SITE_URL}/${clean}`;
}

function resolveRelativeAsset(coverImage, basePath) {
  if (!coverImage) return `${basePath}favicon.svg`;
  if (/^https?:\/\//i.test(coverImage)) return coverImage;
  return `${basePath}${coverImage.replace(/^\/+/, '')}`;
}

function renderHeader(basePath) {
  return `    <header class="header">
        <div class="header-container">
            <div class="header-content">
                <div class="logo" data-testid="header-logo">
                    <a href="${basePath}index.html" style="text-decoration:none; color:inherit;">${AUTHOR_SHORT}</a>
                </div>
                <nav class="nav-desktop">
                    <a href="${basePath}index.html#services">Professional Services</a>
                    <a href="${basePath}index.html#about">About Muhammad</a>
                    <a href="${basePath}index.html#projects">Featured Projects</a>
                    <a href="${basePath}blog/">Articles</a>
                    <a href="${basePath}index.html#testimonials">Client Reviews</a>
                    <a href="${basePath}index.html#contact">Get In Touch</a>
                </nav>
                <div class="header-actions">
                    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
                        <i data-lucide="sun" class="sun-icon"></i>
                        <i data-lucide="moon" class="moon-icon"></i>
                    </button>
                    <a href="${basePath}index.html#contact" class="btn-primary header-cta" style="text-decoration:none;">
                        Get Quote
                    </a>
                    <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle navigation menu">
                        <i data-lucide="menu" class="menu-icon"></i>
                        <i data-lucide="x" class="close-icon"></i>
                    </button>
                </div>
            </div>
            <div class="mobile-menu" id="mobile-menu">
                <nav class="mobile-nav">
                    <a href="${basePath}index.html#services">Services</a>
                    <a href="${basePath}index.html#about">About</a>
                    <a href="${basePath}index.html#projects">Projects</a>
                    <a href="${basePath}blog/">Articles</a>
                    <a href="${basePath}index.html#testimonials">Testimonials</a>
                    <a href="${basePath}index.html#contact">Contact</a>
                    <div class="mobile-theme-toggle">
                        <button class="theme-toggle" id="mobile-theme-toggle" aria-label="Toggle theme">
                            <i data-lucide="sun" class="sun-icon"></i>
                            <i data-lucide="moon" class="moon-icon"></i>
                        </button>
                    </div>
                    <a href="${basePath}index.html#contact" class="btn-primary mobile-cta" style="text-decoration:none;">
                        Get Quote
                    </a>
                </nav>
            </div>
        </div>
    </header>`;
}

function renderFooter(basePath) {
  const year = new Date().getFullYear();
  return `    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="footer-name">${AUTHOR_SHORT}</div>
                    <p class="footer-tagline">Full Stack Developer &amp; AI Integration Specialist</p>
                    <p class="footer-description">Building modern web applications, scalable backends, and production engineering workflows.</p>
                </div>
                <div class="footer-links">
                    <h4 class="footer-links-title">Quick Links</h4>
                    <div class="footer-links-list">
                        <a href="${basePath}index.html#services">Services</a>
                        <a href="${basePath}index.html#about">About</a>
                        <a href="${basePath}index.html#projects">Projects</a>
                        <a href="${basePath}blog/">Articles</a>
                        <a href="${basePath}index.html#contact">Contact</a>
                    </div>
                </div>
                <div class="footer-connect">
                    <h4 class="footer-connect-title">Connect</h4>
                    <div class="footer-connect-list">
                        <a href="mailto:me.ghufrannaseer@gmail.com">
                            <i data-lucide="mail"></i>
                            Email
                        </a>
                        <a href="https://www.linkedin.com/in/ghufran-naseer/" target="_blank" rel="noopener noreferrer">
                            <i data-lucide="linkedin"></i>
                            LinkedIn
                        </a>
                        <a href="https://github.com/GhufranNaseer" target="_blank" rel="noopener noreferrer">
                            <i data-lucide="github"></i>
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${year} ${AUTHOR_NAME}. All rights reserved.</p>
            </div>
        </div>
    </footer>`;
}

function renderPageScript() {
  return `    <script>
        (function () {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.className = savedTheme + '-theme';

            document.querySelectorAll('.theme-toggle').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const isDark = document.body.classList.contains('dark-theme');
                    const next = isDark ? 'light' : 'dark';
                    document.body.className = next + '-theme';
                    localStorage.setItem('theme', next);
                });
            });

            const mobileBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileBtn && mobileMenu) {
                mobileBtn.addEventListener('click', function () {
                    mobileMenu.classList.toggle('active');
                    mobileBtn.classList.toggle('active');
                });
                mobileMenu.querySelectorAll('a').forEach(function (link) {
                    link.addEventListener('click', function () {
                        mobileMenu.classList.remove('active');
                        mobileBtn.classList.remove('active');
                    });
                });
            }

            const copyBtn = document.getElementById('copy-link-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', function () {
                    navigator.clipboard.writeText(window.location.href).then(function () {
                        const label = copyBtn.querySelector('.copy-label');
                        if (label) {
                            const prev = label.textContent;
                            label.textContent = 'Copied!';
                            setTimeout(function () { label.textContent = prev; }, 2000);
                        }
                    });
                });
            }

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        })();
    </script>`;
}

function truncateWordSafe(text = '', maxLen = 158) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).replace(/[,:;.\-]+$/, '') + '...';
}

function renderPostPage(post, prevPost, nextPost) {
  const basePath = '../../';
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}/`;
  const imageUrl = resolveAbsoluteImageUrl(post.coverImage);
  const relativeImage = resolveRelativeAsset(post.coverImage, basePath);
  const readingTime = post.readingTime || estimateReadingTime(post.contentHtml || '');
  const publishedIso = new Date(post.publishedAt || post.createdAt || Date.now()).toISOString();
  const displayDate = formatDisplayDate(publishedIso);
  const tags = Array.isArray(post.tags) && post.tags.length > 0 ? post.tags : [post.category || 'Engineering'];
  const metaDescription = truncateWordSafe(post.seo?.metaDescription || post.excerpt || post.title, 158);
  const keywords = (post.seo?.keywords && post.seo.keywords.length > 0 ? post.seo.keywords : tags).join(', ');
  const author = post.author || AUTHOR_NAME;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        headline: post.title,
        description: metaDescription,
        image: [imageUrl],
        datePublished: publishedIso,
        dateModified: publishedIso,
        articleSection: post.category || 'Software Engineering',
        keywords,
        author: {
          '@type': 'Person',
          name: AUTHOR_NAME,
          url: SITE_URL,
          sameAs: [
            'https://github.com/GhufranNaseer',
            'https://www.linkedin.com/in/ghufran-naseer/',
          ],
        },
        publisher: {
          '@type': 'Person',
          name: AUTHOR_NAME,
          url: SITE_URL,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/blog/` },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
        ],
      },
    ],
  };

  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const tagsHtml = tags
    .map((t) => `<span class="blog-tag-chip">#${escapeHtml(t)}</span>`)
    .join('');

  const articleTagsMeta = tags
    .map((t) => `    <meta property="article:tag" content="${escapeHtml(t)}">`)
    .join('\n');

  const navCardsHtml = [
    prevPost
      ? `<a href="../${prevPost.slug}/" class="blog-nav-card">
            <span class="blog-nav-dir"><i data-lucide="arrow-left"></i> Newer Article</span>
            <span class="blog-nav-title">${escapeHtml(prevPost.title)}</span>
         </a>`
      : '<div></div>',
    nextPost
      ? `<a href="../${nextPost.slug}/" class="blog-nav-card blog-nav-card-right">
            <span class="blog-nav-dir">Older Article <i data-lucide="arrow-right"></i></span>
            <span class="blog-nav-title">${escapeHtml(nextPost.title)}</span>
         </a>`
      : '<div></div>',
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(post.title)} | ${AUTHOR_NAME}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}">
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <meta name="author" content="${escapeHtml(author)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="icon" type="image/svg+xml" href="${basePath}favicon.svg">
    <link rel="shortcut icon" href="${basePath}favicon.svg">

    <!-- Open Graph / LinkedIn / Meta -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${AUTHOR_NAME}">
    <meta property="og:title" content="${escapeHtml(post.title)}">
    <meta property="og:description" content="${escapeHtml(metaDescription)}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(post.title)}">
    <meta property="article:published_time" content="${publishedIso}">
    <meta property="article:author" content="${escapeHtml(author)}">
    <meta property="article:section" content="${escapeHtml(post.category || 'Engineering')}">
${articleTagsMeta}

    <!-- Twitter / X Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(post.title)}">
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="${basePath}styles.css">

    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 4)}
    </script>
</head>
<body class="light-theme">
${renderHeader(basePath)}

    <main class="blog-article-main">
        <article class="blog-article-container" itemscope itemtype="https://schema.org/BlogPosting">
            <nav class="blog-breadcrumb" aria-label="Breadcrumb">
                <a href="${basePath}index.html">Home</a>
                <span>/</span>
                <a href="${basePath}blog/">Articles</a>
                <span>/</span>
                <span>${escapeHtml(post.category || 'Engineering')}</span>
            </nav>

            <header class="blog-article-header">
                <div class="blog-article-meta">
                    <span class="blog-category-badge">${escapeHtml(post.category || 'Engineering')}</span>
                    <span class="blog-meta-item">
                        <i data-lucide="calendar"></i>
                        <time datetime="${publishedIso}" itemprop="datePublished">${escapeHtml(displayDate)}</time>
                    </span>
                    <span class="blog-meta-item">
                        <i data-lucide="clock"></i>
                        <span>${escapeHtml(readingTime)}</span>
                    </span>
                    <span class="blog-meta-item" itemprop="author" itemscope itemtype="https://schema.org/Person">
                        <i data-lucide="user"></i>
                        <span itemprop="name">${escapeHtml(author)}</span>
                    </span>
                </div>

                <h1 class="blog-article-title" itemprop="headline">${escapeHtml(post.title)}</h1>
                <p class="blog-article-subtitle" itemprop="description">${escapeHtml(post.excerpt || metaDescription)}</p>

                <div class="blog-share-bar">
                    <span class="blog-share-label">Share:</span>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="blog-share-btn" aria-label="Share on LinkedIn">
                        <i data-lucide="linkedin"></i> LinkedIn
                    </a>
                    <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer" class="blog-share-btn" aria-label="Share on X">
                        <i data-lucide="share-2"></i> X / Twitter
                    </a>
                    <button type="button" id="copy-link-btn" class="blog-share-btn">
                        <i data-lucide="link"></i> <span class="copy-label">Copy Link</span>
                    </button>
                </div>

                <figure class="blog-cover-figure">
                    <img src="${escapeHtml(relativeImage)}" alt="${escapeHtml(post.title)}" class="blog-cover-img" itemprop="image">
                </figure>
            </header>

            <div class="blog-prose" itemprop="articleBody">
${post.contentHtml}
            </div>

            <div class="blog-tags-footer">
                ${tagsHtml}
            </div>

            <aside class="blog-author-box">
                <div class="blog-author-avatar">MG</div>
                <div class="blog-author-info">
                    <div class="blog-author-name">${AUTHOR_NAME}</div>
                    <p class="blog-author-bio">Full Stack Developer &amp; AI Integration Specialist building scalable web systems, backend APIs, DevOps pipelines, and production-grade software.</p>
                    <div class="blog-author-links">
                        <a href="https://github.com/GhufranNaseer" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a href="https://www.linkedin.com/in/ghufran-naseer/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="${basePath}index.html#contact">Work With Me</a>
                    </div>
                </div>
            </aside>

            <nav class="blog-prev-next" aria-label="Article navigation">
                ${navCardsHtml}
            </nav>

            <div class="blog-back-row">
                <a href="${basePath}blog/" class="btn-outline" style="text-decoration:none;">
                    <i data-lucide="arrow-left"></i> All Articles
                </a>
                <a href="${basePath}index.html#blogs" class="btn-primary" style="text-decoration:none;">
                    Back to Portfolio
                </a>
            </div>
        </article>
    </main>

${renderFooter(basePath)}
${renderPageScript()}
</body>
</html>
`;
}

function renderArchivePage(posts) {
  const basePath = '../';
  const canonicalUrl = `${SITE_URL}/blog/`;
  const categories = [...new Set(posts.map((p) => p.category || 'Engineering'))];
  const latestImage = posts[0] ? resolveAbsoluteImageUrl(posts[0].coverImage) : `${SITE_URL}/favicon.svg`;

  const filterButtons = [
    `<button type="button" class="blog-filter-btn active" data-category="all">All (${posts.length})</button>`,
    ...categories.map(
      (cat) => `<button type="button" class="blog-filter-btn" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
    ),
  ].join('\n');

  const cardsHtml = posts
    .map((post) => {
      const relImg = resolveRelativeAsset(post.coverImage, basePath);
      const dateLabel = formatShortDate(post.publishedAt || post.createdAt);
      const readingTime = post.readingTime || estimateReadingTime(post.contentHtml || '');
      return `
                <article class="card project-card blog-archive-card" data-category="${escapeHtml(post.category || 'Engineering')}" data-title="${escapeHtml((post.title + ' ' + (post.excerpt || '')).toLowerCase())}">
                    <a href="./${post.slug}/" class="project-image-container" style="display:block;">
                        <img class="project-image" src="${escapeHtml(relImg)}" alt="${escapeHtml(post.title)}" loading="lazy">
                    </a>
                    <div class="project-content">
                        <div class="project-category">${escapeHtml(post.category || 'Engineering')}</div>
                        <h2 class="project-title" style="font-size:1.15rem;">
                            <a href="./${post.slug}/" style="color:inherit;text-decoration:none;">${escapeHtml(post.title)}</a>
                        </h2>
                        <p class="project-description">${escapeHtml(post.excerpt || '')}</p>
                        <div class="project-tech" style="margin-top:auto;">
                            <span class="tech-tag" style="display:inline-flex;align-items:center;gap:4px;">
                                <i data-lucide="calendar" style="width:13px;height:13px;"></i> ${escapeHtml(dateLabel)}
                            </span>
                            <span class="tech-tag" style="display:inline-flex;align-items:center;gap:4px;">
                                <i data-lucide="clock" style="width:13px;height:13px;"></i> ${escapeHtml(readingTime)}
                            </span>
                        </div>
                        <a href="./${post.slug}/" class="project-view-button" style="text-decoration:none;margin-top:0.75rem;">
                            Read Article <i data-lucide="arrow-right"></i>
                        </a>
                    </div>
                </article>`;
    })
    .join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Technical Articles | ${AUTHOR_NAME}`,
    description: 'Engineering deep dives on Backend Architecture, DevOps, Kubernetes, Cybersecurity, Full Stack Development, and AI Integration.',
    url: canonicalUrl,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Technical Articles &amp; Engineering Blog | ${AUTHOR_NAME}</title>
    <meta name="description" content="Industrial engineering articles on Backend Architecture, DevOps, Kubernetes, Cybersecurity, React, Node.js, and AI Integration by Muhammad Ghufran Naseer.">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="icon" type="image/svg+xml" href="${basePath}favicon.svg">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${AUTHOR_NAME}">
    <meta property="og:title" content="Technical Articles &amp; Engineering Blog | ${AUTHOR_NAME}">
    <meta property="og:description" content="Engineering deep dives on Backend Architecture, DevOps, Kubernetes, Cybersecurity, Full Stack, and AI Integration.">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${latestImage}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Technical Articles &amp; Engineering Blog | ${AUTHOR_NAME}">
    <meta name="twitter:image" content="${latestImage}">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="${basePath}styles.css">

    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 4)}
    </script>
</head>
<body class="light-theme">
${renderHeader(basePath)}

    <main class="blog-archive-main">
        <div class="container">
            <div class="section-header" style="margin-bottom:2rem;">
                <h1 class="section-title" style="font-size:2.5rem;">Engineering Articles</h1>
                <p class="section-description">
                    Deep dives on Backend Architecture, DevOps &amp; Kubernetes, Cybersecurity, Full Stack Development, and AI Integration.
                </p>
            </div>

            <div class="blog-archive-controls">
                <div class="blog-filter-group" id="blog-filter-group">
                    ${filterButtons}
                </div>
                <div class="blog-search-wrap">
                    <i data-lucide="search" class="blog-search-icon"></i>
                    <input type="search" id="blog-search-input" class="blog-search-input" placeholder="Search articles...">
                </div>
            </div>

            <div class="projects-grid" id="blog-archive-grid">
                ${cardsHtml}
            </div>
        </div>
    </main>

${renderFooter(basePath)}
${renderPageScript()}
    <script>
        (function () {
            const buttons = document.querySelectorAll('.blog-filter-btn');
            const searchInput = document.getElementById('blog-search-input');
            const cards = document.querySelectorAll('.blog-archive-card');
            let activeCat = 'all';

            function applyFilters() {
                const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
                cards.forEach(function (card) {
                    const cat = card.getAttribute('data-category');
                    const text = card.getAttribute('data-title') || '';
                    const matchesCat = activeCat === 'all' || cat === activeCat;
                    const matchesQuery = !q || text.includes(q);
                    card.style.display = matchesCat && matchesQuery ? 'flex' : 'none';
                });
            }

            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    buttons.forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    activeCat = btn.getAttribute('data-category') || 'all';
                    applyFilters();
                });
            });

            if (searchInput) {
                searchInput.addEventListener('input', applyFilters);
            }
        })();
    </script>
</body>
</html>
`;
}

function buildSitemapXml(posts) {
  const latestDate = posts[0]?.publishedAt
    ? new Date(posts[0].publishedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const postUrls = posts
    .map((post) => {
      const lastmod = new Date(post.publishedAt || post.createdAt || Date.now()).toISOString().slice(0, 10);
      return `    <url>
        <loc>${escapeXml(`${SITE_URL}/blog/${post.slug}/`)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${SITE_URL}/</loc>
        <lastmod>${latestDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/blog/</loc>
        <lastmod>${latestDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
${postUrls}
</urlset>
`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export function buildAllBlogPages() {
  const posts = readPosts();
  ensureDir(BLOG_DIR);

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const prevPost = i > 0 ? posts[i - 1] : null;
    const nextPost = i < posts.length - 1 ? posts[i + 1] : null;

    const postDir = path.join(BLOG_DIR, post.slug);
    ensureDir(postDir);
    const html = renderPostPage(post, prevPost, nextPost);
    fs.writeFileSync(path.join(postDir, 'index.html'), html, 'utf8');
  }

  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderArchivePage(posts), 'utf8');
  fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), buildSitemapXml(posts), 'utf8');
  fs.writeFileSync(path.join(ROOT_DIR, 'robots.txt'), buildRobotsTxt(), 'utf8');

  console.log(`Built ${posts.length} static blog pages, blog/index.html, sitemap.xml, and robots.txt.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  buildAllBlogPages();
}
