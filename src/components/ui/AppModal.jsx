import { Modal } from "@mantine/core";

export const AppModal = ({ opened, onClose, title, children, ...props }) => {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered {...props}>
      {children}
    </Modal>
  );
};
