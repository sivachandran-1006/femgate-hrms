import os, re

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    lines = content.split('\n')
    issues = []
    
    # Pattern 1: Variables destructured from query stub with `data: undefined`
    # then used directly without fallback, like `data.map(...)` or `items.forEach(...)`
    
    # Find destructured data vars from query stubs
    query_data_vars = set()
    for i, line in enumerate(lines, 1):
        # const { data: rawX } = { data: undefined, ... }
        m = re.search(r'const\s*\{\s*data:\s*(\w+)', line)
        if m and 'undefined' in line:
            query_data_vars.add(m.group(1))
        # const { data: X = [] } = ... (safe, has default)
        m2 = re.search(r'const\s*\{\s*data:\s*(\w+)\s*=\s*\[', line)
        if m2:
            query_data_vars.discard(m2.group(1))
    
    # Check if raw vars have fallbacks
    for var in list(query_data_vars):
        # Check if there's a fallback like `const items = rawItems?.length ? rawItems : MOCK_*`
        fallback_pat = re.compile(r'const\s+\w+\s*=\s*' + re.escape(var) + r'\?')
        if fallback_pat.search(content):
            continue  # has fallback, safe
        
        # Check if it's used directly with .map/.filter/.forEach/.length
        usage_pat = re.compile(re.escape(var) + r'\s*\.\s*(map|filter|forEach|reduce|find|some|every|length|includes|indexOf|slice|splice|sort|flatMap|flat)')
        for i, line in enumerate(lines, 1):
            if usage_pat.search(line):
                issues.append((i, f"'{var}' could be undefined (no fallback from query stub)", line.strip()[:120]))
    
    # Pattern 2: Check for `qc.invalidateQueries` which was from useQueryClient  
    for i, line in enumerate(lines, 1):
        if 'invalidateQueries' in line and 'const' not in line:
            issues.append((i, "invalidateQueries call (useQueryClient removed)", line.strip()[:120]))
    
    # Pattern 3: Check for `refetch()` calls that might be problematic
    # (refetch is stubbed as () => {} so it's safe, but let's check)
    
    if issues:
        print(f"\n⚠️  {filepath}:")
        for lineno, desc, snippet in issues:
            print(f"   L{lineno}: {desc}")
    
    return issues

print("🔍 Scanning for potential runtime crashes...\n")
all_issues = []
for root, dirs, files in os.walk('src/screens'):
    for f in files:
        if f.endswith('.jsx'):
            issues = check_file(os.path.join(root, f))
            all_issues.extend(issues)

print(f"\n{'='*60}")
print(f"Total potential runtime issues: {len(all_issues)}")
