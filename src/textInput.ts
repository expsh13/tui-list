const segmenter =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("ja", { granularity: "grapheme" })
    : undefined;

export const getGraphemes = (value: string) =>
  segmenter ? [...segmenter.segment(value)].map((segment) => segment.segment) : Array.from(value);

export const getTextLength = (value: string) => getGraphemes(value).length;

export const clampTextCursor = (cursor: number, value: string) =>
  Math.min(Math.max(cursor, 0), getTextLength(value));

export const insertTextAt = (value: string, cursor: number, input: string) => {
  const graphemes = getGraphemes(value);
  const nextCursor = clampTextCursor(cursor, value);

  graphemes.splice(nextCursor, 0, input);

  return graphemes.join("");
};

export const removeTextBefore = (value: string, cursor: number) => {
  const graphemes = getGraphemes(value);
  const nextCursor = clampTextCursor(cursor, value);

  if (nextCursor === 0) {
    return value;
  }

  graphemes.splice(nextCursor - 1, 1);

  return graphemes.join("");
};

export const removeTextAt = (value: string, cursor: number) => {
  const graphemes = getGraphemes(value);
  const nextCursor = clampTextCursor(cursor, value);

  graphemes.splice(nextCursor, 1);

  return graphemes.join("");
};

export const getTextBeforeLineBreak = (value: string) => value.split(/\r|\n/)[0] ?? "";
