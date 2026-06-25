import { useState, useCallback } from "react";
import { validate } from "../utils/validators";

// Lightweight form validation hook.
//
//   const { errors, validateForm, validateField, clearErrors } =
//     useFormValidation({ email: [required(), email()], phone: [phone()] });
//
//   const handleSave = () => {
//     if (!validateForm(form)) return;     // sets errors, blocks submit
//     mutate(form);
//   };
//
// Pair `errors[field]` with Mantine's `error` prop on inputs.

export function useFormValidation(schema = {}) {
  const [errors, setErrors] = useState({});

  // Validate the whole form; returns true when valid.
  const validateForm = useCallback((values) => {
    const { errors: errs, isValid } = validate(values, schema);
    setErrors(errs);
    return isValid;
  }, [schema]);

  // Validate a single field (e.g. on blur) without touching the others.
  const validateField = useCallback((field, values) => {
    const rules = schema[field] || [];
    let message = null;
    for (const rule of rules) {
      message = rule(values[field], values);
      if (message) break;
    }
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
    return !message;
  }, [schema]);

  const clearErrors = useCallback(() => setErrors({}), []);

  // Clear one field's error (e.g. as the user types).
  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return { errors, validateForm, validateField, clearErrors, clearFieldError };
}
