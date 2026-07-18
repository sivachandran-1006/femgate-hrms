import os

STUB_CONTENT = """// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// main_v1 \u2014 STUB FILE (static mock-only branch)
// Old backend endpoint functions removed.
// This file exists only so existing imports don\u2019t break.
// New backend service will be configured on a separate branch.
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export default {};
"""

count = 0

# Wipe all services/
for fname in os.listdir('src/services'):
    if fname.endswith('.js'):
        with open(f'src/services/{fname}', 'w') as f:
            f.write(STUB_CONTENT)
        print(f"  ✅ src/services/{fname}")
        count += 1

# Wipe all api/*.js except axios.js (already done)
for fname in os.listdir('src/api'):
    if fname.endswith('.js') and fname != 'axios.js':
        with open(f'src/api/{fname}', 'w') as f:
            f.write(STUB_CONTENT)
        print(f"  ✅ src/api/{fname}")
        count += 1

# Wipe all queries/*.js
for fname in os.listdir('src/queries'):
    if fname.endswith('.js'):
        with open(f'src/queries/{fname}', 'w') as f:
            f.write(STUB_CONTENT)
        print(f"  ✅ src/queries/{fname}")
        count += 1

print(f"\n✨ Wiped {count} files. All old endpoint files are now empty stubs.")
