const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function computeFileHash(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function updateCacheBusting(rootDir = path.resolve(__dirname, '..')) {
  const indexPath = path.join(rootDir, 'index.html');
  const stylePath = path.join(rootDir, 'style.css');
  const appPath = path.join(rootDir, 'app.js');

  if (!fs.existsSync(indexPath)) {
    throw new Error(`index.html not found in: ${rootDir}`);
  }

  const styleHash = computeFileHash(stylePath);
  const appHash = computeFileHash(appPath);

  let indexContent = fs.readFileSync(indexPath, 'utf8');
  let hasChanges = false;

  // Replace style.css with style.css?v=<hash>
  const styleRegex = /href=["']style\.css(?:\?v=[^"']+)?["']/i;
  const newStyleRef = `href="style.css?v=${styleHash}"`;
  const currentStyleMatch = indexContent.match(styleRegex);

  if (currentStyleMatch && currentStyleMatch[0] !== newStyleRef) {
    indexContent = indexContent.replace(styleRegex, newStyleRef);
    hasChanges = true;
    console.log(`[Cache-Bust] Updated style.css version -> ${styleHash}`);
  } else {
    console.log(`[Cache-Bust] style.css unchanged (${styleHash})`);
  }

  // Replace app.js with app.js?v=<hash>
  const appRegex = /src=["']app\.js(?:\?v=[^"']+)?["']/i;
  const newAppRef = `src="app.js?v=${appHash}"`;
  const currentAppMatch = indexContent.match(appRegex);

  if (currentAppMatch && currentAppMatch[0] !== newAppRef) {
    indexContent = indexContent.replace(appRegex, newAppRef);
    hasChanges = true;
    console.log(`[Cache-Bust] Updated app.js version -> ${appHash}`);
  } else {
    console.log(`[Cache-Bust] app.js unchanged (${appHash})`);
  }

  // Also update sw.js CACHE_NAME so service worker updates on deploy
  const swPath = path.join(rootDir, 'sw.js');
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    const swCacheRegex = /const CACHE_NAME = ['"][^'"]+['"];/;
    const newSwCache = `const CACHE_NAME = 'app-directory-${styleHash}-${appHash}';`;
    if (swCacheRegex.test(swContent) && !swContent.includes(newSwCache)) {
      swContent = swContent.replace(swCacheRegex, newSwCache);
      fs.writeFileSync(swPath, swContent, 'utf8');
      console.log(`[Cache-Bust] Updated sw.js CACHE_NAME -> app-directory-${styleHash}-${appHash}`);
    }
  }

  if (hasChanges) {
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('[Cache-Bust] Saved changes to index.html');
  } else {
    console.log('[Cache-Bust] index.html already up to date; no changes needed.');
  }

  return { hasChanges, styleHash, appHash };
}

if (require.main === module) {
  try {
    updateCacheBusting();
  } catch (err) {
    console.error('[Cache-Bust] Error:', err.message);
    process.exit(1);
  }
}

module.exports = { computeFileHash, updateCacheBusting };
