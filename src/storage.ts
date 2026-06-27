import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { isValidDueDate, type Todo } from "./todos";

const dataFilePath = process.env.TUI_LIST_DATA_FILE ?? join(homedir(), ".tui-list", "todos.json");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const deserializeTodos = (value: string): Todo[] | undefined => {
  const parsedValue: unknown = JSON.parse(value);

  if (!Array.isArray(parsedValue)) {
    return undefined;
  }

  const todos = parsedValue.flatMap((item): Todo[] => {
    if (!isRecord(item)) {
      return [];
    }

    if (
      typeof item.id !== "number" ||
      typeof item.text !== "string" ||
      typeof item.done !== "boolean"
    ) {
      return [];
    }

    if (item.dueDate !== undefined) {
      if (typeof item.dueDate !== "string" || !isValidDueDate(item.dueDate)) {
        return [];
      }

      return [{ id: item.id, text: item.text, done: item.done, dueDate: item.dueDate }];
    }

    return [{ id: item.id, text: item.text, done: item.done }];
  });

  return todos;
};

export const loadTodos = async () => {
  try {
    return deserializeTodos(await readFile(dataFilePath, "utf8"));
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") {
      return undefined;
    }

    if (error instanceof SyntaxError) {
      return undefined;
    }

    throw error;
  }
};

export const saveTodos = async (todos: Todo[]) => {
  await mkdir(dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, `${JSON.stringify(todos, null, 2)}\n`, "utf8");
};
