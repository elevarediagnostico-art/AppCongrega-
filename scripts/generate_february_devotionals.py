import json
import concurrent.futures as cf
from pathlib import Path
from openai import OpenAI

ENTRIES = [
("32", "Fé quando não vemos", "Hebreus 11:1"),
("33", "Confiando além das circunstâncias", "2 Coríntios 5:7"),
("34", "A fé de Abraão", "Romanos 4:20-21"),
("35", "Quando a dúvida aparece", "Marcos 9:24"),
("36", "Deus continua no controle", "Salmo 46:1-3"),
("37", "Não temer as tempestades", "Marcos 4:39-40"),
("38", "O Deus que provê", "Filipenses 4:19"),
("39", "Quando a resposta demora", "Daniel 10:12-13"),
("40", "A fé que persevera", "Tiago 1:2-4"),
("41", "Confiar no caráter de Deus", "Números 23:19"),
("42", "Fé em tempos difíceis", "Habacuque 3:17-18"),
("43", "O poder de uma pequena fé", "Mateus 17:20"),
("44", "Deus ouve quando clamamos", "Jeremias 33:3"),
("45", "Descansando nas promessas", "2 Pedro 1:3-4"),
("46", "Quando Deus parece distante", "Salmo 13:1-6"),
("47", "O Deus que não abandona", "Hebreus 13:5"),
("48", "Caminhando pela fé", "Hebreus 11:8"),
("49", "Confiança em meio à incerteza", "Salmo 37:5"),
("50", "A paz de quem confia", "Isaías 26:3"),
("51", "Deus é nosso refúgio", "Salmo 62:5-8"),
("52", "Fé que produz ação", "Tiago 2:17"),
("53", "O testemunho da fidelidade", "Salmo 40:1-3"),
("54", "Esperar sem perder a esperança", "Romanos 15:13"),
("55", "Deus é maior que o problema", "1 João 4:4"),
("56", "Permanecer firme", "Efésios 6:13-14"),
("57", "A fé que atravessa a noite", "Salmo 30:5"),
("58", "Olhando para Jesus", "Hebreus 12:1-2"),
("59", "Confiando até o fim", "Mateus 24:13"),
]

client = OpenAI()

def generate(item):
    day, title, reference = item
    prompt = f"""Crie um devocional cristão original em português europeu para o Dia {day}, com o título '{title}' e referência bíblica '{reference}'. O ciclo mensal é 'Fé e confiança'. Não copie nem imite o Pão Diário ou qualquer texto publicado; escreva uma reflexão pastoral própria, clara, terna e concreta, entre 400 e 600 palavras. Não invente citações bíblicas extensas: use apenas a referência e uma breve paráfrase se necessário. Produza JSON válido com exatamente estas chaves: day (string), title (string), bibleReference (string), reflection (string), application (string), prayer (string), question (string). A aplicação deve ser prática e a oração deve ser original."""
    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": "Você é um editor de devocionais cristãos originais. Responda somente com JSON válido."},
            {"role": "user", "content": prompt},
        ],
        max_completion_tokens=1400,
        extra_body={"reasoning": {"effort": "low"}},
        response_format={"type": "json_object"},
    )
    value = json.loads(response.choices[0].message.content)
    value["day"] = day
    value["title"] = title
    value["bibleReference"] = reference
    return value

with cf.ThreadPoolExecutor(max_workers=4) as executor:
    generated = list(executor.map(generate, ENTRIES))

generated.sort(key=lambda item: int(item["day"]))
out = Path("/home/ubuntu/igreja-jornada/content")
out.mkdir(parents=True, exist_ok=True)
(out / "february-devotionals.json").write_text(json.dumps(generated, ensure_ascii=False, indent=2) + "\n")
print(f"generated {len(generated)} devotionals")
print("output:", out / "february-devotionals.json")
