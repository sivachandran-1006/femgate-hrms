import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # 1. Remove tanstack and query/api imports
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\']@tanstack/react-query["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](\.\./)+queries/[^"\']+["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{[^}]+\}\s+from\s+["\'](\.\./)+api/[^"\']+["\'];?\n?', '', content)
    
    # Remove useQuery calls
    content = re.sub(r'const\s+\{\s*data\s*:\s*(raw[A-Za-z0-9_]+)(?:,\s*isLoading(?:[\s:]*\w+)?)?(?:,\s*isError(?:[\s:]*\w+)?)?\s*\}\s*=\s*use[A-Za-z0-9_]+\([^)]*\);', r'/* removed query \1 */', content)
    
    # Replace the fallback logic with useState
    # e.g. const departments = rawDepartments?.length ? rawDepartments : MOCK_DEPARTMENTS;
    # Or const heads = rawHeads ?? MOCK_HEADS;
    pattern = r'const\s+([a-zA-Z0-9_]+)\s*=\s*raw[A-Za-z0-9_]+\??(?:(?:\.length\s*\?)|\?\?)\s*raw[A-Za-z0-9_]+\s*:\s*(MOCK_[A-Z0-9_]+);'
    
    def replacer(match):
        var_name = match.group(1)
        mock_name = match.group(2)
        capitalized = var_name[0].upper() + var_name[1:]
        return f"const [{var_name}, set{capitalized}] = useState({mock_name});"
        
    content = re.sub(pattern, replacer, content)
    
    # Replace any leftover assignments that didn't match perfectly, e.g. where they use just `MOCK_DATA` fallback without `raw` prefix
    
    # Replace useMutation
    content = re.sub(r'const\s+([a-zA-Z0-9_]+Mut(?:ation)?)\s*=\s*use[A-Za-z0-9_]+\([^)]*\);', r'const \1 = { mutateAsync: async () => {}, isPending: false };', content)
    content = re.sub(r'const\s+(create|update|remove|delete|import|export)[A-Za-z0-9_]*\s*=\s*use[A-Za-z0-9_]+\([^)]*\);', r'const \1 = { mutateAsync: async () => {}, isPending: false };', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Refactored {filepath}")

for root, dirs, files in os.walk('src/screens'):
    for file in files:
        if file.endswith('.jsx') and 'dashboard' not in root and 'lms' not in root and 'payroll' not in root:
            # I already refactored Dashboard, LMS and Payroll correctly manually.
            process_file(os.path.join(root, file))
