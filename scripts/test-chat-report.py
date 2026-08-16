#!/usr/bin/env python3
"""Test the chat-report endpoint with valid JSON."""
import json
import time
import urllib.request

URL = "https://lucas-ai.vercel.app/api/chat-report"

now_ms = int(time.time() * 1000)
payload = {
    "messages": [
        {"role": "user", "content": "Oi, quero fazer um site", "timestamp": now_ms - 120000},
        {"role": "assistant", "content": "Claro! Conta mais sobre o que você precisa.", "timestamp": now_ms - 110000},
        {"role": "user", "content": "Um portfólio pra mim, parecido com o teu", "timestamp": now_ms - 90000},
        {"role": "assistant", "content": "Boa! O Lucas faz isso rapidinho com IA. Tá na seção de contato.", "timestamp": now_ms - 80000},
        {"role": "user", "content": "Quanto custa?", "timestamp": now_ms - 30000},
    ],
    "sessionStart": now_ms - 120000,
    "sessionEnd": now_ms,
    "durationSec": 120,
    "reason": "manual",
    "userMessageCount": 3,
}

req = urllib.request.Request(
    URL,
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=60) as r:
        print("STATUS:", r.status)
        print("RESP:", r.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print(e.read().decode())
except Exception as e:
    print("ERR:", e)
