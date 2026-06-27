import { useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { CalendarView } from "./CalendarView";
import { TextInputLine } from "./TextInputLine";
import { loadTodos, saveTodos } from "./storage";
import {
  clampTextCursor,
  getTextBeforeLineBreak,
  getTextLength,
  insertTextAt,
  removeTextAt,
  removeTextBefore,
} from "./textInput";
import {
  clampIndex,
  getSelectedIndexAfterRemoval,
  getTodayDueDate,
  getTodoIndexById,
  moveDueDateByDays,
  moveDueDateByMonths,
  removeTodoAt,
  setTodoDueDateAt,
  sortTodosByDueDate,
  toggleTodoAt,
  updateTodoTextAt,
  type Todo,
} from "./todos";

type InputMode = "list" | "add" | "edit" | "calendar";

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
  const [draftCursor, setDraftCursor] = useState(0);
  const [calendarDate, setCalendarDate] = useState(getTodayDueDate());
  const [message, setMessage] = useState("");

  const sortedTodos = sortTodosByDueDate(todos);
  const selectedTodo = sortedTodos[selectedIndex];
  const selectedTodoIndex = selectedTodo ? getTodoIndexById(todos, selectedTodo.id) : -1;

  useEffect(() => {
    let isMounted = true;

    loadTodos()
      .then((savedTodos) => {
        if (!isMounted || !savedTodos) {
          return;
        }

        setTodos(savedTodos);
        setSelectedIndex((currentIndex) => clampIndex(currentIndex, savedTodos.length));
      })
      .catch(() => {
        if (isMounted) {
          setMessage("failed to load saved todos");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateTodos = (nextTodos: Todo[], selectedTodoId = selectedTodo?.id) => {
    setTodos(nextTodos);
    void saveTodos(nextTodos).catch(() => {
      setMessage("failed to save todos");
    });

    if (selectedTodoId === undefined) {
      setSelectedIndex((currentIndex) => clampIndex(currentIndex, nextTodos.length));
      return;
    }

    const nextSelectedIndex = sortTodosByDueDate(nextTodos).findIndex(
      (todo) => todo.id === selectedTodoId,
    );
    setSelectedIndex(clampIndex(nextSelectedIndex, nextTodos.length));
  };

  useInput((input, key) => {
    if (inputMode === "add" || inputMode === "edit") {
      if (key.return || input.includes("\r") || input.includes("\n")) {
        const text = insertTextAt(draft, draftCursor, getTextBeforeLineBreak(input)).trim();

        if (inputMode === "add" && text.length > 0) {
          const nextTodo = { id: Date.now(), text, done: false };
          updateTodos([...todos, nextTodo], nextTodo.id);
        }

        if (inputMode === "edit") {
          if (text.length === 0) {
            setMessage("todo text cannot be empty");
            return;
          }

          updateTodos(updateTodoTextAt(todos, selectedTodoIndex, text));
          setMessage("todo updated");
        }

        setDraft("");
        setDraftCursor(0);
        setInputMode("list");
        return;
      }

      if (key.escape) {
        setDraft("");
        setDraftCursor(0);
        setInputMode("list");
        return;
      }

      if (key.leftArrow) {
        setDraftCursor((currentCursor) => clampTextCursor(currentCursor - 1, draft));
        return;
      }

      if (key.rightArrow) {
        setDraftCursor((currentCursor) => clampTextCursor(currentCursor + 1, draft));
        return;
      }

      if (key.backspace) {
        setDraft((currentDraft) => removeTextBefore(currentDraft, draftCursor));
        setDraftCursor((currentCursor) => clampTextCursor(currentCursor - 1, draft));
        return;
      }

      if (key.delete) {
        setDraft((currentDraft) => removeTextAt(currentDraft, draftCursor));
        return;
      }

      if (input.length > 0 && !key.ctrl && !key.meta) {
        setDraft((currentDraft) => insertTextAt(currentDraft, draftCursor, input));
        setDraftCursor((currentCursor) => currentCursor + getTextLength(input));
      }

      return;
    }

    if (inputMode === "calendar") {
      if (key.escape) {
        setInputMode("list");
        return;
      }

      if (key.return || input === " " || input.includes("\r") || input.includes("\n")) {
        updateTodos(setTodoDueDateAt(todos, selectedTodoIndex, calendarDate));
        setMessage(`date set: ${calendarDate}`);
        setInputMode("list");
        return;
      }

      if (input === "c") {
        updateTodos(setTodoDueDateAt(todos, selectedTodoIndex));
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
      setSelectedIndex((currentIndex) => clampIndex(currentIndex + 1, sortedTodos.length));
      return;
    }

    if (input === "k" || key.upArrow) {
      setSelectedIndex((currentIndex) => clampIndex(currentIndex - 1, sortedTodos.length));
      return;
    }

    if (input === " ") {
      if (selectedTodo) {
        updateTodos(toggleTodoAt(todos, selectedTodoIndex));
        setMessage("");
      }

      return;
    }

    if (input === "a") {
      setDraft("");
      setDraftCursor(0);
      setInputMode("add");
      setMessage("");
      return;
    }

    if (input === "e" && selectedTodo) {
      setDraft(selectedTodo.text);
      setDraftCursor(getTextLength(selectedTodo.text));
      setInputMode("edit");
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
      const nextTodos = removeTodoAt(todos, selectedTodoIndex);
      setTodos(nextTodos);
      void saveTodos(nextTodos).catch(() => {
        setMessage("failed to save todos");
      });
      setSelectedIndex((currentIndex) =>
        getSelectedIndexAfterRemoval(currentIndex, nextTodos.length),
      );
      setMessage("");
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold>Todo List</Text>

      <Box flexDirection="column" marginY={1}>
        {sortedTodos.length === 0 ? (
          <Text dimColor>todo はありません</Text>
        ) : (
          sortedTodos.map((todo, index) => {
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

      {inputMode === "add" && <TextInputLine label="+ " value={draft} cursor={draftCursor} />}
      {inputMode === "edit" && <TextInputLine label="edit: " value={draft} cursor={draftCursor} />}
      {inputMode === "calendar" && <CalendarView focusedDate={calendarDate} />}
      {inputMode === "list" && (
        <Text dimColor>
          j/k or ↑/↓: move space: toggle a: add e: edit t: calendar d: delete q: quit
        </Text>
      )}
      {message.length > 0 && <Text color="yellow">{message}</Text>}
    </Box>
  );
};
