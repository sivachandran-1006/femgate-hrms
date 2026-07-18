import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # 1. Remove @tanstack/react-query imports
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\']@tanstack/react-query["\'];?\n?', '', content)
    
    # 2. Remove queries imports
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](\.\./)+queries/[^"\']+["\'];?\n?', '', content)

    # 3. Find patterns like:
    # const { data: rawX, isLoading } = useQuery(...) or useSomething(...)
    # const x = rawX?.length ? rawX : MOCK_X;
    # Replace with: const [x, setX] = useState(MOCK_X);
    
    # This regex looks for `const { data: raw<Name>... } = use<Something>(...);`
    # Followed closely by `const <name> = raw<Name>... ? raw<Name> : MOCK_<NAME>;`
    # We will just replace all `useQuery` or `useSomething` that returns data.
    
    # Actually, the simplest universal change is to inject a dummy hook if we can't parse it.
    
    # Let's try to do a more naive replacement.
    # For every use[A-Z]\w+\( ... \) that is assigned to a mutation:
    content = re.sub(r'const\s+(\w+)\s*=\s*use(?:Create|Update|Delete|Import|Export|Approve|Reject)[A-Z]\w*\([^)]*\);', r'const \1 = { mutateAsync: async () => {}, isPending: false };', content)
    
    # For queries:
    content = re.sub(r'const\s+\{\s*data\s*:\s*([^,]+)(?:,\s*isLoading(?:\s*:\s*\w+)?)?\s*\}\s*=\s*use\w+\([^)]*\);', r'const { data: \1, isLoading: false } = { data: undefined };', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Refactored {filepath}")

for root, dirs, files in os.walk('src/screens'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
