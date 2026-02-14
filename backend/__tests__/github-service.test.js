/**
 * GitHub Service Tests
 * Tests GitHub PR creation with mocked fetch API.
 */

process.env.NODE_ENV = 'test';

// Helper to create a mock fetch that responds to sequential GitHub API calls
function createMockFetch(overrides = {}) {
  const responses = [
    // 1. Get main branch
    { ok: true, json: async () => ({ commit: { sha: 'main-sha-123' } }) },
    // 2. Get main commit (tree SHA)
    { ok: true, json: async () => ({ tree: { sha: 'tree-sha-456' } }) },
    // 3. Create blob (per file — may need multiple)
    { ok: true, json: async () => ({ sha: 'blob-sha-789' }) },
    // 4. Create tree
    { ok: true, json: async () => ({ sha: 'new-tree-sha' }) },
    // 5. Create commit
    { ok: true, json: async () => ({ sha: 'new-commit-sha' }) },
    // 6. Create ref (branch)
    { ok: true, json: async () => ({ ref: 'refs/heads/prompt-lab-updates-test' }) },
    // 7. Create PR
    { ok: true, json: async () => ({ html_url: 'https://github.com/owner/repo/pull/42', number: 42 }) },
  ];

  let callIndex = 0;
  return jest.fn(async () => {
    const idx = callIndex++;
    if (overrides[idx]) return overrides[idx];
    return responses[idx] || { ok: true, json: async () => ({}) };
  });
}

describe('GitHubService - createPR', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token-123';
    process.env.GITHUB_OWNER = 'test-owner';
    process.env.GITHUB_REPO = 'test-repo';
    jest.resetModules();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  test('creates PR successfully and returns prUrl, branchName, filesChanged', async () => {
    global.fetch = createMockFetch();
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'prompts/test.txt', content: 'Test content' }];
    const result = await GitHubService.createPR(files);

    expect(result).toHaveProperty('prUrl');
    expect(result).toHaveProperty('branchName');
    expect(result).toHaveProperty('filesChanged');
    expect(result.prUrl).toBe('https://github.com/owner/repo/pull/42');
    expect(result.filesChanged).toBe(1);
  });

  test('branch name matches prompt-lab-updates-{timestamp} pattern', async () => {
    global.fetch = createMockFetch();
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'prompts/test.txt', content: 'Test' }];
    const result = await GitHubService.createPR(files);

    expect(result.branchName).toMatch(/^prompt-lab-updates-\d+/);
  });

  test('makes 7 sequential API calls for single file', async () => {
    global.fetch = createMockFetch();
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'prompts/test.txt', content: 'Test' }];
    await GitHubService.createPR(files);

    expect(global.fetch).toHaveBeenCalledTimes(7);
  });

  test('creates correct number of blobs for multiple files', async () => {
    // For 3 files: branch + commit + 3 blobs + tree + commit + ref + PR = 9 calls
    const responses = [
      { ok: true, json: async () => ({ commit: { sha: 'sha1' } }) },
      { ok: true, json: async () => ({ tree: { sha: 'sha2' } }) },
      { ok: true, json: async () => ({ sha: 'blob1' }) },
      { ok: true, json: async () => ({ sha: 'blob2' }) },
      { ok: true, json: async () => ({ sha: 'blob3' }) },
      { ok: true, json: async () => ({ sha: 'tree3' }) },
      { ok: true, json: async () => ({ sha: 'commit3' }) },
      { ok: true, json: async () => ({ ref: 'refs/heads/test' }) },
      { ok: true, json: async () => ({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) },
    ];
    let idx = 0;
    global.fetch = jest.fn(async () => responses[idx++]);
    const GitHubService = require('../src/services/GitHubService');

    const files = [
      { path: 'file1.txt', content: 'Content 1' },
      { path: 'file2.txt', content: 'Content 2' },
      { path: 'file3.txt', content: 'Content 3' },
    ];
    const result = await GitHubService.createPR(files);

    expect(result.filesChanged).toBe(3);
    expect(global.fetch).toHaveBeenCalledTimes(9);
  });

  test('sends Authorization header with Bearer token', async () => {
    global.fetch = createMockFetch();
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'test.txt', content: 'Test' }];
    await GitHubService.createPR(files);

    const firstCall = global.fetch.mock.calls[0];
    expect(firstCall[1].headers.Authorization).toBe('Bearer test-token-123');
  });

  test('PR body lists changed files', async () => {
    global.fetch = createMockFetch();
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'prompts/clinical/test.txt', content: 'Test' }];
    await GitHubService.createPR(files);

    // Find the PR creation call (last call)
    const prCall = global.fetch.mock.calls[6];
    const body = JSON.parse(prCall[1].body);
    expect(body.body).toContain('prompts/clinical/test.txt');
    expect(body.base).toBe('main');
  });

  test('throws error when GITHUB_TOKEN not configured', async () => {
    delete process.env.GITHUB_TOKEN;
    jest.resetModules();
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'test.txt', content: 'test' }];
    await expect(GitHubService.createPR(files)).rejects.toThrow(/not configured/);
  });

  test('throws error when GITHUB_OWNER not configured', async () => {
    delete process.env.GITHUB_OWNER;
    jest.resetModules();
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'test.txt', content: 'test' }];
    await expect(GitHubService.createPR(files)).rejects.toThrow(/not configured/);
  });

  test('throws error when files array is empty', async () => {
    global.fetch = createMockFetch();
    const GitHubService = require('../src/services/GitHubService');

    await expect(GitHubService.createPR([])).rejects.toThrow(/No files to commit/);
  });

  test('throws error when files is null', async () => {
    global.fetch = createMockFetch();
    const GitHubService = require('../src/services/GitHubService');

    await expect(GitHubService.createPR(null)).rejects.toThrow(/No files to commit/);
  });

  test('throws error with GitHub API error message on 401', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Bad credentials' }),
    }));
    const GitHubService = require('../src/services/GitHubService');

    const files = [{ path: 'test.txt', content: 'test' }];
    await expect(GitHubService.createPR(files)).rejects.toThrow(/Bad credentials/);
  });
});
