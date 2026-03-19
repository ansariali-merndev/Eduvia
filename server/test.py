from openai import OpenAI

client = OpenAI(
    api_key="AIzaSyD5SJV1OUutlAUEWL-rfveff94lG5d7OnE",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model="gemini-3-flash-preview",
    messages=[
        {"role": "user", "content": "Create study plan for JEE student"}
    ]
)

print(response.choices[0].message.content)