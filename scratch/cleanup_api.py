#!/usr/bin/env python3
"""
Remove unused `import api from "../../api/axios"` lines
and replace inline api.post/api.patch/api.get calls with no-ops.
"""
import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    original = content

    # Replace inline api.get/post/put/patch/delete(...) calls with Promise.resolve()
    content = re.sub(r'\bapi\.(get|post|put|patch|delete)\([^)]*\)', 'Promise.resolve({ data: {} })', content)

    # Now remove the import since it's unused
    content = re.sub(r'import\s+api\s+from\s+["\'](?:\.\./)+api/axios["\'];?\n?', '', content)

    # Also remove any remaining `import { ... } from "../../services/..."` lines
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](?:\.\./)+services/[^"\']+["\'];?\n?', '', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✅ {filepath}")

print("🔧 Cleaning up remaining api/service imports...\n")
for root, dirs, files in os.walk('src/screens'):
    for f in files:
        if f.endswith('.jsx'):
            process_file(os.path.join(root, f))
print("\n✨ Done.")
