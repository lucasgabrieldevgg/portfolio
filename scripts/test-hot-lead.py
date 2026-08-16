#!/usr/bin/env python3
"""Test chat-report with hot-lead conversation."""
import json
import time
import urllib.request

URL = "https://lucas-ai.vercel.app/api/chat-report"

now_ms = int(time.time() * 1000)
payload = {
    "messages": [
        {"role": "user", "content": "Oi, quero fazer um site de portfólio", "timestamp": now_ms - 300000},
        {"role": "assistant", "content": "Boa! Conta mais sobre o que você precisa.", "timestamp": now_ms - 290000},
        {"role": "user", "content": "Quanto custa?", "timestamp": now_ms - 250000},
        {"role": "assistant", "content": "Para um portfólio: R$ 250-1.500. Quer que o Lucas entre em contato?", "timestamp": now_ms - 240000},
        {"role": "user", "content": "Sim! Meu nome é João, telegram @joaosilva", "timestamp": now_ms - 60000},
        {"role": "assistant", "content": "Perfeito João! Vou mandar seu contato pro Lucas.", "timestamp": now_ms - 50000},
    ],
    "sessionStart": now_ms - 300000,
    "sessionEnd": now_ms,
    "durationSec": 300,
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
