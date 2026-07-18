import os, re

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    issues = []
    
    # Check for function/variable references that look like they came from removed imports
    # Pattern: camelCase function names being called that aren't defined in the file
    
    # 1. Find all function definitions and variable declarations in the file
    defined = set()
    for line in lines:
        # const/let/var declarations
        for m in re.finditer(r'(?:const|let|var)\s+(\w+)', line):
            defined.add(m.group(1))
        # function declarations
        for m in re.finditer(r'function\s+(\w+)', line):
            defined.add(m.group(1))
        # destructured imports that remain
        for m in re.finditer(r'import\s+\{([^}]+)\}', line):
            for name in m.group(1).split(','):
                name = name.strip().split(' as ')[-1].strip()
                if name:
                    defined.add(name)
        # default imports
        for m in re.finditer(r'import\s+(\w+)\s+from', line):
            defined.add(m.group(1))
        # function params and arrow functions
        for m in re.finditer(r'(?:const|let)\s+\{([^}]+)\}\s*=', line):
            for name in m.group(1).split(','):
                name = name.strip().split(':')[-1].strip()
                if name:
                    defined.add(name)

    # Known globals/builtins to skip
    skip = {'console','window','document','navigator','Math','Date','JSON','Object','Array',
            'Number','String','Boolean','Promise','setTimeout','setInterval','clearTimeout',
            'clearInterval','fetch','alert','confirm','prompt','parseInt','parseFloat',
            'undefined','null','true','false','NaN','Infinity','Error','RegExp','Map','Set',
            'FormData','Blob','URL','File','FileReader','URLSearchParams','Headers',
            'Request','Response','AbortController','Event','CustomEvent','location',
            'localStorage','sessionStorage','history','performance','crypto','atob','btoa',
            'encodeURIComponent','decodeURIComponent','encodeURI','decodeURI',
            'isNaN','isFinite','React','useEffect','useState','useMemo','useCallback',
            'useRef','useReducer','useContext','useId','useNavigate','useParams',
            'useLocation','useSearchParams','useDisclosure','e','err','error','res',
            'response','result','data','item','items','prev','next','acc','val','key',
            'idx','index','i','j','el','ref','cb','fn','args','props','children',
            'event','evt','target','value','name','id','type','status','label','title',
            'description','placeholder','options','option','selected','disabled',
            'checked','required','readOnly','autoFocus','maxLength','minLength',
            'pattern','step','min','max','rows','cols','wrap','tabIndex',
            'className','style','onClick','onChange','onSubmit','onBlur','onFocus',
            'onKeyDown','onKeyUp','onKeyPress','onMouseDown','onMouseUp','onMouseMove',
            'onMouseEnter','onMouseLeave','onScroll','onResize','onLoad','onError',
            'show', 'modals', 'close', 'open', 'dayjs', 'moment'}
    
    # Check for export/downloadPdf/downloadCsv type service functions being called
    service_pattern = re.compile(r'\b(export\w+|download\w+|fetch\w+|upload\w+|import\w+)\s*\(')
    for i, line in enumerate(lines, 1):
        for m in service_pattern.finditer(line):
            fname = m.group(1)
            if fname not in defined and fname not in skip and not fname.startswith('set'):
                issues.append((i, fname, line.strip()[:120]))
    
    if issues:
        print(f"\n❌ {filepath}:")
        for lineno, fname, snippet in issues:
            print(f"   L{lineno}: '{fname}' is undefined → {snippet}")
    
    return issues

print("🔍 Scanning for broken references after refactor...\n")
all_issues = []
for root, dirs, files in os.walk('src/screens'):
    for f in files:
        if f.endswith('.jsx'):
            issues = check_file(os.path.join(root, f))
            all_issues.extend(issues)

print(f"\n{'='*60}")
print(f"Total issues found: {len(all_issues)}")
