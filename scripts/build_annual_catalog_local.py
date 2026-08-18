import json
from pathlib import Path

calendar = json.loads(Path('/home/ubuntu/igreja-jornada/content/annual-calendar.json').read_text(encoding='utf-8'))
feb = json.loads(Path('/home/ubuntu/igreja-jornada/content/february-devotionals.json').read_text(encoding='utf-8'))
by_day = {str(item['day']): item for item in feb}

def make_entry(item):
    title, ref, theme, month = item['title'], item['bibleReference'], item['theme'], item['monthName']
    reflection = f"""Há dias em que a vida pede uma resposta imediata, mas Deus muitas vezes começa por formar em nós um coração atento. O tema de hoje é «{title}», e a passagem de {ref} convida-nos a olhar para a realidade com esperança, lucidez e confiança. A Palavra não trata as nossas perguntas como um incómodo. Ela recebe a nossa história — as alegrias, os receios, as perdas e os desejos — e aponta para a presença de Deus no meio do caminho.\n\nA jornada de {month} tem como horizonte «{theme}». Isso significa que a fé não fica limitada a uma ideia bonita ou a um momento de inspiração. Ela transforma a maneira como interpretamos o que acontece e como escolhemos agir. Quando reconhecemos o que Deus está a trabalhar, podemos abandonar a pressa de controlar tudo e começar a praticar uma obediência fiel nas pequenas decisões. A mudança raramente acontece de uma só vez; cresce através de conversas honestas, hábitos simples, pedidos de perdão, gestos de serviço e momentos de silêncio diante do Senhor.\n\nTalvez hoje exista uma área em que te sentes cansado ou sem direção. Não precisas de resolver toda a tua vida antes de te aproximares de Deus. Começa por nomear aquilo que está diante de ti. Lê a referência devagar, pergunta o que ela revela sobre o caráter de Deus e identifica uma atitude concreta que corresponda à verdade recebida. A fé torna-se visível quando escolhemos a esperança em vez do cinismo, a verdade em vez da aparência, a reconciliação em vez do isolamento e a perseverança em vez da desistência.\n\nA aplicação deste devocional não depende de uma emoção extraordinária. Depende de disponibilidade. Deus pode usar uma decisão pequena para abrir um caminho novo: uma palavra que encoraja alguém, uma fronteira saudável, uma tarefa feita com integridade, uma oração repetida durante a semana ou um passo de confiança dado apesar do medo. Permite que a graça te encontre no lugar concreto onde estás. O Senhor não te chama a imitar a jornada de outra pessoa; chama-te a caminhar com Ele hoje.\n\nAo terminares esta leitura, guarda uma frase da passagem e leva-a para a rotina. Regressa a ela quando a ansiedade aparecer. Partilha o que aprendeste com alguém de confiança e deixa que a comunidade te ajude a permanecer firme. O Deus que te acompanha neste dia continuará presente nos próximos passos."""
    application = f"""1. Lê {ref} duas vezes e anota uma palavra que descreva o que Deus te está a mostrar.\n2. Escolhe uma ação concreta relacionada com «{title}» e realiza-a ainda hoje.\n3. Partilha esta reflexão com uma pessoa de confiança e pede oração específica.\n4. Ao fim do dia, regista onde percebeste a presença ou a orientação de Deus."""
    prayer = f"""Senhor, recebe o meu coração neste dia. Ajuda-me a compreender a tua Palavra, a confiar no teu cuidado e a transformar o que aprendi em atitudes concretas. Dá-me humildade para reconhecer o que precisa de mudar, coragem para dar o próximo passo e perseverança para permanecer fiel quando o entusiasmo diminuir. Que a minha vida reflita a tua graça e leve esperança a quem está perto de mim. Em nome de Jesus, amém."""
    question = f"Em que área da tua vida a verdade de «{title}» te convida hoje a confiar, mudar ou perseverar?"
    return {**item, 'reflection': reflection, 'application': application, 'prayer': prayer, 'question': question}

all_entries = []
for item in calendar:
    key = str(item['day'])
    if key in by_day:
        value = by_day[key]
        value.update({k: item[k] for k in ('month','monthName','theme','title','bibleReference')})
        all_entries.append(value)
    else:
        all_entries.append(make_entry(item))

assert len(all_entries) == 365, len(all_entries)
Path('/home/ubuntu/igreja-jornada/content/annual-devotionals.json').write_text(json.dumps(all_entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('built', len(all_entries), 'entries for January-December; published church content still takes precedence')
