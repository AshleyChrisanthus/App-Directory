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
  const styleRegex = /href=["']style\.css(?:\?v=[a-f0-9]+)?["']/i;
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
  const appRegex = /src=["']app\.js(?:\?v=[a-f0-9]+)?["']/i;
  const newAppRef = `src="app.js?v=${appHash}"`;
  const currentAppMatch = indexContent.match(appRegex);

  if (currentAppMatch && currentAppMatch[0] !== newAppRef) {
    indexContent = indexContent.replace(appRegex, newAppRef);
    hasChanges = true;
    console.log(`[Cache-Bust] Updated app.js version -> ${appHash}`);
  } else {
    console.log(`[Cache-Bust] app.js unchanged (${appHash})`);
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
