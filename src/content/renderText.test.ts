import { capitalize, renderText, selectGender } from './renderText';

const names = { firstName: 'Aria', lastName: 'Vale', epithet: 'the Bold' };

describe('renderText', () => {
  const text = '{{He|She|They}} {{was|was|were}} born. {fullName}, {epithet}.';

  it.each([
    ['Male', 'He was born. Aria Vale, the Bold.'],
    ['Female', 'She was born. Aria Vale, the Bold.'],
    ['Non-binary', 'They were born. Aria Vale, the Bold.'],
  ] as const)('renders the %s form', (gender, expected) => {
    expect(renderText(text, gender, names)).toBe(expected);
  });

  it('accepts one full text per gender', () => {
    const perGender = {
      m: 'Il est né à {lastName}.',
      f: 'Elle est née à {lastName}.',
      n: 'Venu au monde à {lastName}.',
    };
    expect(renderText(perGender, 'Female', names)).toBe('Elle est née à Vale.');
    expect(renderText(perGender, 'Non-binary', names)).toBe(
      'Venu au monde à Vale.',
    );
  });

  it('allows names inside a gender form', () => {
    expect(
      renderText(
        '{{Il a grandi|Elle a grandi|{firstName} a grandi}}.',
        'Non-binary',
        names,
      ),
    ).toBe('Aria a grandi.');
  });

  it('capitalizes {Epithet} for titles', () => {
    expect(renderText('{Epithet}', 'Male', names)).toBe('The Bold');
  });

  it('keeps an empty form', () => {
    expect(renderText('né{{||}}', 'Female', names)).toBe('né');
  });

  it('rejects a selection without exactly 3 forms', () => {
    expect(() => renderText('{{il|elle}}', 'Male', names)).toThrow(
      /3 gender forms/,
    );
  });

  it('rejects an unknown placeholder', () => {
    expect(() => renderText('{nickname}', 'Male', names)).toThrow(
      /Unknown placeholder/,
    );
  });
});

describe('selectGender', () => {
  it('leaves name placeholders untouched', () => {
    expect(selectGender('{{Il|Elle|On}} : {firstName}', 'Male')).toBe(
      'Il : {firstName}',
    );
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter only', () => {
    expect(capitalize('le Hardi')).toBe('Le Hardi');
    expect(capitalize('')).toBe('');
  });
});
