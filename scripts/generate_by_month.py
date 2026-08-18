import concurrent.futures as cf
import json, time
from pathlib import Path
from openai import OpenAI

calendar = json.loads(Path('/home/ubuntu/igreja-jornada/content/annual-calendar.json').read_text(encoding='utf-8'))
months = {}
for item in calendar:
    if int(item['day']) > 59:
        months.setdefault(item['month'], []).append(item)
client = OpenAI(timeout=90, max_retries=2)
out_dir = Path('/home/ubuntu/igreja-jornada/content/monthly-devotionals')
out_dir.mkdir(parents=True, exist_ok=True)

def generate(month, items):
    payload = '\n'.join(f"Dia {i['day']}: {i['title']} — {i['bibleReference']}" for i in items)
    prompt = f"""Crie os devocionais originais de todo o mês {items[0]['monthName']} ({len(items)} dias), cujo tema é '{items[0]['theme']}'.

Calendário editorial:
{payload}

Para cada dia, escreva um devocional cristão original em português europeu, com aproximadamente 250 a 350 palavras de reflexão, sem copiar ou imitar o Pão Diário, comentários publicados ou qualquer obra protegida. Seja pastoralmente cuidadoso, concreto e biblicamente responsável. Não invente citações bíblicas extensas; explique em palavras próprias.

Responda somente com um JSON válido contendo a chave 'entries', cujo valor é uma lista com exatamente {len(items)} objetos. Cada objeto deve ter exatamente: day, month, monthName, theme, title, bibleReference, reflection, application, prayer, question. Preserve exatamente os títulos, referências e números do calendário. A aplicação deve ter 2 a 4 ações práticas; a oração e a pergunta devem ser originais."""
    for attempt in range(3):
        try:
            response = client.chat.completions.create(model='gpt-5-mini', messages=[
                {'role':'system','content':'Você é um editor de devocionais originais. Responda somente com JSON válido.'},
                {'role':'user','content':prompt}], max_completion_tokens=16000, extra_body={'reasoning': {'effort': 'minimal'}}, response_format={'type':'json_object'})
            raw = response.choices[0].message.content
            if not raw: raise ValueError('empty response')
            values = json.loads(raw).get('entries')
            if not isinstance(values, list) or len(values) != len(items): raise ValueError(f'expected {len(items)} entries')
            by_day = {str(i['day']): i for i in items}
            for value in values:
                key = str(value.get('day'))
                if key not in by_day or len(value.get('reflection','').split()) < 160: raise ValueError(f'invalid entry {key}')
                for field in ('month','monthName','theme','title','bibleReference'): value[field] = by_day[key][field]
            result = sorted(values, key=lambda x: int(x['day']))
            path = out_dir / f"{month:02d}.json"
            path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            print(f'saved month {month}: {len(result)}', flush=True)
            return result
        except Exception as exc:
            print(f'retry month {month}: {exc}', flush=True)
            time.sleep(3 * (attempt + 1))
    raise RuntimeError(f'failed month {month}')

with cf.ThreadPoolExecutor(max_workers=2) as executor:
    futures = {executor.submit(generate, month, items): month for month, items in sorted(months.items())}
    for future in cf.as_completed(futures):
        future.result()
print('all months generated')
