import { useState, useCallback } from "react";

/**
 * useUnsavedChangesGuard — shared logic behind the "Discard changes?" confirmation
 * used by AppModalFooter/AppUnsavedChangesModal across every Add/Edit modal.
 *
 * const guard = useUnsavedChangesGuard({ isDirty, onClose });
 * <AppModal opened={open} onClose={guard.requestClose} closeOnEscape={false} closeOnClickOutside={false}>
 *   ...
 *   <AppModalFooter onCancel={guard.requestClose} ... />
 * </AppModal>
 * <AppUnsavedChangesModal opened={guard.confirmOpen} onContinueEditing={guard.cancelClose} onDiscard={guard.confirmDiscard} />
 */
export const useUnsavedChangesGuard = ({ isDirty, onClose }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestClose = useCallback(() => {
    if (isDirty) setConfirmOpen(true);
    else onClose();
  }, [isDirty, onClose]);

  const cancelClose = useCallback(() => setConfirmOpen(false), []);

  const confirmDiscard = useCallback(() => {
    setConfirmOpen(false);
    onClose();
  }, [onClose]);

  return { confirmOpen, requestClose, cancelClose, confirmDiscard };
};
