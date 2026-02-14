/**
 * GitHub Service
 * Creates Pull Requests via the GitHub REST API using native fetch.
 * No additional npm dependencies required (Node 18+ has native fetch).
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_API = 'https://api.github.com';

/**
 * Make an authenticated GitHub API request.
 */
async function githubFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || `GitHub API error: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/**
 * Create a Pull Request containing the given file changes.
 *
 * @param {Array<{path: string, content: string}>} files - Files to include in the PR
 *   Each file has a `path` relative to the repo root (e.g., "prompts/clinical/...")
 *   and `content` as the full file text.
 * @returns {Promise<{prUrl: string, branchName: string, filesChanged: number}>}
 */
async function createPR(files) {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub integration not configured (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO required)');
  }

  if (!files || files.length === 0) {
    throw new Error('No files to commit');
  }

  const repo = `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

  // 1. Get main branch HEAD commit
  const mainBranch = await githubFetch(`${repo}/branches/main`);
  const mainCommitSha = mainBranch.commit.sha;

  // 2. Get the commit's tree SHA
  const mainCommit = await githubFetch(`${repo}/git/commits/${mainCommitSha}`);
  const baseTreeSha = mainCommit.tree.sha;

  // 3. Create blobs for each changed file
  const treeItems = [];
  for (const file of files) {
    const blob = await githubFetch(`${repo}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: file.content,
        encoding: 'utf-8',
      }),
    });
    treeItems.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
  }

  // 4. Create a new tree
  const newTree = await githubFetch(`${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems,
    }),
  });

  // 5. Create the commit
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').substring(0, 15);
  const commitMessage = `Prompt Lab: Update ${files.length} prompt file${files.length > 1 ? 's' : ''}\n\nFiles changed:\n${files.map(f => `- ${f.path}`).join('\n')}`;

  const newCommit = await githubFetch(`${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: commitMessage,
      tree: newTree.sha,
      parents: [mainCommitSha],
    }),
  });

  // 6. Create a new branch
  const branchName = `prompt-lab-updates-${timestamp}`;
  await githubFetch(`${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: newCommit.sha,
    }),
  });

  // 7. Create the Pull Request
  const fileList = files.map(f => `- \`${f.path}\``).join('\n');
  const pr = await githubFetch(`${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title: `Prompt Lab: Update ${files.length} prompt file${files.length > 1 ? 's' : ''}`,
      body: `## Prompt Lab Updates\n\nAutomatically generated from the Prompt Lab editor.\n\n### Files changed (${files.length})\n${fileList}`,
      head: branchName,
      base: 'main',
    }),
  });

  console.log(`[GITHUB] PR created: ${pr.html_url}`);

  return {
    prUrl: pr.html_url,
    branchName,
    filesChanged: files.length,
  };
}

module.exports = { createPR };
