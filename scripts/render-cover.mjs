import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import {
  IMAGES_DIR,
  ensureDir,
  escapeHtml,
  findBrowserExecutable,
} from './lib/utils.mjs';

const ACCENT_PALETTE = {
  blue: {
    border: '#bfdbfe',
    bg: '#eff6ff',
    solid: '#2563eb',
    text: '#1d4ed8',
    pillBg: '#ffffff',
  },
  emerald: {
    border: '#a7f3d0',
    bg: '#ecfdf5',
    solid: '#059669',
    text: '#047857',
    pillBg: '#ffffff',
  },
  orange: {
    border: '#fed7aa',
    bg: '#fff7ed',
    solid: '#ea580c',
    text: '#c2410c',
    pillBg: '#ffffff',
  },
  violet: {
    border: '#ddd6fe',
    bg: '#f5f3ff',
    solid: '#7c3aed',
    text: '#6d28d9',
    pillBg: '#ffffff',
  },
};

function getIconSvg(name = 'layers', color = '#38bdf8') {
  const icons = {
    shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    code: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    cpu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    layers: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    server: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
  };
  return icons[name] || icons.layers;
}

function buildArchitectureHtml(spec) {
  const badgeLeft = escapeHtml(spec.badgeLeft || 'SYSTEM ARCHITECTURE • GUIDE');
  const badgeRight = escapeHtml(spec.badgeRight || 'PRODUCTION READY');
  const titleParts = Array.isArray(spec.titleParts) && spec.titleParts.length > 0
    ? spec.titleParts
    : [{ text: spec.headline || 'Engineering Architecture', accent: 'blue' }];

  const titleHtml = titleParts
    .map((part) => {
      if (part.accent === 'muted') {
        return `<span style="color:#64748b;font-weight:700;">${escapeHtml(part.text)}</span>`;
      }
      const color = ACCENT_PALETTE[part.accent]?.solid || '#0f172a';
      return `<span style="color:${color};">${escapeHtml(part.text)}</span>`;
    })
    .join(' ');

  const columns = (spec.columns || []).slice(0, 3);
  const accentOrder = ['blue', 'emerald', 'orange'];

  const columnsHtml = columns
    .map((col, idx) => {
      const pal = ACCENT_PALETTE[col.accent] || ACCENT_PALETTE[accentOrder[idx % accentOrder.length]];
      const nodes = (col.nodes || []).slice(0, 3);
      const nodesHtml = nodes
        .map(
          (node) => `
          <div style="background:#ffffff;border:1.5px solid ${pal.border};border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(15,23,42,0.04);">
            <div style="background:${pal.solid};color:#ffffff;padding:5px 12px;display:flex;align-items:center;justify-content:space-between;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;">
              <span>${escapeHtml(node.label || 'node')}</span>
              <span style="width:9px;height:9px;border-radius:999px;background:#4ade80;display:inline-block;"></span>
            </div>
            <div style="padding:11px 14px;display:flex;align-items:center;gap:12px;">
              <div style="width:26px;height:26px;border-radius:8px;background:${pal.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${getIconSvg('layers', pal.solid)}
              </div>
              <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13.5px;color:#1e293b;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${escapeHtml(node.spec || '')}
              </div>
            </div>
          </div>`
        )
        .join('');

      return `
        <div style="flex:1;background:${pal.bg};border:1.5px solid ${pal.border};border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:5px;height:24px;border-radius:4px;background:${pal.solid};display:inline-block;"></span>
              <span style="font-size:19px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">${escapeHtml(col.title || '')}</span>
            </div>
            <span style="background:#ffffff;border:1px solid ${pal.border};color:${pal.text};padding:4px 10px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;">
              ${escapeHtml(col.tag || '')}
            </span>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;flex:1;">
            ${nodesHtml}
          </div>
          <div style="border-top:1px solid ${pal.border};padding-top:10px;margin-top:2px;">
            <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:4px;">${escapeHtml(col.summary || '')}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:0.04em;">
              <span style="color:#64748b;text-transform:uppercase;">USE FOR</span>
              <span style="color:${pal.text};text-transform:uppercase;">${escapeHtml(col.useFor || '')}</span>
            </div>
          </div>
        </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;width:1200px;height:630px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f8fafc;background-image:radial-gradient(#cbd5e1 1px,transparent 1px);background-size:18px 18px;box-sizing:border-box;display:flex;flex-direction:column;padding:28px 36px 22px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
    <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;color:#334155;letter-spacing:0.04em;">
      ${badgeLeft}
    </div>
    <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:999px;padding:6px 16px;font-size:12px;font-weight:700;color:#0f172a;">
      ${badgeRight}
    </div>
  </div>
  <h1 style="margin:0 0 12px 0;font-size:34px;font-weight:800;line-height:1.15;letter-spacing:-0.025em;">
    ${titleHtml}
  </h1>
  <div style="height:3px;width:100%;background:#e2e8f0;border-radius:999px;margin-bottom:18px;overflow:hidden;">
    <div style="width:92px;height:100%;background:#2563eb;border-radius:999px;"></div>
  </div>
  <div style="display:flex;gap:18px;flex:1;min-height:0;">
    ${columnsHtml}
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:11px;color:#64748b;font-weight:600;">
    <span>Muhammad Ghufran Naseer • Engineering Deep Dive</span>
    <span>ghufrannaseer.github.io</span>
  </div>
</body>
</html>`;
}

function buildInfographicHtml(spec) {
  const eyebrow = escapeHtml(spec.eyebrow || 'ENGINEERING DEEP DIVE');
  const headline = escapeHtml(spec.headline || 'Production Engineering');
  const highlight = escapeHtml(spec.highlightWord || '');
  const formattedHeadline = highlight && headline.includes(highlight)
    ? headline.replace(highlight, `<span style="background:linear-gradient(90deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${highlight}</span>`)
    : headline;

  const subtitle = escapeHtml(spec.subtitle || '');
  const highlights = (spec.highlights || []).slice(0, 3);
  const cardAccents = ['#38bdf8', '#a78bfa', '#f43f5e'];

  const cardsHtml = highlights
    .map((h, idx) => {
      const accent = cardAccents[idx % cardAccents.length];
      return `
        <div style="flex:1;background:rgba(15,23,42,0.75);border:1px solid rgba(148,163,184,0.18);border-radius:12px;padding:14px;">
          <div style="width:34px;height:34px;border-radius:9px;background:rgba(56,189,248,0.12);border:1px solid ${accent}44;display:flex;align-items:center;justify-content:center;margin-bottom:10px;">
            ${getIconSvg(h.icon || 'shield', accent)}
          </div>
          <div style="font-size:13.5px;font-weight:700;color:#f8fafc;margin-bottom:4px;">${escapeHtml(h.title || '')}</div>
          <div style="font-size:11.5px;line-height:1.45;color:#94a3b8;">${escapeHtml(h.detail || '')}</div>
        </div>`;
    })
    .join('');

  const pillars = (spec.pillars || []).slice(0, 4);
  const pillarsHtml = pillars
    .map(
      (p) => `
      <div style="display:flex;align-items:center;gap:7px;background:rgba(30,41,59,0.7);border:1px solid rgba(148,163,184,0.16);border-radius:8px;padding:6px 11px;font-size:11.5px;color:#cbd5e1;font-weight:500;">
        <span style="width:6px;height:6px;border-radius:999px;background:#38bdf8;display:inline-block;"></span>
        ${escapeHtml(p)}
      </div>`
    )
    .join('');

  const panelLines = (spec.panelLines || []).slice(0, 5);
  const linesHtml = panelLines
    .map((line) => {
      const badgeColor = line.status === 'warn' ? '#f59e0b' : line.status === 'ok' ? '#22c55e' : '#38bdf8';
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 11px;background:rgba(15,23,42,0.85);border:1px solid rgba(148,163,184,0.14);border-radius:8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;">
          <span style="color:#cbd5e1;">${escapeHtml(line.key || '')}</span>
          <span style="color:${badgeColor};font-weight:700;">${escapeHtml(line.value || '')}</span>
        </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;width:1200px;height:630px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:radial-gradient(circle at 80% 25%,rgba(59,130,246,0.25),transparent 45%),radial-gradient(circle at 20% 80%,rgba(139,92,246,0.18),transparent 45%),linear-gradient(135deg,#070b14 0%,#0f172a 55%,#111827 100%);color:#f8fafc;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:40px 46px 28px;">
  <div style="display:flex;gap:36px;align-items:center;flex:1;">
    <div style="flex:1.25;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <span style="width:24px;height:2px;background:#818cf8;display:inline-block;"></span>
        <span style="font-size:12px;font-weight:700;letter-spacing:0.14em;color:#cbd5e1;text-transform:uppercase;">${eyebrow}</span>
      </div>
      <h1 style="margin:0 0 10px 0;font-size:40px;font-weight:800;line-height:1.12;letter-spacing:-0.025em;color:#ffffff;">
        ${formattedHeadline}
      </h1>
      <p style="margin:0 0 22px 0;font-size:16px;line-height:1.45;color:#cbd5e1;font-weight:400;">
        ${subtitle}
      </p>
      <div style="display:flex;gap:12px;margin-bottom:20px;">
        ${cardsHtml}
      </div>
      <div style="font-size:14.5px;line-height:1.5;color:#94a3b8;margin-bottom:18px;border-left:3px solid #6366f1;padding-left:14px;">
        ${escapeHtml(spec.takeaway || '')}
        <strong style="color:#c4b5fd;">${escapeHtml(spec.takeawayHighlight || '')}</strong>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${pillarsHtml}
      </div>
    </div>

    <div style="flex:0.85;background:rgba(15,23,42,0.82);border:1px solid rgba(96,165,250,0.28);border-radius:18px;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,0.45);display:flex;flex-direction:column;gap:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(148,163,184,0.16);padding-bottom:12px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <span style="width:10px;height:10px;border-radius:999px;background:#ef4444;display:inline-block;"></span>
          <span style="width:10px;height:10px;border-radius:999px;background:#f59e0b;display:inline-block;"></span>
          <span style="width:10px;height:10px;border-radius:999px;background:#22c55e;display:inline-block;"></span>
          <span style="margin-left:8px;font-size:12px;color:#94a3b8;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(spec.panelTitle || 'runtime-check.sh')}</span>
        </div>
        <span style="background:rgba(34,197,94,0.16);border:1px solid rgba(34,197,94,0.4);color:#4ade80;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;">
          ${escapeHtml(spec.panelStatus || 'VERIFIED')}
        </span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:rgba(30,41,59,0.75);border:1px solid rgba(148,163,184,0.18);border-radius:12px;padding:12px 14px;">
        <div style="width:38px;height:38px;border-radius:10px;background:rgba(99,102,241,0.2);border:1px solid rgba(129,140,248,0.45);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${getIconSvg('server', '#a5b4fc')}
        </div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#f8fafc;">${escapeHtml(spec.panelTopic || 'Production State')}</div>
          <div style="font-size:11.5px;color:#94a3b8;">${escapeHtml(spec.panelSubtopic || 'Automated runtime verification')}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${linesHtml}
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(148,163,184,0.14);padding-top:14px;font-size:11.5px;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">
    <span>${escapeHtml(spec.footerTag || 'ARCHITECT  /  VERIFY  /  DEPLOY')}</span>
    <span style="text-transform:none;letter-spacing:0;color:#94a3b8;">ghufrannaseer.github.io</span>
  </div>
</body>
</html>`;
}

export async function encodeImageBufferToWebp(page, buffer, mimeType = 'image/png', quality = 0.86) {
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const webpDataUrl = await page.evaluate(async ({ src, q }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 1200;
    canvas.height = img.naturalHeight || 630;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', q);
  }, { src: dataUrl, q: quality });

  const base64 = webpDataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

export async function launchCoverBrowser() {
  const executablePath = findBrowserExecutable();
  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  if (executablePath) {
    launchOpts.executablePath = executablePath;
  }
  return chromium.launch(launchOpts);
}

export async function renderCoverImage(slug, coverSpec) {
  ensureDir(IMAGES_DIR);
  const outputPath = path.join(IMAGES_DIR, `${slug}.webp`);

  const html = coverSpec?.style === 'architecture'
    ? buildArchitectureHtml(coverSpec)
    : buildInfographicHtml(coverSpec || {});

  const browser = await launchCoverBrowser();
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: 'load' });
    const pngBuffer = await page.screenshot({ type: 'png' });
    const webpBuffer = await encodeImageBufferToWebp(page, pngBuffer, 'image/png', 0.86);
    fs.writeFileSync(outputPath, webpBuffer);
    return `blog/images/${slug}.webp`;
  } finally {
    await browser.close();
  }
}
