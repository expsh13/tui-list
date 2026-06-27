import { Text } from "ink";
import { getGraphemes } from "./textInput";

type TextInputLineProps = {
  label: string;
  value: string;
  cursor: number;
};

export const TextInputLine = ({ label, value, cursor }: TextInputLineProps) => {
  const graphemes = getGraphemes(value);
  const before = graphemes.slice(0, cursor).join("");
  const after = graphemes.slice(cursor).join("");

  return (
    <Text>
      {label}
      {before}
      <Text color="cyan">|</Text>
      {after}
    </Text>
  );
};
