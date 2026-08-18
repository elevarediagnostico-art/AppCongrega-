from openai import OpenAI
client = OpenAI(timeout=60, max_retries=1)
r = client.chat.completions.create(model='gpt-5-mini', messages=[{'role':'user','content':'Responda apenas JSON: {"ok": true}'}], max_completion_tokens=300, extra_body={'reasoning': {'effort': 'minimal'}}, response_format={'type':'json_object'})
print(repr(r))
