import { describe, expect, it } from "vite-plus/test";
import { deserializeTodos } from "./storage";

describe("todo storage", () => {
  it("deserializes valid todos", () => {
    expect(
      deserializeTodos(
        JSON.stringify([{ id: 1, text: "persisted", done: false, dueDate: "2026-06-27" }]),
      ),
    ).toEqual([{ id: 1, text: "persisted", done: false, dueDate: "2026-06-27" }]);
  });

  it("drops invalid todos", () => {
    expect(
      deserializeTodos(
        JSON.stringify([
          { id: 1, text: "valid", done: false },
          { id: 2, text: "invalid date", done: false, dueDate: "2026-02-30" },
        ]),
      ),
    ).toEqual([{ id: 1, text: "valid", done: false }]);
  });

  it("rejects non-list data", () => {
    expect(deserializeTodos(JSON.stringify({ id: 1 }))).toBeUndefined();
  });
});
