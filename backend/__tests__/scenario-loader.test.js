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
      'clinical',
      'emergencies',
      'necrotising_fasciitis',
      'easy_clinical_necrotising_fasciitis_1.txt'
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('prompt file has content', () => {
    const filePath = path.join(
      promptsDir,
      'clinical',
      'emergencies',
      'necrotising_fasciitis',
      'easy_clinical_necrotising_fasciitis_1.txt'
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
    const validPath = 'clinical/emergencies/necrotising_fasciitis/easy_clinical_necrotising_fasciitis_1.txt';
    const fullPath = path.join(promptsDir, validPath);
    const normalizedPath = path.normalize(fullPath);
    expect(normalizedPath.startsWith(promptsDir)).toBe(true);
  });

  test('can read all prompt files without errors', () => {
    const clinicalDir = path.join(promptsDir, 'clinical');
    if (fs.existsSync(clinicalDir)) {
      const subheadings = fs.readdirSync(clinicalDir);
      let totalFiles = 0;

      subheadings.forEach(subheading => {
        const subheadingPath = path.join(clinicalDir, subheading);
        if (fs.statSync(subheadingPath).isDirectory()) {
          const topics = fs.readdirSync(subheadingPath);
          topics.forEach(topic => {
            const topicPath = path.join(subheadingPath, topic);
            if (fs.statSync(topicPath).isDirectory()) {
              const files = fs.readdirSync(topicPath).filter(f => f.endsWith('.txt'));
              totalFiles += files.length;
            }
          });
        }
      });

      expect(totalFiles).toBeGreaterThan(0);
      console.log(`Found ${totalFiles} prompt files in clinical`);
    }
  });

  test('new hierarchy structure has correct folders', () => {
    // Check main headings exist
    expect(fs.existsSync(path.join(promptsDir, 'clinical'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'call_the_boss'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'consent'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'structured_interview'))).toBe(true);
  });

  test('clinical subheadings exist', () => {
    const clinicalDir = path.join(promptsDir, 'clinical');
    const expectedSubheadings = [
      'breast_and_aesthetic',
      'burns',
      'elective_hand',
      'emergencies',
      'hand_trauma',
      'lower_limb',
      'skin_cancer',
      'head_and_neck',
      'congenital',
      'microsurgery'
    ];

    expectedSubheadings.forEach(subheading => {
      expect(fs.existsSync(path.join(clinicalDir, subheading))).toBe(true);
    });
  });
});
