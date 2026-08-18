import concurrent.futures as cf
import json
from pathlib import Path
from openai import OpenAI

calendar = json.loads(Path('/home/ubuntu/igreja-jornada/content/annual-calendar.json').read_text(encoding='utf-8'))
entries = [item for item in calendar if int(item['day']) > 59]
client = OpenAI()

def generate(item):
    prompt = f"""Escreva um devocional cristão original em português europeu para o dia {item['day']} do ano, no mês de {item['monthName']}, com o título '{item['title']}' e a referência bíblica '{item['bibleReference']}'. O tema do mês é '{item['theme']}'.

Produza um texto pastoral próprio, sem copiar, parafrasear de forma reconhecível ou imitar o Pão Diário, comentários bíblicos publicados ou qualquer outra obra protegida. A reflexão deve ter aproximadamente 350 a 500 palavras, ser biblicamente responsável, acolhedora e concreta, e não inventar citações bíblicas extensas. Pode mencionar a ideia central da referência em palavras próprias.

Responda somente com JSON válido com exatamente estas chaves: day, month, monthName, theme, title, bibleReference, reflection, application, prayer, question. A application deve conter 2 a 4 ações concretas; a prayer deve ser uma oração original; a question deve ser uma pergunta aberta para meditação. Preserve exatamente os valores fornecidos para day, month, monthName, theme, title e bibleReference."""
    response = client.chat.completions.create(
        model='gpt-5-mini',
        messages=[
            {'role': 'system', 'content': 'Você é um editor cristão que produz devocionais originais, claros e pastoralmente cuidadosos. Responda somente com JSON válido.'},
            {'role': 'user', 'content': prompt},
        ],
        max_completion_tokens=1900,
        extra_body={'reasoning': {'effort': 'low'}},
        response_format={'type': 'json_object'},
    )
    value = json.loads(response.choices[0].message.content)
    for key in ('day', 'month', 'monthName', 'theme', 'title', 'bibleReference'):
        value[key] = item[key]
    if len(value.get('reflection', '').split()) < 250:
        raise ValueError(f"reflection too short for day {item['day']}")
    return value

results = []
errors = []
with cf.ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(generate, item): item for item in entries}
    for future in cf.as_completed(futures):
        item = futures[future]
        try:
            results.append(future.result())
            print(f"done {item['day']}/{entries[-1]['day']}", flush=True)
        except Exception as exc:
            errors.append({'day': item['day'], 'error': str(exc)})
            print(f"error {item['day']}: {exc}", flush=True)

if errors:
    Path('/home/ubuntu/igreja-jornada/content/generation-errors.json').write_text(json.dumps(errors, ensure_ascii=False, indent=2), encoding='utf-8')
    raise SystemExit(f'{len(errors)} generation errors')
results.sort(key=lambda item: int(item['day']))
Path('/home/ubuntu/igreja-jornada/content/remaining-devotionals.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'generated {len(results)} remaining devotionals')
