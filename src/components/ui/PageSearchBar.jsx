import { Group, TextInput, ActionIcon, Tooltip } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";

/**
 * PageSearchBar — standard search bar used above every table
 *
 * Usage:
 *   <PageSearchBar
 *     value={search}
 *     onChange={setSearch}
 *     placeholder="Search employees..."
 *     rightSection={<Select ... />}   // optional filter chip(s) on the right
 *   />
 */
export const PageSearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
  rightSection,
  w,
  ...props
}) => {
  return (
    <Group gap="sm" mb="md" wrap="wrap" {...props}>
      <TextInput
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        leftSection={<IconSearch size={15} />}
        rightSection={
          value ? (
            <Tooltip label="Clear" withArrow>
              <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => onChange("")} aria-label="Clear search">
                <IconX size={13} />
              </ActionIcon>
            </Tooltip>
          ) : null
        }
        radius="md"
        style={{ flex: 1, minWidth: 220, maxWidth: w || 340 }}
      />
      {rightSection}
    </Group>
  );
};
