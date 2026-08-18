import json
from pathlib import Path
source = Path('/home/ubuntu/igreja-jornada/content/february-devotionals.json')
out = Path('/home/ubuntu/igreja-jornada/server/devotionalCatalog.ts')
entries = json.loads(source.read_text())
out.write_text('export type DevotionalCatalogEntry = { day: string; title: string; bibleReference: string; reflection: string; application: string; prayer: string; question: string; };\n\nexport const devotionalCatalog: DevotionalCatalogEntry[] = ' + json.dumps(entries, ensure_ascii=False, indent=2) + ';\n')
print(out)
