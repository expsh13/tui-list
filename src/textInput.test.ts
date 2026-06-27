import { describe, expect, it } from "vite-plus/test";
import { getTextLength, insertTextAt, removeTextAt, removeTextBefore } from "./textInput";

describe("text input", () => {
  it("inserts Japanese text at the cursor", () => {
    expect(insertTextAt("今日は", 2, "本")).toBe("今日本は");
  });

  it("removes Japanese text before the cursor", () => {
    expect(removeTextBefore("日本語", 2)).toBe("日語");
  });

  it("removes Japanese text at the cursor", () => {
    expect(removeTextAt("日本語", 1)).toBe("日語");
  });

  it("counts Japanese text as user-visible characters", () => {
    expect(getTextLength("日本語")).toBe(3);
  });
});
