import json, urllib.request
BOT_TOKEN = "8957117877:AAHXGH7p9yZtnqhW-UiHhvAj2n436skM46E"
try:
    with urllib.request.urlopen(f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?timeout=0", timeout=20) as r:
        d = json.loads(r.read())
    if not d.get("ok"):
        print("ERR:", d.get("description"))
    else:
        results = d.get("result", [])
        print(f"Updates: {len(results)}")
        for u in results:
            msg = u.get("message") or u.get("edited_message") or {}
            chat = msg.get("chat", {})
            frm = msg.get("from", {})
            print(f"  from={frm.get('first_name','?')} @{frm.get('username','?')} | chat_id={chat.get('id')} | text={msg.get('text','')[:50]}")
except Exception as e:
    print("error:", e)
