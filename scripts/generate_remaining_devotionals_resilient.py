import concurrent.futures as cf
import json
import time
from pathlib import Path
from openai import OpenAI

calendar = json.loads(Path('/home/ubuntu/igreja-jornada/content/annual-calendar.json').read_text(encoding='utf-8'))
entries = [item for item in calendar if int(item['day']) > 59]
out_path = Path('/home/ubuntu/igreja-jornada/content/remaining-devotionals.json')
existing = {}
if out_path.exists():
    for item in json.loads(out_path.read_text(encoding='utf-8')):
        existing[item['day']] = item
client = OpenAI()

def generate(item):
    prompt = f"""Escreva um devocional cristão original em português europeu para o dia {item['day']} do ano, no mês de {item['monthName']}, com o título '{item['title']}' e a referência bíblica '{item['bibleReference']}'. O tema do mês é '{item['theme']}'.

Produza uma reflexão pastoral própria de aproximadamente 300 a 450 palavras, sem copiar ou imitar o Pão Diário, comentários bíblicos publicados ou qualquer obra protegida. Seja biblicamente responsável, acolhedor e concreto. Não invente citações bíblicas extensas; use a referência e explique a ideia em palavras próprias.

Responda somente com JSON válido com as chaves day, month, monthName, theme, title, bibleReference, reflection, application, prayer e question. A application deve conter 2 a 4 ações concretas, a prayer deve ser original e a question deve ser aberta. Preserve exatamente os valores fornecidos para day, month, monthName, theme, title e bibleReference."""
    for attempt in range(4):
        try:
            response = client.chat.completions.create(
                model='gpt-5-mini',
                messages=[
                    {'role': 'system', 'content': 'Você é um editor cristão que produz devocionais originais. Responda somente com JSON válido.'},
                    {'role': 'user', 'content': prompt},
                ],
                max_completion_tokens=1700,
                extra_body={'reasoning': {'effort': 'minimal'}},
                response_format={'type': 'json_object'},
            )
            raw = response.choices[0].message.content
            if not raw:
                raise ValueError('empty model response')
            value = json.loads(raw)
            if len(value.get('reflection', '').split()) < 220:
                raise ValueError('reflection too short')
            for key in ('day', 'month', 'monthName', 'theme', 'title', 'bibleReference'):
                value[key] = item[key]
            return value
        except Exception as exc:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)

results = dict(existing)
missing = [item for item in entries if item['day'] not in results]
print(f'need {len(missing)} entries', flush=True)
with cf.ThreadPoolExecutor(max_workers=3) as executor:
    futures = {executor.submit(generate, item): item for item in missing}
    for future in cf.as_completed(futures):
        item = futures[future]
        value = future.result()
        results[value['day']] = value
        out_path.write_text(json.dumps(sorted(results.values(), key=lambda x: int(x['day'])), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f"saved {value['day']} ({len(results)}/{len(entries)})", flush=True)
print(f'complete {len(results)} entries')
