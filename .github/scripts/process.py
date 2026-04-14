import os
import json
import re
import string
import random
import datetime

def generate_short_id(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def parse_issue_body(body):
    original_url = None
    custom_alias = None
    
    url_match = re.search(r"### (?:URL Gốc|Original URL)\s+(https?://[^\s]+)", body)
    if url_match:
        original_url = url_match.group(1).strip()
        
    alias_match = re.search(r"### (?:Bí Danh Tùy Chỉnh \(Tùy chọn\)|Custom Alias)\s+([^\s]+)", body)
    if alias_match and alias_match.group(1).strip() != "_No response_":
        custom_alias = alias_match.group(1).strip()
        
    return original_url, custom_alias

def main():
    body = os.environ.get("ISSUE_BODY", "")
    issue_number = os.environ.get("ISSUE_NUMBER")
    
    original_url, custom_alias = parse_issue_body(body)
    
    if not original_url:
        print("Không tìm thấy URL hợp lệ trong nội dung Issue.")
        return

    links_file = "links.json"
    if os.path.exists(links_file):
        with open(links_file, "r", encoding="utf-8") as f:
            try:
                links = json.load(f)
            except json.JSONDecodeError:
                links = []
    else:
        links = []

    short_id = custom_alias
    
    if short_id:
        if any(link.get("id") == short_id for link in links):
            print(f"Bí danh {short_id} đã tồn tại.")
            short_id = short_id + "-" + generate_short_id(3)
    else:
        while True:
            short_id = generate_short_id()
            if not any(link.get("id") == short_id for link in links):
                break

    redirect_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url={original_url}">
</head>
<body>
    <p>Đang chuyển hướng đến <a href="{original_url}">{original_url}</a>...</p>
    <script>window.location.href = "{original_url}";</script>
</body>
</html>"""

    short_dir = os.path.join("s", short_id)
    os.makedirs(short_dir, exist_ok=True)
    with open(os.path.join(short_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(redirect_html)

    now = datetime.datetime.utcnow().isoformat() + "Z"
    new_link = {
        "id": short_id,
        "original_url": original_url,
        "created_at": now,
        "clicks": 0,
        "issue_number": issue_number
    }
    
    links.insert(0, new_link)
    
    with open(links_file, "w", encoding="utf-8") as f:
        json.dump(links, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated short link: s/{short_id}")
    
    with open("SHORT_ID.txt", "w") as f:
        f.write(short_id)

if __name__ == "__main__":
    main()
