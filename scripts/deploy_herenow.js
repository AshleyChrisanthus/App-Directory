const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function getApiKey() {
  if (process.env.HERENOW_API_KEY) return process.env.HERENOW_API_KEY.trim();
  const credPath = path.join(os.homedir(), '.herenow', 'credentials');
  if (fs.existsSync(credPath)) {
    return fs.readFileSync(credPath, 'utf8').trim();
  }
  return null;
}

const { updateCacheBusting } = require('./cache_bust.js');

async function deploy(targetSlug = 'smooth-harbor-jsy6') {
  const rootDir = path.resolve(__dirname, '..');
  // Ensure index.html references the latest content hashes for style.css and app.js
  updateCacheBusting(rootDir);

  const apiKey = getApiKey();
  const fileDefs = [
    { path: 'index.html', contentType: 'text/html; charset=utf-8' },
    { path: 'style.css', contentType: 'text/css; charset=utf-8' },
    { path: 'app.js', contentType: 'text/javascript; charset=utf-8' }
  ];

  const filesPayload = [];
  const fileBuffers = {};

  for (const def of fileDefs) {
    const filePath = path.resolve(rootDir, def.path);
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    fileBuffers[def.path] = buffer;
    filesPayload.push({
      path: def.path,
      size: buffer.length,
      contentType: def.contentType,
      hash
    });
  }

  const headers = {
    'content-type': 'application/json',
    'X-HereNow-Client': 'antigravity/deploy-agent'
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const endpoint = targetSlug
    ? `https://here.now/api/v1/publish/${targetSlug}`
    : 'https://here.now/api/v1/publish';
  const method = targetSlug ? 'PUT' : 'POST';

  console.log(`Deploying to here.now (${targetSlug ? 'Updating ' + targetSlug : 'Creating new site'})...`);
  const initRes = await fetch(endpoint, {
    method,
    headers,
    body: JSON.stringify({
      files: filesPayload,
      displayName: 'App Directory',
      displayDescription: 'Modern privacy-first bookmark manager web app'
    })
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Init publish failed (${initRes.status}): ${errText}`);
  }

  const initData = await initRes.json();
  console.log(`Target Slug: ${initData.slug}`);
  console.log(`Live Site URL: ${initData.siteUrl}`);

  const uploadPlan = initData.upload;
  if (!uploadPlan) {
    throw new Error('No upload plan returned from here.now');
  }

  const uploads = uploadPlan.uploads || [];
  const skipped = uploadPlan.skipped || [];

  if (skipped.length > 0) {
    console.log(`Skipped unchanged files: ${skipped.join(', ')}`);
  }

  if (uploads.length > 0) {
    console.log(`Uploading ${uploads.length} changed file(s)...`);
    for (const item of uploads) {
      console.log(`Uploading ${item.path}...`);
      const buffer = fileBuffers[item.path];
      const upRes = await fetch(item.url, {
        method: item.method || 'PUT',
        headers: item.headers || { 'Content-Type': 'application/octet-stream' },
        body: buffer
      });

      if (!upRes.ok) {
        const upErr = await upRes.text();
        throw new Error(`Failed uploading ${item.path}: ${upErr}`);
      }
    }
  } else {
    console.log('All files are identical; nothing new to upload.');
  }

  console.log('Finalizing deployment...');
  const finalizeRes = await fetch(uploadPlan.finalizeUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      versionId: uploadPlan.versionId
    })
  });

  if (!finalizeRes.ok) {
    const finErr = await finalizeRes.text();
    throw new Error(`Finalize failed: ${finErr}`);
  }

  console.log('\n=============================================');
  console.log('🎉 LIVE SITE UPDATED SUCCESSFULLY!');
  console.log(`🌐 Live URL: ${initData.siteUrl}`);
  console.log(`📦 Version: ${uploadPlan.versionId}`);
  console.log('=============================================\n');
}

const targetSlug = process.argv[2] || 'smooth-harbor-jsy6';
deploy(targetSlug).catch(err => {
  console.error('Deployment error:', err);
  process.exit(1);
});
