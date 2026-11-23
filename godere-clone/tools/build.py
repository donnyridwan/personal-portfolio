"""Build a static, script-free reconstruction of godere.framer.website from captured SSR HTML.
Assets are downloaded into site/assets and referenced locally."""
import re, os, sys, hashlib, json, urllib.request, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF, OUT = os.path.join(ROOT, 'ref'), os.path.join(ROOT, 'site')
ASSETS = os.path.join(OUT, 'assets')
os.makedirs(ASSETS, exist_ok=True)
manifest = {}
URL_RE = re.compile(r'https://framerusercontent\.com/(?:images|assets|third-party-assets)/[^"\'\s)\\,&?]+(?:\?[^"\'\s)\\,]*)?')

def fetch(url):
    base = url.split('?')[0]
    m = re.search(r'scale-down-to=(\d+)', url)
    key = base + ('?scale-down-to=' + m.group(1) if m else '')
    if key in manifest: return manifest[key]['file']
    name = base.rsplit('/', 1)[-1]
    if m: stem, ext = name.rsplit('.', 1); name = f'{stem}-{m.group(1)}.{ext}'
    # Fetch the exact URL with Chrome's UA/Accept: framerusercontent negotiates AVIF/WebP per full query, as for the browser.
    cached = [f for f in os.listdir(ASSETS) if f.rsplit('.', 1)[0] == name.rsplit('.', 1)[0]]
    if cached: name = cached[0]
    else:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'})
        resp = urllib.request.urlopen(req, timeout=60); data = resp.read()
        ctype = resp.headers.get('content-type', '')
        ext = {'image/webp': 'webp', 'image/avif': 'avif'}.get(ctype)
        if ext: name = name.rsplit('.', 1)[0] + '.' + ext
        open(os.path.join(ASSETS, name), 'wb').write(data)
    dest = os.path.join(ASSETS, name)
    data = open(dest, 'rb').read()
    manifest[key] = {'file': name, 'source': url, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    return name

def build(src, dst, depth):
    s = open(src, encoding='utf-8').read()
    prefix = '../' * depth
    # drop scripts, module preloads, framer badge, editor hooks, lenis css
    s = re.sub(r'<script\b[^>]*>.*?</script>', '', s, flags=re.S)
    s = re.sub(r'<link[^>]*(modulepreload|preconnect|dns-prefetch|lenis|framer\.com/edit)[^>]*>', '', s)
    s = re.sub(r'<div id="__framer-badge-container">.*?</a></div>', '', s, flags=re.S)
    s = re.sub(r'<meta name="framer-search-index[^>]*>', '', s)
    # localise assets
    s = URL_RE.sub(lambda m: prefix + 'assets/' + fetch(html.unescape(m.group(0))), s)
    # internal links -> .html files
    s = re.sub(r'href="\./projects/([a-z0-9-]+)"', r'href="./projects/\1.html"', s)
    s = re.sub(r'href="\.\./(#[a-z]+)?"', lambda m: 'href="../index.html%s"' % (m.group(1) or ''), s)
    s = re.sub(r'href="\./(#[a-z]+)?"', lambda m: 'href="./index.html%s"' % (m.group(1) or ''), s)
    if depth: s = re.sub(r'href="\./([a-z0-9-]+)"', r'href="./\1.html"', s)
    # runtime replacement (appear animations, smooth anchor scroll)
    s = s.replace('</head>', f'<link rel="stylesheet" href="{prefix}vendor/lenis.css"><link rel="stylesheet" href="{prefix}clone.css"></head>')
    s = s.replace('</body>', f'<script src="{prefix}vendor/lenis.min.js" defer></script><script src="{prefix}clone.js" defer></script></body>')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, 'w', encoding='utf-8').write(s)

build(os.path.join(REF, 'index.html'), os.path.join(OUT, 'index.html'), 0)
for f in sorted(os.listdir(os.path.join(REF, 'projects'))):
    build(os.path.join(REF, 'projects', f), os.path.join(OUT, 'projects', f), 1)
json.dump(manifest, open(os.path.join(OUT, 'assets', 'manifest.json'), 'w'), indent=1)
print(len(manifest), 'assets')
