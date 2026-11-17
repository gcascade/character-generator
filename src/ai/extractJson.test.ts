import { extractJson } from './extractJson';

describe('extractJson', () => {
  it('parses a plain JSON answer', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses the content of a single fenced code block', () => {
    expect(extractJson('Here you go:\n```json\n{"a":1}\n```\nEnjoy!')).toEqual({
      a: 1,
    });
  });

  it('parses the object between the first { and the last }', () => {
    expect(extractJson('Sure! {"a":{"b":2}} Hope it helps.')).toEqual({
      a: { b: 2 },
    });
  });

  it('returns undefined for text without JSON', () => {
    expect(extractJson('I cannot help with that.')).toBeUndefined();
  });

  it('returns undefined when several code blocks make it ambiguous', () => {
    expect(
      extractJson('```json\n{"a":1}\n```\nor\n```json\n{"a":2}\n```'),
    ).toBeUndefined();
  });

  it('returns undefined for broken JSON', () => {
    expect(extractJson('{"a": 1,,}')).toBeUndefined();
  });
});
