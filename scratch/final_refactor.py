#!/usr/bin/env python3
"""
Robust HRMS refactoring script.
Strips @tanstack/react-query, queries/*, api/* imports and replaces
useQuery/useMutation calls with safe stub objects.

Handles nested parentheses properly.
"""
import os
import re

def find_matching_paren(text, start):
    """Find the index of the closing paren that matches the open paren at `start`."""
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
    return -1  # no match found


def replace_hook_calls(content, hook_name, replacement):
    """Replace `hookName(...)` (including nested parens) with `replacement`."""
    result = content
    while True:
        # Find next occurrence of hook_name followed by '('
        pattern = re.compile(r'\b' + re.escape(hook_name) + r'\s*\(')
        m = pattern.search(result)
        if not m:
            break
        # Find the open-paren position
        open_idx = m.end() - 1  # index of '('
        close_idx = find_matching_paren(result, open_idx)
        if close_idx == -1:
            break  # malformed, skip
        # Replace from start of match to closing paren (inclusive)
        result = result[:m.start()] + replacement + result[close_idx + 1:]
    return result


def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # ── 1. Collect custom hook names from queries/* imports ────────────────
    query_hooks = []
    for m in re.finditer(r'import\s+\{([^}]+)\}\s+from\s+["\'](?:\.\./)+queries/[^"\']+["\']', content):
        hooks = m.group(1).replace('\n', ' ').split(',')
        for h in hooks:
            h = h.strip()
            if h:
                query_hooks.append(h)

    if not query_hooks and '@tanstack/react-query' not in content:
        return  # nothing to do

    # ── 2. Strip imports ──────────────────────────────────────────────────
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\']@tanstack/react-query["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](?:\.\./)+queries/[^"\']+["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](?:\.\./)+api/[^"\']+["\'];?\n?', '', content)

    # ── 3. Replace custom hook calls ──────────────────────────────────────
    QUERY_STUB = '{ data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} }'
    MUTATION_STUB = '{ mutateAsync: async () => {}, isPending: false, mutate: () => {} }'

    for hook in query_hooks:
        is_mutation = any(hook.startswith(p) for p in [
            'useCreate', 'useUpdate', 'useDelete', 'useRemove',
            'useImport', 'useExport', 'useApprove', 'useReject',
            'useUpload', 'useMark', 'useBulk', 'useToggle',
            'useConnect', 'useDisconnect', 'useAssign',
        ])
        stub = MUTATION_STUB if is_mutation else QUERY_STUB
        content = replace_hook_calls(content, hook, stub)

    # ── 4. Replace bare useQuery / useMutation / useQueryClient ───────────
    content = replace_hook_calls(content, 'useQuery', QUERY_STUB)
    content = replace_hook_calls(content, 'useMutation', MUTATION_STUB)
    content = replace_hook_calls(content, 'useQueryClient', '{ invalidateQueries: () => {}, setQueryData: () => {} }')

    # ── 5. Convert raw fallback to useState ───────────────────────────────
    pattern = r'const\s+([a-zA-Z0-9_]+)\s*=\s*(raw[A-Za-z0-9_]+)\?\?\.length\s*\?\s*\2\s*:\s*(MOCK_[A-Z0-9_]+);'
    def replacer(match):
        var_name = match.group(1)
        mock_name = match.group(3)
        cap = var_name[0].upper() + var_name[1:]
        return f"const [{var_name}, set{cap}] = useState({mock_name});"
    content = re.sub(pattern, replacer, content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"  ✅ {filepath}")


# ── Main ──────────────────────────────────────────────────────────────────
print("🔧 Starting HRMS backend removal refactoring...\n")
count = 0
for root, dirs, files in os.walk('src/screens'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
            count += 1

print(f"\n✨ Done. Scanned {count} files.")
