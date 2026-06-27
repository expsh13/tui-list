import { describe, expect, it } from "vite-plus/test";
import {
  clampIndex,
  getSelectedIndexAfterRemoval,
  isValidDueDate,
  removeTodoAt,
  setTodoDueDateAt,
  toggleTodoAt,
  type Todo,
} from "./todos";

const todos: Todo[] = [
  { id: 1, text: "one", done: false },
  { id: 2, text: "two", done: false },
  { id: 3, text: "three", done: true },
];

describe("todo state", () => {
  it("clamps selection inside the list", () => {
    expect(clampIndex(-1, todos.length)).toBe(0);
    expect(clampIndex(1, todos.length)).toBe(1);
    expect(clampIndex(3, todos.length)).toBe(2);
  });

  it("toggles a todo", () => {
    expect(toggleTodoAt(todos, 1)[1]?.done).toBe(true);
  });

  it("sets a due date", () => {
    expect(setTodoDueDateAt(todos, 0, "2026-06-27")[0]?.dueDate).toBe("2026-06-27");
  });

  it("validates due dates", () => {
    expect(isValidDueDate("2026-06-27")).toBe(true);
    expect(isValidDueDate("2026-02-30")).toBe(false);
    expect(isValidDueDate("06-27-2026")).toBe(false);
  });

  it("removes a todo and keeps selection valid", () => {
    const nextTodos = removeTodoAt(todos, 2);

    expect(nextTodos).toHaveLength(2);
    expect(getSelectedIndexAfterRemoval(2, todos.length)).toBe(1);
  });
});
