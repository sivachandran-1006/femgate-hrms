#!/usr/bin/env python3
"""
Fix all broken references after backend removal.
Replaces calls to removed service functions (export*, download*, fetch*) 
with mock no-op stubs.
"""
import os, re

def find_matching_paren(text, start):
    depth = 0
    i = start
    while i < len(text):
        if text[i] == '(':
            depth += 1
        elif text[i] == ')':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    original = content
    lines = content.split('\n')
    
    # Collect all defined names
    defined = set()
    for line in lines:
        for m in re.finditer(r'(?:const|let|var)\s+(\w+)', line):
            defined.add(m.group(1))
        for m in re.finditer(r'function\s+(\w+)', line):
            defined.add(m.group(1))
        for m in re.finditer(r'import\s+\{([^}]+)\}', line):
            for name in m.group(1).split(','):
                name = name.strip().split(' as ')[-1].strip()
                if name: defined.add(name)
        for m in re.finditer(r'import\s+(\w+)\s+from', line):
            defined.add(m.group(1))

    # Find undefined export*/download*/fetch*/upload* function calls and replace them
    # with mock stubs
    service_fn_pattern = re.compile(r'\b(export\w+|download\w+|fetch\w+|upload\w+)\s*\(')
    
    skip = {'exportDefault', 'fetchData', 'setTimeout', 'setInterval'}
    
    result = content
    replaced = set()
    
    for m in service_fn_pattern.finditer(content):
        fname = m.group(1)
        if fname in defined or fname in skip or fname in replaced:
            continue
        if fname.startswith('set'):
            continue
            
        # This function is undefined - we need to stub it
        # Find the entire `await funcName(...)` or `funcName(...)` expression
        # and replace with a mock
        
        if fname.startswith('export') or fname.startswith('download'):
            # These typically return blobs for CSV/PDF downloads
            # Replace the entire try block or just the call with a toast message
            stub = f'(() => {{ console.log("Mock: {fname} called"); return new Blob(["mock"], {{ type: "text/csv" }}); }})()'
        elif fname.startswith('fetch'):
            stub = f'(() => {{ console.log("Mock: {fname} called"); return {{ data: {{ data: [] }} }}; }})()'
        else:
            stub = f'(() => {{ console.log("Mock: {fname} called"); }})()'
        
        result = re.sub(r'\b' + re.escape(fname) + r'\b(?=\s*\()', f'/* mock */ {stub.split("(")[0]}', result)
        # Actually let's do it more cleanly - just define the function at the top of the component
        replaced.add(fname)

    # Better approach: inject stub function declarations right before the component
    if replaced:
        stubs = []
        for fname in sorted(replaced):
            if fname.startswith('export') or fname.startswith('download'):
                stubs.append(f'const {fname} = async (...args) => {{ console.log("Mock: {fname}"); return new Blob(["mock data"], {{ type: "text/csv" }}); }};')
            elif fname.startswith('fetch'):
                stubs.append(f'const {fname} = async (...args) => {{ console.log("Mock: {fname}"); return {{ data: {{ data: [] }} }}; }};')
            else:
                stubs.append(f'const {fname} = async (...args) => {{ console.log("Mock: {fname}"); }};')
        
        stub_block = '\n// ── Mock stubs for removed service functions ──\n' + '\n'.join(stubs) + '\n'
        
        # Insert after the last import statement
        # Find the last import line
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                last_import_idx = i
        
        if last_import_idx >= 0:
            lines.insert(last_import_idx + 1, stub_block)
            result = '\n'.join(lines)
        else:
            # fallback: insert at top
            result = stub_block + '\n' + content

    if result != original:
        with open(filepath, 'w') as f:
            f.write(result)
        if replaced:
            print(f"  ✅ {filepath} — stubbed: {', '.join(sorted(replaced))}")

print("🔧 Fixing broken service function references...\n")
for root, dirs, files in os.walk('src/screens'):
    for f in files:
        if f.endswith('.jsx'):
            process_file(os.path.join(root, f))
print("\n✨ Done.")
