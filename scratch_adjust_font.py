import os
import re

target_dir = "/Users/simran/Desktop/inquiry_app/components/Home"
exclude_dir = "IndusTreeCasaroul"
sidebar_path = "/Users/simran/Desktop/inquiry_app/components/ui/Sidebar.tsx"

files_to_process = []

# Collect all files under components/Home except IndusTreeCasaroul
for root, dirs, files in os.walk(target_dir):
    if exclude_dir in root:
        continue
    for file in files:
        if file.endswith((".tsx", ".ts")):
            files_to_process.append(os.path.join(root, file))

# Add sidebar
if os.path.exists(sidebar_path):
    files_to_process.append(sidebar_path)

print(f"Found {len(files_to_process)} files to process.")

# Regular expressions to find font size definitions:
# 1. fontSize: <num>
# 2. fontSize: <num> * <expr>
# 3. fontSize: <expr> * <num>
# 4. <someSizeVar> = <num>
# 5. <someSizeVar> = <num> * <expr>
# 6. <someSizeVar> = <expr> * <num>

# Let's define patterns we want to match and replace.
# Pattern A: fontSize: 12
# Pattern B: fontSize: 12 * scale or scale * 12
# Pattern C: companyFontSize: 16
# Pattern D: titleSize = 15 or titleSize = 15 * scale or scale * 15 (e.g. cardTitleSize, badgeSize, actionTextSize, titleSize, textFontSize, subtitleSize, etc.)

patterns = [
    # matches 'fontSize: 14' or 'fontSize: 14.5' (with optional comma or semicolon)
    (r'(fontSize\s*:\s*)(\d+\.?\d*)', lambda m: f"{m.group(1)}{float(m.group(2)) + 2:.1f}".rstrip('0').rstrip('.')),
    # matches 'fontSize\s*:\s*(\d+\.?\d*)\s*\*\s*([a-zA-Z_][a-zA-Z0-9_]*)'
    (r'(fontSize\s*:\s*)(\d+\.?\d*)(\s*\*\s*[a-zA-Z_][a-zA-Z0-9_]*)', lambda m: f"{m.group(1)}{float(m.group(2)) + 2:.1f}{m.group(3)}".rstrip('0').rstrip('.')),
    # matches 'fontSize\s*:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\*\s*(\d+\.?\d*)'
    (r'(fontSize\s*:\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\*\s*)(\d+\.?\d*)', lambda m: f"{m.group(1)}{float(m.group(2)) + 2:.1f}".rstrip('0').rstrip('.')),

    # companyFontSize: 16
    (r'(companyFontSize\s*:\s*)(\d+\.?\d*)', lambda m: f"{m.group(1)}{float(m.group(2)) + 2:.1f}".rstrip('0').rstrip('.')),

    # Variable sizes: const titleSize = 22 * scale; -> const titleSize = 24 * scale;
    # Matches 'const/let/var/  titleSize = 15' or 'titleSize = 15 * scale'
    (r'(\b[a-zA-Z0-9_]*(?:Size|FontSize)\s*=\s*)(\d+\.?\d*)', lambda m: f"{m.group(1)}{float(m.group(2)) + 2:.1f}".rstrip('0').rstrip('.')),
    # Matches 'titleSize = scale * 15'
    (r'(\b[a-zA-Z0-9_]*(?:Size|FontSize)\s*=\s*[a-zA-Z0-9_.]+\s*\*\s*)(\d+\.?\d*)', lambda m: f"{m.group(1)}{float(m.group(2)) + 2:.1f}".rstrip('0').rstrip('.')),
]

for file_path in files_to_process:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    modified = False
    
    # Apply each regex replacement pattern
    # We do a simple replacement step-by-step
    new_content = content
    for pattern, repl_func in patterns:
        new_content = re.sub(pattern, repl_func, new_content)
    
    if new_content != original_content:
        # Let's print out what files and lines changed
        orig_lines = original_content.splitlines()
        new_lines = new_content.splitlines()
        print(f"\n--- Changes in {os.path.basename(file_path)} ---")
        for i, (orig, new) in enumerate(zip(orig_lines, new_lines)):
            if orig != new:
                print(f"L{i+1}:")
                print(f"  - {orig.strip()}")
                print(f"  + {new.strip()}")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
