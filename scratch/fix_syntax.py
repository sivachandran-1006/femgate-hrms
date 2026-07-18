import os, re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    original = content
    
    # Fix 1: Double qc declarations: `{ invalidateQueries: () => {}, setQueryData: () => {} };, setQueryData: () => {} };`
    content = content.replace(
        '{ invalidateQueries: () => {}, setQueryData: () => {} };, setQueryData: () => {} };',
        '{ invalidateQueries: () => {}, setQueryData: () => {} };'
    )
    
    # Fix 2: chain.(chain || []).length  →  (chain || []).length
    content = re.sub(r'(\w+)\.\(\1 \|\| \[\]\)\.length', r'(\1 || []).length', content)
    
    # Fix 3: Check for any `var.(var || []).method(` patterns
    content = re.sub(r'(\w+)\.\((\1) \|\| \[\]\)\.(\w+)\(', r'(\1 || []).\3(', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✅ {filepath}")

print("🔧 Fixing syntax errors...\n")
for root, dirs, files in os.walk('src/screens'):
    for f in files:
        if f.endswith('.jsx'):
            process_file(os.path.join(root, f))
print("\n✨ Done.")
