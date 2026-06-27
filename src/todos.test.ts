import { describe, expect, it } from "vite-plus/test";
import {
  clampIndex,
  getCalendarDays,
  getSelectedIndexAfterRemoval,
  isValidDueDate,
  moveDueDateByDays,
  moveDueDateByMonths,
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

  it("moves due dates through the calendar", () => {
    expect(moveDueDateByDays("2026-06-27", 7)).toBe("2026-07-04");
    expect(moveDueDateByMonths("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("builds a six-week calendar grid", () => {
    const days = getCalendarDays("2026-06-27");

    expect(days).toHaveLength(42);
    expect(days[0]?.date).toBe("2026-05-31");
    expect(days[27]?.date).toBe("2026-06-27");
  });

  it("removes a todo and keeps selection valid", () => {
    const nextTodos = removeTodoAt(todos, 2);

    expect(nextTodos).toHaveLength(2);
    expect(getSelectedIndexAfterRemoval(2, todos.length)).toBe(1);
  });
});
