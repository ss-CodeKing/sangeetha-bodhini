"""Fetch teaching notation, preserving Word HTML bold octave markup."""
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path

BASE = 'https://www.shivkumar.org/music/'
SLUGS = ['lambodara', 'kundagoura', 'kerayaneeranu', 'padumanabha', 'analekara',
         'varaveena', 'kamalajathala-kalyani', 'reresrirama-arabhi', 'srirama-bhairavi']

class Paragraphs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.parts = None
        self.bold = 0
    def handle_starttag(self, tag, attrs):
        if tag == 'br' and self.parts is not None:
            self.parts.append(('~', False))
        if tag == 'p':
            self.parts = []
        if tag in ('b', 'strong'):
            self.bold += 1
    def handle_endtag(self, tag):
        if tag == 'p' and self.parts is not None:
            self.rows.append(self.parts)
            self.parts = None
        if tag in ('b', 'strong'):
            self.bold = max(0, self.bold - 1)
    def handle_data(self, data):
        if self.parts is not None:
            self.parts.append((data, self.bold > 0))

def compact(text):
    return ' '.join(text.replace('\xad', '-').split())

def fetch(url):
    cache = Path('/tmp') / (url.rsplit('/', 1)[-1])
    if cache.exists():
        raw = cache.read_bytes()
    else:
        raw = subprocess.check_output(['curl', '-fLsS', '-A', 'Mozilla/5.0', url])
    cache.write_bytes(raw)
    parser = Paragraphs()
    parser.feed(raw.decode('windows-1252'))
    return parser.rows

def plain(parts):
    return compact(''.join(p[0] for p in parts))

def geetham_rows(paragraphs):
    rows = []
    pending = None
    for parts in paragraphs:
        text = plain(parts)
        if not text:
            continue
        # Capitals = middle; bold capitals = upper; lowercase = lower octave.
        if '||' in text and re.fullmatch(r'[SRGMPDNsrgmpdn0-3.,;|\s-]+', text) and re.search('[SRGMPDN]', text):
            notation = ''
            for data, bold in parts:
                for char in data:
                    if char in 'SRGMPDN':
                        notation += char if bold else char.lower()
                    elif char in 'srgmpdn':
                        notation += char + '.'
                    else:
                        notation += char
            pending = {'sourceSwara': text, 'swara': compact(notation)}
        elif pending:
            pending['sourceSahityam'] = text
            rows.append(pending)
            pending = None
    if pending:
        raise ValueError('Unpaired swara row: ' + str(pending))
    return rows

if __name__ == '__main__':
    output = {'fetched': '2026-10-17', 'geethams': []}
    for slug in SLUGS:
        print(slug, flush=True)
        url = BASE + 'varnams/' + slug + '-geetham.htm'
        output['geethams'].append({'slug': slug, 'url': url, 'rows': geetham_rows(fetch(url))})
    paragraphs = fetch(BASE + 'basics/alankaram.htm')
    lines = [compact(line) for parts in paragraphs for line in plain(parts).split('~')]
    output['alankaras'] = [line for line in lines if '||' in line and re.fullmatch(r'[srgmpdnSRGMPDN,|\s]+', line)]
    Path('tests/fixtures/advanced-notation.json').write_text(json.dumps(output, indent=2) + '\n')
