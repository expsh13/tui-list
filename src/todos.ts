export type Todo = {
  id: number;
  text: string;
  done: boolean;
  dueDate?: string;
};

export const clampIndex = (value: number, length: number) => {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(value, 0), length - 1);
};

export const toggleTodoAt = (todos: Todo[], index: number) =>
  todos.map((todo, todoIndex) => (todoIndex === index ? { ...todo, done: !todo.done } : todo));

export const setTodoDueDateAt = (todos: Todo[], index: number, dueDate?: string) =>
  todos.map((todo, todoIndex) => (todoIndex === index ? { ...todo, dueDate } : todo));

export const removeTodoAt = (todos: Todo[], index: number) =>
  todos.filter((_, todoIndex) => todoIndex !== index);

export const getSelectedIndexAfterRemoval = (selectedIndex: number, todoCount: number) =>
  clampIndex(selectedIndex, todoCount - 1);

export const isValidDueDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};
