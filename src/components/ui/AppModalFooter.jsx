import { useEffect } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { AppButton } from "./AppButton";
import { AppModal } from "./AppModal";

/**
 * AppModalFooter — the single reusable footer for every Add/Edit modal in the app.
 *
 * Usage:
 *   <AppModalFooter
 *     onCancel={onClose}
 *     onSave={() => submit(false)}
 *     onSaveAndNew={() => submit(true)}   // omit to hide "Save & Add Another"
 *     saving={saving}
 *     isEdit={!!editData}                 // hides "Save & Add Another" and relabels Save
 *     isDirty={isDirty}                   // enables the unsaved-changes guard on Cancel/ESC
 *   />
 *
 * Do not hand-roll footer <Group justify="flex-end"> blocks in individual screens —
 * every Add/Edit modal (Employee, Department, Branch, Designation, Shift, Leave Type,
 * Holiday, Payroll Component, Asset, Vendor, Client, Project, Visitor, Policy, Custom
 * Forms, Workflow, and any future CRUD popup) should render this component instead.
 */
export const AppModalFooter = ({
  onCancel,
  onSave,
  onSaveAndNew,
  saving = false,
  isEdit = false,
  saveLabel,
}) => {
  const requestCancel = () => {
    if (saving) return;
    onCancel();
  };

  // Keyboard support: Enter/Ctrl+S = Save, ESC handled by the parent Modal's onClose
  // (which screens should point at requestCancel-equivalent logic — see AppModal usage).
  useEffect(() => {
    const handler = (e) => {
      if (saving) return;
      const isSaveCombo = (e.key === "Enter" && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s");
      if (isSaveCombo) {
        const tag = document.activeElement?.tagName;
        // Let Enter behave normally inside multi-line/select-like controls; Ctrl/Cmd+S always saves.
        if (e.key === "Enter" && (tag === "TEXTAREA")) return;
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saving, onSave]);

  return (
    <Group justify="flex-end" gap="sm" mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
      <AppButton variant="default" color="gray" disabled={saving} onClick={requestCancel}>
        Cancel
      </AppButton>
      {!isEdit && onSaveAndNew && (
        <AppButton variant="light" loading={saving} disabled={saving} onClick={onSaveAndNew}>
          Save &amp; Add Another
        </AppButton>
      )}
      <AppButton
        loading={saving}
        disabled={saving}
        leftSection={!saving && <IconDeviceFloppy size={16} />}
        onClick={onSave}
      >
        {saving ? "Saving..." : (saveLabel || (isEdit ? "Save Changes" : "Save Branch"))}
      </AppButton>
    </Group>
  );
};

/**
 * AppUnsavedChangesModal — the "Discard changes?" confirmation shown when a user tries
 * to close a dirty form via Cancel, ESC, or an outside click.
 */
export const AppUnsavedChangesModal = ({ opened, onContinueEditing, onDiscard }) => (
  <AppModal opened={opened} onClose={onContinueEditing} size="sm" title="Unsaved changes" withCloseButton={false}>
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        You have unsaved changes. Are you sure you want to close?
      </Text>
      <Group justify="flex-end" gap="sm">
        <AppButton variant="default" color="gray" onClick={onContinueEditing}>Continue Editing</AppButton>
        <AppButton color="red" onClick={onDiscard}>Discard Changes</AppButton>
      </Group>
    </Stack>
  </AppModal>
);
