const crypto = require('crypto');
const { Octokit } = require('@octokit/rest');
const env = require('../config/env');

const ALGORITHM = 'aes-256-cbc';

function getKey() {
  return crypto.createHash('sha256').update(env.encryptionKey).digest();
}

function encryptToken(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptToken(ciphertext) {
  const key = getKey();
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function createOctokit(token) {
  return new Octokit({ auth: token });
}

async function verifyToken(token) {
  const octokit = createOctokit(token);
  await octokit.rest.users.getAuthenticated();
}

async function createIssue(conn, { title, body }) {
  const token = decryptToken(conn.encryptedToken);
  const octokit = createOctokit(token);
  const { data } = await octokit.rest.issues.create({
    owner: conn.repoOwner,
    repo: conn.repoName,
    title,
    body,
  });
  return data.number;
}

async function commentOnIssue(conn, issueNumber, body) {
  const token = decryptToken(conn.encryptedToken);
  const octokit = createOctokit(token);
  await octokit.rest.issues.createComment({
    owner: conn.repoOwner,
    repo: conn.repoName,
    issue_number: issueNumber,
    body,
  });
}

module.exports = { encryptToken, decryptToken, verifyToken, createIssue, commentOnIssue };
