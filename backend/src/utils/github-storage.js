// ═══════════════════════════════════════════════════════════════
// HexaShield Security — GitHub-Based File Storage
// ═══════════════════════════════════════════════════════════════
// Reports stored in a private GitHub repo via Contents API.
// Falls back to local filesystem if GITHUB_STORAGE_TOKEN is not set.
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const GITHUB_OWNER = process.env.GITHUB_STORAGE_OWNER;
const GITHUB_REPO = process.env.GITHUB_STORAGE_REPO;
const GITHUB_TOKEN = process.env.GITHUB_STORAGE_TOKEN;
const GITHUB_BRANCH = process.env.GITHUB_STORAGE_BRANCH || 'main';

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const USE_LOCAL = !GITHUB_TOKEN;

const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

/**
 * Common headers for GitHub API requests
 */
function githubHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'HexaShield-Backend/1.0',
  };
}

/**
 * Get the SHA of an existing file in the repo (needed for updates/deletes)
 */
async function getFileSha(filePath) {
  const url = `${GITHUB_API_BASE}/${filePath}?ref=${GITHUB_BRANCH}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: githubHeaders(),
  });

  if (response.ok) {
    const data = await response.json();
    return data.sha;
  }
  return null;
}

/**
 * Upload a file to GitHub repo or local filesystem
 * @param {string} filePath - Path within storage (e.g., reports/orgId/engId/file.pdf)
 * @param {Buffer} fileBuffer - File contents
 * @param {string} contentType - MIME type (stored in commit message for reference)
 * @returns {Object} { storageKey, url }
 */
async function uploadFile(filePath, fileBuffer, contentType) {
  if (USE_LOCAL) {
    return uploadLocal(filePath, fileBuffer);
  }
  return uploadToGitHub(filePath, fileBuffer, contentType);
}

async function uploadToGitHub(filePath, fileBuffer, contentType) {
  const url = `${GITHUB_API_BASE}/${filePath}`;
  const content = fileBuffer.toString('base64');

  const sha = await getFileSha(filePath);

  const body = {
    message: `Upload report: ${filePath} (${contentType})`,
    content,
    branch: GITHUB_BRANCH,
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`GitHub upload failed: ${response.status} - ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    storageKey: filePath,
    url: data.content?.html_url || null,
  };
}

function uploadLocal(filePath, fileBuffer) {
  const fullPath = path.join(LOCAL_UPLOAD_DIR, filePath);
  const dir = path.dirname(fullPath);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, fileBuffer);

  return {
    storageKey: filePath,
    url: null,
  };
}

/**
 * Download a file from GitHub repo or local filesystem
 * @param {string} filePath - Path within storage
 * @returns {Buffer} file contents
 */
async function downloadFile(filePath) {
  if (USE_LOCAL) {
    return downloadLocal(filePath);
  }
  return downloadFromGitHub(filePath);
}

async function downloadFromGitHub(filePath) {
  const url = `${GITHUB_API_BASE}/${filePath}?ref=${GITHUB_BRANCH}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...githubHeaders(),
      Accept: 'application/vnd.github.v3.raw',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`GitHub download failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function downloadLocal(filePath) {
  const fullPath = path.join(LOCAL_UPLOAD_DIR, filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.readFileSync(fullPath);
}

/**
 * Delete a file from GitHub repo or local filesystem
 * @param {string} filePath - Path within storage
 */
async function deleteFile(filePath) {
  if (USE_LOCAL) {
    return deleteLocal(filePath);
  }
  return deleteFromGitHub(filePath);
}

async function deleteFromGitHub(filePath) {
  const sha = await getFileSha(filePath);
  if (!sha) {
    throw new Error(`File not found for deletion: ${filePath}`);
  }

  const url = `${GITHUB_API_BASE}/${filePath}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: githubHeaders(),
    body: JSON.stringify({
      message: `Delete report: ${filePath}`,
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub delete failed: ${response.status}`);
  }
}

function deleteLocal(filePath) {
  const fullPath = path.join(LOCAL_UPLOAD_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/**
 * Get direct URL for a file (only useful for public repos)
 * For private repos, always use downloadFile and proxy
 */
function getFileUrl(filePath) {
  if (USE_LOCAL) {
    return null;
  }
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
}

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile,
  getFileUrl,
};
