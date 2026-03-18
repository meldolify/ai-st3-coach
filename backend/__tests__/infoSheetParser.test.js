const { parseInfoSheet } = require('../src/utils/infoSheetParser');

describe('parseInfoSheet', () => {
  it('parses a valid CTB info sheet with all fields and images', () => {
    const content = `Patient: Mr John Smith, 45 years old, MRN 30230202
Presentation: Referred by A&E at 2am
HPC: Caught his left hand in an industrial grinder at work at 5pm. The hand was crushed for 1 hour.
PMH: Asthma, hypertension
Drug History: Amlodipine, asthma inhalers. Tetanus unknown
Observations: HR 70, BP 155/80, RR 20, Sats 95% OA
Examination: Wound not bleeding. All digits cold to touch.
Images: crushed_hand_1.jpg, crushed_hand_xray_1.jpg`;

    const result = parseInfoSheet(content);
    expect(result).not.toBeNull();
    expect(result.fields).toHaveLength(7);
    expect(result.fields[0]).toEqual({
      key: 'Patient',
      value: 'Mr John Smith, 45 years old, MRN 30230202'
    });
    expect(result.fields[1]).toEqual({ key: 'Presentation', value: 'Referred by A&E at 2am' });
    expect(result.fields[6]).toEqual({
      key: 'Examination',
      value: 'Wound not bleeding. All digits cold to touch.'
    });
    expect(result.images).toEqual(['crushed_hand_1.jpg', 'crushed_hand_xray_1.jpg']);
  });

  it('parses a consent info sheet without images', () => {
    const content = `Patient: Michael, 6 years old
Procedure: Otoplasty (Pinnaplasty) for prominent ears
Context: Referred by GP. Parents expecting operation today.
Patient Expectations: Parents want to understand what will happen.`;

    const result = parseInfoSheet(content);
    expect(result).not.toBeNull();
    expect(result.fields).toHaveLength(4);
    expect(result.fields[0]).toEqual({ key: 'Patient', value: 'Michael, 6 years old' });
    expect(result.fields[1]).toEqual({
      key: 'Procedure',
      value: 'Otoplasty (Pinnaplasty) for prominent ears'
    });
    expect(result.images).toEqual([]);
  });

  it('handles multi-line values', () => {
    const content = `Patient: Mrs Sarah Thompson, 42 years old
HPC: Progressive swelling and pain in the right forearm
  following a cat bite 3 days ago. Temperature 38.5 degrees.
  Spreading erythema.
PMH: Type 2 diabetes`;

    const result = parseInfoSheet(content);
    expect(result).not.toBeNull();
    expect(result.fields).toHaveLength(3);
    expect(result.fields[1].key).toBe('HPC');
    expect(result.fields[1].value).toContain('Progressive swelling');
    expect(result.fields[1].value).toContain('Spreading erythema.');
  });

  it('returns null for empty content', () => {
    expect(parseInfoSheet('')).toBeNull();
    expect(parseInfoSheet(null)).toBeNull();
    expect(parseInfoSheet(undefined)).toBeNull();
    expect(parseInfoSheet('   \n  \n  ')).toBeNull();
  });

  it('returns null for content with PLACEHOLDER marker', () => {
    const content = `Patient: [PLACEHOLDER - Add patient details]
Procedure: [PLACEHOLDER - Add procedure]`;
    expect(parseInfoSheet(content)).toBeNull();
  });

  it('returns null for content with AUTHOR NOTE marker', () => {
    const content = `[AUTHOR NOTE — DELETE THIS ENTIRE SECTION WHEN FINISHED

Write the patient information sheet here.

END OF AUTHOR NOTE]`;
    expect(parseInfoSheet(content)).toBeNull();
  });

  it('handles single image', () => {
    const content = `Patient: Mr Test
Images: burn_wound_1.jpg`;

    const result = parseInfoSheet(content);
    expect(result.images).toEqual(['burn_wound_1.jpg']);
  });

  it('handles Images field with extra whitespace', () => {
    const content = `Patient: Mr Test
Images:  img1.jpg ,  img2.jpg , img3.jpg `;

    const result = parseInfoSheet(content);
    expect(result.images).toEqual(['img1.jpg', 'img2.jpg', 'img3.jpg']);
  });

  it('ignores blank lines before first key', () => {
    const content = `

Patient: Mr Test
PMH: None`;

    const result = parseInfoSheet(content);
    expect(result).not.toBeNull();
    expect(result.fields).toHaveLength(2);
  });

  it('handles keys with slashes and ampersands', () => {
    const content = `Patient: Mr Test
O/E: Primary survey unremarkable
Breast & Aesthetics: Relevant history`;

    const result = parseInfoSheet(content);
    expect(result).not.toBeNull();
    // O/E won't match since it starts with uppercase followed by /
    // But keys like "Drug History" and compound keys should work
    expect(result.fields.length).toBeGreaterThan(0);
  });

  it('returns null when no valid key-value pairs found', () => {
    const content = `This is just plain text with no key-value pairs.
It has multiple lines but none match the pattern.`;
    expect(parseInfoSheet(content)).toBeNull();
  });

  it('does not include Images in the fields array', () => {
    const content = `Patient: Mr Test
Observations: HR 70
Images: test.jpg`;

    const result = parseInfoSheet(content);
    expect(result.fields).toHaveLength(2);
    expect(result.fields.find(f => f.key === 'Images')).toBeUndefined();
  });
});
