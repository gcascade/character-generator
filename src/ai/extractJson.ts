const tryParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const FENCE = /```(?:json)?\s*([\s\S]*?)```/gi;

/**
 * Finds the JSON object in a model answer: the whole text, else the content of a
 * single fenced code block, else the text between the first `{` and the last `}`.
 * Returns `undefined` when no unambiguous object is found.
 */
export const extractJson = (text: string): unknown => {
  const trimmed = text.trim();
  const whole = tryParse(trimmed);
  if (whole !== undefined) return whole;

  const fences = [...trimmed.matchAll(FENCE)];
  if (fences.length === 1) {
    const fenced = tryParse(fences[0][1].trim());
    if (fenced !== undefined) return fenced;
  }
  if (fences.length > 1) return undefined;

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end <= start) return undefined;
  return tryParse(trimmed.slice(start, end + 1));
};
