import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import { ROOT_DIR } from './lib/utils.mjs';

dns.setDefaultResultOrder('ipv4first');

function getCandidateVersions() {
  if (process.env.LINKEDIN_API_VERSION) {
    return [process.env.LINKEDIN_API_VERSION];
  }
  const now = new Date();
  const versions = [];
  for (let offset = 1; offset <= 10; offset++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    versions.push(`${y}${m}`);
  }
  return versions;
}

async function waitForLiveUrl(url, maxWaitMs = 45000) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        console.log(`Verified live blog URL is ready: ${url}`);
        return true;
      }
    } catch {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.warn(`Proceeding with LinkedIn publish (Pages deploy still propagating for ${url})`);
  return false;
}

async function resolvePersonUrn(token) {
  if (process.env.LINKEDIN_PERSON_URN) {
    const raw = process.env.LINKEDIN_PERSON_URN.trim();
    return raw.startsWith('urn:li:person:') ? raw : `urn:li:person:${raw}`;
  }

  const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (userInfoRes.ok) {
    const info = await userInfoRes.json();
    if (info?.sub) return `urn:li:person:${info.sub}`;
  }

  const meRes = await fetch('https://api.linkedin.com/v2/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (meRes.ok) {
    const me = await meRes.json();
    if (me?.id) return `urn:li:person:${me.id}`;
  }

  const errText = await userInfoRes.text();
  throw new Error(
    `Unable to resolve LinkedIn person URN (HTTP ${userInfoRes.status}). Ensure token has 'openid' + 'profile' + 'w_member_social' scopes. Response: ${errText}`
  );
}

async function callLinkedInRest(endpoint, token, bodyObj, versions) {
  let lastError = null;
  for (const version of versions) {
    const res = await fetch(`https://api.linkedin.com${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'Linkedin-Version': version,
      },
      body: JSON.stringify(bodyObj),
    });

    const text = await res.text();
    if (res.ok) {
      return {
        version,
        status: res.status,
        restliId: res.headers.get('x-restli-id'),
        data: text ? JSON.parse(text) : {},
      };
    }

    const isVersionError =
      res.status === 426 ||
      /NONEXISTENT_VERSION|VERSION_SUNSET|Invalid version/i.test(text);

    if (isVersionError) {
      console.warn(`LinkedIn-Version ${version} rejected, trying older version...`);
      lastError = new Error(`HTTP ${res.status} (${version}): ${text}`);
      continue;
    }

    throw new Error(`LinkedIn API error HTTP ${res.status} (${endpoint}): ${text}`);
  }
  throw lastError || new Error(`All LinkedIn API versions failed for ${endpoint}`);
}

async function uploadImageToLinkedIn(token, personUrn, pngPath, versions) {
  const initRes = await callLinkedInRest(
    '/rest/images?action=initializeUpload',
    token,
    { initializeUploadRequest: { owner: personUrn } },
    versions
  );

  const uploadUrl = initRes?.data?.value?.uploadUrl;
  const imageUrn = initRes?.data?.value?.image;
  if (!uploadUrl || !imageUrn) {
    throw new Error(`Unexpected initializeUpload response: ${JSON.stringify(initRes.data)}`);
  }

  const pngBuffer = fs.readFileSync(pngPath);
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/png',
    },
    body: pngBuffer,
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`LinkedIn image binary PUT failed HTTP ${putRes.status}: ${errText}`);
  }

  console.log(`Uploaded cover image to LinkedIn: ${imageUrn}`);
  return { imageUrn, activeVersion: initRes.version };
}

function buildCommentary(linkedinPost, blogUrl) {
  const base = (linkedinPost || '').trim();
  const linkBlock = `\n\nRead the full technical deep dive:\n${blogUrl}`;

  // Insert the link right before trailing hashtags if hashtags are at the end
  const hashtagMatch = base.match(/(\n+#[A-Za-z0-9_]+(?:\s+#[A-Za-z0-9_]+)*)\s*$/);
  let combined;
  if (hashtagMatch) {
    const bodyWithoutTags = base.slice(0, hashtagMatch.index).trimEnd();
    const tags = hashtagMatch[1].trim();
    combined = `${bodyWithoutTags}${linkBlock}\n\n${tags}`;
  } else {
    combined = `${base}${linkBlock}`;
  }

  if (combined.length > 2950) {
    combined = combined.slice(0, 2947) + '...';
  }
  return combined;
}

async function main() {
  const token = (process.env.LINKEDIN_ACCESS_TOKEN || '').trim();
  if (!token) {
    console.log('LINKEDIN_ACCESS_TOKEN not configured; skipping LinkedIn publish.');
    return;
  }

  const metaPath = path.join(ROOT_DIR, '.last-commit-meta.json');
  if (!fs.existsSync(metaPath)) {
    throw new Error('Missing .last-commit-meta.json. Run npm run generate first.');
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const pngPath = path.join(ROOT_DIR, meta.linkedinCoverPngPath || '.linkedin-cover.png');
  const versions = getCandidateVersions();

  await waitForLiveUrl(meta.blogUrl, 45000);

  const personUrn = await resolvePersonUrn(token);
  console.log(`Authenticated LinkedIn author: ${personUrn}`);

  let contentPayload = undefined;
  let activeVersions = versions;
  if (fs.existsSync(pngPath)) {
    const uploaded = await uploadImageToLinkedIn(token, personUrn, pngPath, versions);
    activeVersions = [uploaded.activeVersion, ...versions];
    contentPayload = {
      media: {
        title: meta.title.slice(0, 120),
        id: uploaded.imageUrn,
      },
    };
  } else {
    console.warn(`Temp PNG not found at ${pngPath}, falling back to article link card.`);
    contentPayload = {
      article: {
        source: meta.blogUrl,
        title: meta.title.slice(0, 120),
      },
    };
  }

  const commentary = buildCommentary(meta.linkedinPost, meta.blogUrl);

  const postBody = {
    author: personUrn,
    commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    content: contentPayload,
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const result = await callLinkedInRest('/rest/posts', token, postBody, activeVersions);
  console.log(`Published to LinkedIn! Post ID: ${result.restliId || 'created'} (API v${result.version})`);
}

main().catch((err) => {
  console.error('LinkedIn publishing failed:', err.message);
  process.exit(1);
});
