export type Todo = {
  id: number;
  text: string;
  done: boolean;
  dueDate?: string;
};

export type CalendarDay = {
  date: string;
  day: number;
  isCurrentMonth: boolean;
};

export type DueDateParts = {
  year: number;
  month: number;
  day: number;
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

const formatDueDateParts = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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

export const parseDueDate = (value: string): DueDateParts | undefined => {
  if (!isValidDueDate(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  return { year: year!, month: month!, day: day! };
};

export const getTodayDueDate = (now = new Date()) =>
  formatDueDateParts(now.getFullYear(), now.getMonth() + 1, now.getDate());

const dateFromDueDate = (value: string) => {
  const parts = parseDueDate(value);

  if (!parts) {
    return undefined;
  }

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
};

const formatUtcDate = (date: Date) =>
  formatDueDateParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

export const moveDueDateByDays = (value: string, days: number) => {
  const date = dateFromDueDate(value);

  if (!date) {
    return value;
  }

  date.setUTCDate(date.getUTCDate() + days);

  return formatUtcDate(date);
};

export const moveDueDateByMonths = (value: string, months: number) => {
  const parts = parseDueDate(value);

  if (!parts) {
    return value;
  }

  const monthIndex = parts.year * 12 + (parts.month - 1) + months;
  const nextYear = Math.floor(monthIndex / 12);
  const nextMonth = (monthIndex % 12) + 1;
  const lastDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();

  return formatDueDateParts(nextYear, nextMonth, Math.min(parts.day, lastDay));
};

export const getCalendarDays = (focusedDate: string) => {
  const parts = parseDueDate(focusedDate);

  if (!parts) {
    return [];
  }

  const firstDay = new Date(Date.UTC(parts.year, parts.month - 1, 1));
  const startDay = new Date(firstDay);
  startDay.setUTCDate(firstDay.getUTCDate() - firstDay.getUTCDay());

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = new Date(startDay);
    date.setUTCDate(startDay.getUTCDate() + index);

    return {
      date: formatUtcDate(date),
      day: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === parts.month - 1,
    };
  });
};
