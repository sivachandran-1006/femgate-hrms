// ─────────────────────────────────────────────────────────────────────────────
// main_v1 — STATIC MOCK-ONLY BRANCH
// All backend API endpoints have been removed.
// New backend URL will be configured on a separate branch when the new
// service goes live. This file is intentionally a no-op stub.
// DO NOT add any base URL or real HTTP calls here.
// ─────────────────────────────────────────────────────────────────────────────

const noop = async () => ({ data: { data: [] } });

const api = {
  get:    noop,
  post:   noop,
  put:    noop,
  patch:  noop,
  delete: noop,
};

export default api;
