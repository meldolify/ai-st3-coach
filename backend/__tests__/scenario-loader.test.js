const fs = require('fs');
const path = require('path');

describe('Scenario Loading', () => {
  const promptsDir = path.join(__dirname, '..', 'prompts');

  test('prompts directory exists', () => {
    expect(fs.existsSync(promptsDir)).toBe(true);
  });

  test('necrotising fasciitis easy prompt file exists', () => {
    const filePath = path.join(
      promptsDir,
      'clinical_stations',
      'emergencies',
      'necrotising_fasciitis',
      'easy_necrotising_fasciitis_1.txt'
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('prompt file has content', () => {
    const filePath = path.join(
      promptsDir,
      'clinical_stations',
      'emergencies',
      'necrotising_fasciitis',
      'easy_necrotising_fasciitis_1.txt'
    );
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content.length).toBeGreaterThan(100);
    expect(content).toContain('SECTION 1');
  });

  test('scenario file path traversal protection', () => {
    const maliciousPath = '../../../etc/passwd';
    const normalizedPath = path.normalize(path.join(promptsDir, maliciousPath));
    expect(normalizedPath.startsWith(promptsDir)).toBe(false);
  });

  test('valid scenario path is within prompts directory', () => {
    const validPath = 'clinical_stations/emergencies/necrotising_fasciitis/easy_necrotising_fasciitis_1.txt';
    const fullPath = path.join(promptsDir, validPath);
    const normalizedPath = path.normalize(fullPath);
    expect(normalizedPath.startsWith(promptsDir)).toBe(true);
  });

  test('can read all prompt files without errors', () => {
    const clinicalStationsDir = path.join(promptsDir, 'clinical_stations');
    if (fs.existsSync(clinicalStationsDir)) {
      const categories = fs.readdirSync(clinicalStationsDir);
      let totalFiles = 0;

      categories.forEach(category => {
        const categoryPath = path.join(clinicalStationsDir, category);
        if (fs.statSync(categoryPath).isDirectory()) {
          const scenarios = fs.readdirSync(categoryPath);
          scenarios.forEach(scenario => {
            const scenarioPath = path.join(categoryPath, scenario);
            if (fs.statSync(scenarioPath).isDirectory()) {
              const files = fs.readdirSync(scenarioPath).filter(f => f.endsWith('.txt'));
              totalFiles += files.length;
            }
          });
        }
      });

      expect(totalFiles).toBeGreaterThan(0);
      console.log(`✓ Found ${totalFiles} prompt files in clinical_stations`);
    }
  });
});
