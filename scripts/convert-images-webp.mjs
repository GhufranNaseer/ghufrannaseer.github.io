import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, readPosts, writePosts } from './lib/utils.mjs';
import { encodeImageBufferToWebp, launchCoverBrowser } from './render-cover.mjs';
import { buildAllBlogPages } from './build-blog.mjs';

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/png';
}

async function main() {
  const posts = readPosts();
  const browser = await launchCoverBrowser();
  let totalBefore = 0;
  let totalAfter = 0;

  try {
    const page = await browser.newPage();

    for (const post of posts) {
      if (!post.coverImage || !post.coverImage.startsWith('blog/images/')) continue;
      if (post.coverImage.endsWith('.webp')) {
        const p = path.join(ROOT_DIR, post.coverImage);
        if (fs.existsSync(p)) {
          const sz = fs.statSync(p).size;
          totalBefore += sz;
          totalAfter += sz;
        }
        continue;
      }

      const oldRel = post.coverImage;
      const oldAbs = path.join(ROOT_DIR, oldRel);
      if (!fs.existsSync(oldAbs)) continue;

      const oldBuf = fs.readFileSync(oldAbs);
      totalBefore += oldBuf.length;

      const webpRel = oldRel.replace(/\.(png|jpe?g)$/i, '.webp');
      const webpAbs = path.join(ROOT_DIR, webpRel);

      const webpBuf = await encodeImageBufferToWebp(page, oldBuf, getMimeType(oldAbs), 0.86);
      fs.writeFileSync(webpAbs, webpBuf);
      totalAfter += webpBuf.length;

      if (oldAbs !== webpAbs && fs.existsSync(oldAbs)) {
        fs.unlinkSync(oldAbs);
      }

      post.coverImage = webpRel;
      console.log(`Converted ${path.basename(oldRel)} (${Math.round(oldBuf.length / 1024)} KB) -> ${path.basename(webpRel)} (${Math.round(webpBuf.length / 1024)} KB)`);
    }
  } finally {
    await browser.close();
  }

  writePosts(posts);
  buildAllBlogPages();
  console.log(`Total image size: ${Math.round(totalBefore / 1024)} KB -> ${Math.round(totalAfter / 1024)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
