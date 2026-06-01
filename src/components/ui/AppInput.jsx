import { TextInput, PasswordInput, Select } from "@mantine/core";

export const AppInput = ({ type = "text", ...props }) => {
  if (type === "password") {
    return <PasswordInput {...props} />;
  }
  if (type === "select") {
    return <Select {...props} />;
  }
  return <TextInput type={type} {...props} />;
};
