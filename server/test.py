from openai import OpenAI

client = OpenAI(
    api_key="AIzaSyDBv-btmTHZ0otmb6O5FyvTUATF7OowYYs",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model="gemini-3-flash-preview",
    messages=[
        {"role": "user", "content": "Create study plan for JEE student"}
    ]
)

print(response.choices[0].message.content)