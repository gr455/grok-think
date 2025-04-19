import requests

API_URL = "http://localhost:3000/chat"
headers = {
    "Content-Type": "application/json"
}

input_text = input("prompt: ")

payload = {
    "input": input_text
}

with requests.post(API_URL, json=payload, headers=headers, stream=True) as response:
    if response.status_code == 200:
        print("Response streaming...\n")
        for chunk in response.iter_lines():
            if chunk:
                print(chunk.decode('utf-8'), end="", flush=True)
    else:
        print(f"Error: {response.status_code}")
