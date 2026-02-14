/**
 * Config sync tests
 * Verifies FREE_TIER_SCENARIOS stays in sync between:
 *   - backend/src/config/index.js
 *   - frontend/config.js
 *   - e2e-tests/fixtures/mock-data.ts
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('FREE_TIER_SCENARIOS config sync', () => {
  let backendScenarios;
  let frontendScenarios;
  let e2ePromptFiles;

  beforeAll(() => {
    // --- Backend config ---
    // Save and mock env so config module loads without side effects
    const savedEnv = { ...process.env };
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    process.env = {
      PATH: savedEnv.PATH,
      SystemRoot: savedEnv.SystemRoot,
      NODE_ENV: 'test',
      OPENAI_API_KEY: 'test-key'
    };
    const backendConfig = require('../src/config');
    backendScenarios = backendConfig.FREE_TIER_SCENARIOS;
    process.env = savedEnv;

    // --- Frontend config ---
    const frontendConfigPath = path.resolve(__dirname, '../../frontend/config.js');
    const frontendSource = fs.readFileSync(frontendConfigPath, 'utf-8');

    // Run frontend config.js in a sandboxed context with browser globals stubbed.
    // Replace 'const CONFIG' with 'var CONFIG' so it attaches to the sandbox global.
    const runnableSource = frontendSource.replace(/^const CONFIG\b/m, 'var CONFIG');
    const sandbox = {
      window: { location: { hostname: 'localhost', protocol: 'http:' } },
      console: { log: () => {}, warn: () => {} }
    };
    vm.createContext(sandbox);
    vm.runInContext(runnableSource, sandbox);
    frontendScenarios = sandbox.CONFIG.FREE_TIER_SCENARIOS;

    // --- E2E mock-data ---
    const mockDataPath = path.resolve(__dirname, '../../e2e-tests/fixtures/mock-data.ts');
    const mockDataSource = fs.readFileSync(mockDataPath, 'utf-8');

    // Extract only the FREE_SCENARIOS block (stop at 'as const')
    const freeBlock = mockDataSource.match(
      /export const FREE_SCENARIOS\s*=\s*\{([\s\S]*?)\}\s*as\s+const/
    );
    const freeBlockText = freeBlock ? freeBlock[1] : '';

    // Extract promptFile values from the FREE_SCENARIOS block only
    const promptFileRegex = /promptFile:\s*'([^']+)'/g;
    e2ePromptFiles = [];
    let match;
    while ((match = promptFileRegex.exec(freeBlockText)) !== null) {
      e2ePromptFiles.push(match[1]);
    }
  });

  test('backend config has FREE_TIER_SCENARIOS defined as a non-empty array', () => {
    expect(Array.isArray(backendScenarios)).toBe(true);
    expect(backendScenarios.length).toBeGreaterThanOrEqual(1);
  });

  test('frontend config has FREE_TIER_SCENARIOS defined as a non-empty array', () => {
    expect(Array.isArray(frontendScenarios)).toBe(true);
    expect(frontendScenarios.length).toBeGreaterThanOrEqual(1);
  });

  test('frontend and backend FREE_TIER_SCENARIOS match exactly', () => {
    const backendSorted = [...backendScenarios].sort();
    const frontendSorted = [...frontendScenarios].sort();

    expect(frontendSorted).toEqual(backendSorted);
  });

  test('E2E mock-data FREE_SCENARIOS promptFiles all exist in backend FREE_TIER_SCENARIOS', () => {
    // Ensure we actually extracted some paths
    expect(e2ePromptFiles.length).toBeGreaterThanOrEqual(1);

    const missing = e2ePromptFiles.filter(pf => !backendScenarios.includes(pf));

    expect(missing).toEqual([]);
  });
});
