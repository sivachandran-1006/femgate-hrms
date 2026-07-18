import os, re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    original = content
    
    # Fix: `() => /* no-op: query cache removed */` → `() => {}`
    content = re.sub(r'=>\s*/\* no-op: query cache removed \*/', '=> {}', content)
    
    # Also fix: `const invalidate = () => {}` followed by nothing (missing semicolon/newline)
    # The pattern `() => {}` without semicolon before next `const` might cause issues
    # But that should be fine in JS
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✅ {filepath}")

print("🔧 Fixing broken no-op arrow functions...\n")
for root, dirs, files in os.walk('src/screens'):
    for f in files:
        if f.endswith('.jsx'):
            process_file(os.path.join(root, f))
print("\n✨ Done.")
