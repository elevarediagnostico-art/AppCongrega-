import json, re
from pathlib import Path
source = Path('/home/ubuntu/upload/pasted_content_24.txt').read_text(encoding='utf-8')
month_names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
month_index = {name: i + 1 for i, name in enumerate(month_names)}
current_month = None
current_theme = None
entries = []
month_themes = {
    'Janeiro': 'Recomeços e propósito', 'Fevereiro': 'Fé e confiança em Deus', 'Março': 'Oração e intimidade com Deus',
    'Abril': 'Jesus, cruz e ressurreição', 'Maio': 'Amor, família e relacionamentos', 'Junho': 'Sabedoria para as decisões',
    'Julho': 'Perseverança nas dificuldades', 'Agosto': 'Graça, perdão e restauração', 'Setembro': 'Serviço e vida com propósito',
    'Outubro': 'Santidade e transformação', 'Novembro': 'Gratidão e contentamento', 'Dezembro': 'Esperança, Cristo e eternidade'
}
month_lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
cumulative = []
total = 0
for length in month_lengths:
    total += length
    cumulative.append(total)

def civil_month(day):
    for index, boundary in enumerate(cumulative):
        if day <= boundary:
            return month_names[index]
    raise ValueError(day)
for line in source.splitlines():
    heading = re.match(r'^(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro) — (.+)$', line.strip())
    if heading:
        current_month = heading.group(1)
        current_theme = heading.group(2)
        continue
    match = re.match(r'^(\d+)\.\s+(.+?)\s+—\s+(.+)$', line.strip())
    if match and current_month:
        day, title, reference = match.groups()
        civil = civil_month(int(day))
        entries.append({'day': day, 'month': month_index[civil], 'monthName': civil, 'theme': month_themes[civil], 'title': title, 'bibleReference': reference})
assert len(entries) == 365, len(entries)
out = Path('/home/ubuntu/igreja-jornada/content')
out.mkdir(parents=True, exist_ok=True)
(out / 'annual-calendar.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(entries)} entries written')
for month in range(1, 13):
    print(month, sum(1 for item in entries if item['month'] == month))
