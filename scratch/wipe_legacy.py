import os, re

# 1. Wipe the legacy axios files
for path in ['src/components/Attendance.jsx', 'src/pages/Payroll.jsx']:
    if os.path.exists(path):
        with open(path) as f:
            content = f.read()
        # Remove the axios import line
        content = re.sub(r"import axios from 'axios';\n?", '', content)
        content = re.sub(r'import axios from "axios";\n?', '', content)
        # Replace all axios.get/post/put/delete(...) calls with Promise.resolve
        content = re.sub(r'\baxios\.(get|post|put|patch|delete)\([^;]+\)', 'Promise.resolve({ data: [] })', content)
        with open(path, 'w') as f:
            f.write(content)
        print(f"  ✅ Wiped axios from {path}")

print("\n✨ Done.")
