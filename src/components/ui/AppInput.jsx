import { TextInput, PasswordInput, Select, Textarea, NumberInput } from "@mantine/core";

export const AppInput = ({
  type    = "text",
  radius  = "md",
  size    = "sm",
  ...props
}) => {
  if (type === "password") {
    return <PasswordInput radius={radius} size={size} {...props} />;
  }
  if (type === "select") {
    return <Select radius={radius} size={size} {...props} />;
  }
  if (type === "textarea") {
    return <Textarea radius={radius} size={size} autosize minRows={2} {...props} />;
  }
  if (type === "number") {
    return <NumberInput radius={radius} size={size} {...props} />;
  }
  return <TextInput type={type} radius={radius} size={size} {...props} />;
};
