// ── Primitive validators (backward-compatible exports) ──────────────────────

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

export const isRequired = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(String(phone || "").trim());

export const isPositiveNumber = (value) =>
  value !== "" && value !== null && !Number.isNaN(Number(value)) && Number(value) >= 0;

export const isValidDate = (value) =>
  isRequired(value) && !Number.isNaN(new Date(value).getTime());

// ── Rule factories — each returns (value) => error message | null ───────────
// Use these to declare a field's rules; the first failing rule wins.

export const required = (msg = "This field is required") =>
  (v) => (isRequired(v) ? null : msg);

export const email = (msg = "Enter a valid email address") =>
  (v) => (!isRequired(v) || isValidEmail(v) ? null : msg);

export const phone = (msg = "Enter a valid 10-digit mobile number") =>
  (v) => (!isRequired(v) || isValidPhone(v) ? null : msg);

export const minLength = (n, msg) =>
  (v) => (!isRequired(v) || String(v).trim().length >= n ? null : msg || `Must be at least ${n} characters`);

export const maxLength = (n, msg) =>
  (v) => (!isRequired(v) || String(v).trim().length <= n ? null : msg || `Must be at most ${n} characters`);

export const positiveNumber = (msg = "Enter a valid number") =>
  (v) => (!isRequired(v) || isPositiveNumber(v) ? null : msg);

export const date = (msg = "Enter a valid date") =>
  (v) => (!isRequired(v) || isValidDate(v) ? null : msg);

export const matches = (otherKey, msg = "Values do not match") =>
  (v, allValues) => (v === allValues?.[otherKey] ? null : msg);

// ── Schema runner ───────────────────────────────────────────────────────────
// schema: { fieldName: [rule, rule, ...] }
// Returns { errors: { field: message }, isValid: boolean }

export const validate = (values = {}, schema = {}) => {
  const errors = {};
  for (const field of Object.keys(schema)) {
    const rules = schema[field] || [];
    for (const rule of rules) {
      const msg = rule(values[field], values);
      if (msg) { errors[field] = msg; break; }
    }
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
};
