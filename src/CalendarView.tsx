import { Box, Text } from "ink";
import { getCalendarDays, parseDueDate } from "./todos";

type CalendarViewProps = {
  focusedDate: string;
};

export const CalendarView = ({ focusedDate }: CalendarViewProps) => {
  const days = getCalendarDays(focusedDate);
  const month = parseDueDate(focusedDate);
  const weeks = Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>{month ? `${month.year}-${String(month.month).padStart(2, "0")}` : ""}</Text>
      <Text dimColor> Su Mo Tu We Th Fr Sa</Text>

      {weeks.map((week) => (
        <Box key={week.map((day) => day.date).join("-")}>
          {week.map((day) => {
            const isFocused = day.date === focusedDate;
            const label = isFocused
              ? `[${String(day.day).padStart(2, " ")}]`
              : ` ${String(day.day).padStart(2, " ")} `;

            return (
              <Box key={day.date} width={4}>
                <Text color={isFocused ? "cyan" : undefined} dimColor={!day.isCurrentMonth}>
                  {label}
                </Text>
              </Box>
            );
          })}
        </Box>
      ))}

      <Text dimColor>
        h/l or ←/→: day j/k or ↑/↓: week [/]: month enter: set c: clear esc: cancel
      </Text>
    </Box>
  );
};
