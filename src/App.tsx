import { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { CalendarView } from "./CalendarView";
import {
  clampIndex,
  getSelectedIndexAfterRemoval,
  getTodayDueDate,
  moveDueDateByDays,
  moveDueDateByMonths,
  removeTodoAt,
  setTodoDueDateAt,
  toggleTodoAt,
  type Todo,
} from "./todos";

type InputMode = "list" | "add" | "calendar";

const initialTodos: Todo[] = [
  { id: 1, text: "Ink で todo list を作る", done: false },
  { id: 2, text: "j/k で選択移動する", done: true },
  { id: 3, text: "space で完了を切り替える", done: false },
];

export const App = () => {
  const { exit } = useApp();
  const [todos, setTodos] = useState(initialTodos);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("list");
  const [draft, setDraft] = useState("");
  const [calendarDate, setCalendarDate] = useState(getTodayDueDate());
  const [message, setMessage] = useState("");

  const selectedTodo = todos[selectedIndex];

  useInput((input, key) => {
    if (inputMode === "add") {
      if (key.return || input.includes("\r") || input.includes("\n")) {
        const text = `${draft}${input.replaceAll("\r", "").replaceAll("\n", "")}`.trim();

        if (text.length > 0) {
          const nextTodo = { id: Date.now(), text, done: false };
          setTodos((currentTodos) => [...currentTodos, nextTodo]);
          setSelectedIndex(todos.length);
        }

        setDraft("");
        setInputMode("list");
        return;
      }

      if (key.escape) {
        setDraft("");
        setInputMode("list");
        return;
      }

      if (key.backspace || key.delete) {
        setDraft((currentDraft) => currentDraft.slice(0, -1));
        return;
      }

      if (input.length > 0 && !key.ctrl && !key.meta) {
        setDraft((currentDraft) => currentDraft + input);
      }

      return;
    }

    if (inputMode === "calendar") {
      if (key.escape) {
        setInputMode("list");
        return;
      }

      if (key.return || input === " " || input.includes("\r") || input.includes("\n")) {
        setTodos((currentTodos) => setTodoDueDateAt(currentTodos, selectedIndex, calendarDate));
        setMessage(`date set: ${calendarDate}`);
        setInputMode("list");
        return;
      }

      if (input === "c") {
        setTodos((currentTodos) => setTodoDueDateAt(currentTodos, selectedIndex));
        setMessage("date cleared");
        setInputMode("list");
        return;
      }

      if (input === "h" || key.leftArrow) {
        setCalendarDate((currentDate) => moveDueDateByDays(currentDate, -1));
        return;
      }

      if (input === "l" || key.rightArrow) {
        setCalendarDate((currentDate) => moveDueDateByDays(currentDate, 1));
        return;
      }

      if (input === "j" || key.downArrow) {
        setCalendarDate((currentDate) => moveDueDateByDays(currentDate, 7));
        return;
      }

      if (input === "k" || key.upArrow) {
        setCalendarDate((currentDate) => moveDueDateByDays(currentDate, -7));
        return;
      }

      if (input === "[" || key.pageUp) {
        setCalendarDate((currentDate) => moveDueDateByMonths(currentDate, -1));
        return;
      }

      if (input === "]" || key.pageDown) {
        setCalendarDate((currentDate) => moveDueDateByMonths(currentDate, 1));
      }

      return;
    }

    if (input === "q" || (input === "c" && key.ctrl)) {
      exit();
      return;
    }

    if (input === "j" || key.downArrow) {
      setSelectedIndex((currentIndex) => clampIndex(currentIndex + 1, todos.length));
      return;
    }

    if (input === "k" || key.upArrow) {
      setSelectedIndex((currentIndex) => clampIndex(currentIndex - 1, todos.length));
      return;
    }

    if (input === " ") {
      if (selectedTodo) {
        setTodos((currentTodos) => toggleTodoAt(currentTodos, selectedIndex));
        setMessage("");
      }

      return;
    }

    if (input === "a") {
      setDraft("");
      setInputMode("add");
      setMessage("");
      return;
    }

    if (input === "t" && selectedTodo) {
      setCalendarDate(selectedTodo.dueDate ?? getTodayDueDate());
      setInputMode("calendar");
      setMessage("");
      return;
    }

    if (input === "d") {
      setTodos((currentTodos) => removeTodoAt(currentTodos, selectedIndex));
      setSelectedIndex((currentIndex) => getSelectedIndexAfterRemoval(currentIndex, todos.length));
      setMessage("");
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold>Todo List</Text>

      <Box flexDirection="column" marginY={1}>
        {todos.length === 0 ? (
          <Text dimColor>todo はありません</Text>
        ) : (
          todos.map((todo, index) => {
            const isSelected = index === selectedIndex;
            const marker = isSelected ? ">" : " ";
            const checkbox = todo.done ? "[x]" : "[ ]";
            const dueDate = todo.dueDate ? `  ${todo.dueDate}` : "";

            return (
              <Text key={todo.id} color={isSelected ? "cyan" : undefined} strikethrough={todo.done}>
                {`${marker} ${checkbox} ${todo.text}${dueDate}`}
              </Text>
            );
          })
        )}
      </Box>

      {inputMode === "add" && <Text>{`+ ${draft}`}</Text>}
      {inputMode === "calendar" && <CalendarView focusedDate={calendarDate} />}
      {inputMode === "list" && (
        <Text dimColor>j/k or ↑/↓: move space: toggle a: add t: calendar d: delete q: quit</Text>
      )}
      {message.length > 0 && <Text color="yellow">{message}</Text>}
    </Box>
  );
};
