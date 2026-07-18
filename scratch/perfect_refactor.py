import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    query_hooks = []
    import_matches = re.finditer(r'import\s+\{([^}]+)\}\s+from\s+["\'](\.\./)+queries/[^"\']+["\'];?', content)
    for match in import_matches:
        hooks = match.group(1).replace('\n', ' ').split(',')
        for hook in hooks:
            hook = hook.strip()
            if hook:
                query_hooks.append(hook)
    
    if not query_hooks and '@tanstack/react-query' not in content:
        return

    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\']@tanstack/react-query["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](\.\./)+queries/[^"\']+["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](\.\./)+api/[^"\']+["\'];?\n?', '', content)

    for hook in query_hooks:
        if any(hook.startswith(prefix) for prefix in ['useCreate', 'useUpdate', 'useDelete', 'useRemove', 'useImport', 'useExport', 'useApprove', 'useReject', 'useUpload', 'useMark']):
            content = re.sub(rf'\b{hook}\([^)]*\)', '{ mutateAsync: async () => {}, isPending: false, mutate: () => {} }', content)
        else:
            content = re.sub(rf'\b{hook}\([^)]*\)', '{ data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} }', content)

    content = re.sub(r'\buseQuery\([^)]*\)', '{ data: undefined, isLoading: false, isError: false, isPending: false, refetch: () => {} }', content)
    content = re.sub(r'\buseMutation\([^)]*\)', '{ mutateAsync: async () => {}, isPending: false, mutate: () => {} }', content)
    content = re.sub(r'\buseQueryClient\([^)]*\)', '{ invalidateQueries: () => {}, setQueryData: () => {} }', content)

    pattern = r'const\s+([a-zA-Z0-9_]+)\s*=\s*(raw[A-Za-z0-9_]+)\??(?:(?:\.length\s*\?)|\?\?)\s*\2\s*:\s*(MOCK_[A-Z0-9_]+);'
    def replacer(match):
        var_name = match.group(1)
        mock_name = match.group(3)
        capitalized = var_name[0].upper() + var_name[1:]
        return f"const [{var_name}, set{capitalized}] = useState({mock_name});"
    content = re.sub(pattern, replacer, content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Refactored {filepath}")

for root, dirs, files in os.walk('src/screens'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
