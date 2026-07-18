#!/usr/bin/env python3
"""
Fix runtime crash patterns:
1. `data: raw` variables used without fallback → add optional chaining or default
2. `qc.invalidateQueries(...)` calls → remove them
3. Any `data: undefined` destructuring where the var is used with .map/.filter → add `|| []`
"""
import os, re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    original = content
    lines = content.split('\n')
    
    # 1. Find query data vars that return undefined and have no fallback
    query_data_vars = {}
    for i, line in enumerate(lines):
        m = re.search(r'const\s*\{\s*data:\s*(\w+)(?:\s*=\s*\[\])?\s*[,}]', line)
        if m and 'undefined' in line:
            var_name = m.group(1)
            # Check if it has a default value like `data: raw = []`
            has_default = re.search(r'data:\s*' + re.escape(var_name) + r'\s*=', line)
            if not has_default:
                query_data_vars[var_name] = i

    # 2. For each undefined data var, check if there's a fallback on the next few lines
    for var_name, line_idx in list(query_data_vars.items()):
        # Check next 5 lines for fallback pattern
        has_fallback = False
        for j in range(line_idx + 1, min(line_idx + 6, len(lines))):
            if re.search(r'const\s+\w+\s*=\s*' + re.escape(var_name) + r'\?', lines[j]):
                has_fallback = True
                break
        if has_fallback:
            del query_data_vars[var_name]

    # 3. For remaining vars, add `|| []` or `|| {}` fallback where they're used with .map etc
    for var_name in query_data_vars:
        # Add optional chaining: var.map → (var || []).map
        content = re.sub(
            r'\b' + re.escape(var_name) + r'\.(\w+)\(',
            f'({var_name} || []).\\1(',
            content
        )
        # Fix var.length → (var || []).length  
        content = re.sub(
            r'\b' + re.escape(var_name) + r'\.length',
            f'({var_name} || []).length',
            content
        )
    
    # 4. Remove or stub `qc.invalidateQueries(...)` calls
    content = re.sub(r'\bqc\.invalidateQueries\([^)]*\);?', '/* no-op: query cache removed */', content)
    content = re.sub(r'\bqueryClient\.invalidateQueries\([^)]*\);?', '/* no-op: query cache removed */', content)
    
    # 5. Fix any `qc = useQueryClient()` that's still around
    content = re.sub(r'const\s+qc\s*=\s*\{\s*invalidateQueries.*?\};?', 'const qc = { invalidateQueries: () => {}, setQueryData: () => {} };', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✅ {filepath}")

print("🔧 Fixing runtime crash patterns...\n")
for root, dirs, files in os.walk('src/screens'):
    for f in files:
        if f.endswith('.jsx'):
            process_file(os.path.join(root, f))
print("\n✨ Done.")
