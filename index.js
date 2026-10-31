const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const axios = require('axios');

const REPO_OWNER = 'babaralis180588-lang';
const REPO_NAME = 'ali-files';
const BRANCH = 'main';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const downloadUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/zipball/${BRANCH}`;
const zipPath = path.join(__dirname, 'repo.zip');
const extractPath = path.join(__dirname, 'repo_extracted');

async function main() {
  try {
    console.log('📥 Repository download kar raha hu...');
    await downloadRepo();

    console.log('📦 Zip extract kar raha hu with adm-zip...');
    await extractZipWithAdmZip();

    console.log('🔍 Root directory mein index.js dhoond raha hu...');
    const rootIndexPath = findRootIndexJs(extractPath);

    if (rootIndexPath) {
      console.log(`▶️  Root index.js run kar raha hu: ${rootIndexPath}`);
      runIndexJs(rootIndexPath);
    } else {
      console.log('❌ Root directory mein index.js nahi mila!');
      console.log('📂 Checking if there are any subdirectories with index.js...');

      const alternativeIndex = findAlternativeIndexJs(extractPath);
      if (alternativeIndex) {
        console.log(`⚠️  Alternative index.js found in subdirectory: ${alternativeIndex}`);
        console.log('❌ But we need root index.js, not from data/ folder!');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function downloadRepo() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ali-md-mini-loader'
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;

  const response = await axios({
    method: 'get',
    url: downloadUrl,
    responseType: 'arraybuffer',
    headers
  });

  fs.writeFileSync(zipPath, response.data);
  console.log('✅ Repository downloaded successfully!');
}

async function extractZipWithAdmZip() {
  if (fs.existsSync(extractPath)) {
    fs.rmSync(extractPath, { recursive: true, force: true });
  }
  fs.mkdirSync(extractPath, { recursive: true });

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);

  fs.unlinkSync(zipPath);
  console.log('✅ Zip extracted successfully!');
}

function findRootIndexJs(dir) {
  const files = fs.readdirSync(dir);

  let rootFolder = dir;
  const subDirs = files.filter(file => {
    const fullPath = path.join(dir, file);
    return fs.statSync(fullPath).isDirectory();
  });

  if (subDirs.length === 1) {
    rootFolder = path.join(dir, subDirs[0]);
    console.log(`📁 Found GitHub root folder: ${subDirs[0]}`);
  }

  const rootFiles = fs.readdirSync(rootFolder);

  for (const file of rootFiles) {
    const fullPath = path.join(rootFolder, file);
    const stat = fs.statSync(fullPath);

    if (!stat.isDirectory() && file === 'index.js') {
      console.log(`✅ Found root index.js at: ${fullPath}`);
      return fullPath;
    }
  }

  console.log('❌ No index.js found in root directory');
  return null;
}

function findAlternativeIndexJs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'data') continue;
    const sub = path.join(dir, entry.name);
    const candidate = path.join(sub, 'index.js');
    if (fs.existsSync(candidate)) return candidate;
    const deeper = findAlternativeIndexJs(sub);
    if (deeper) return deeper;
  }
  return null;
}

function runIndexJs(indexPath) {
  const cwd = path.dirname(indexPath);
  console.log(`🚀 Running: node ${indexPath}`);
  const child = exec(`node "${indexPath}"`, { cwd });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('exit', (code) => {
    console.log(`⚠️ Bot process exited with code ${code}, restarting in 5s...`);
    setTimeout(() => runIndexJs(indexPath), 5000);
  });
}

main();
