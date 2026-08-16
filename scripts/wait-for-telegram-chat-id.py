#!/usr/bin/env python3
"""Polls Telegram bot getUpdates until a chat_id arrives, then prints it."""
import json
import time
import urllib.request

BOT_TOKEN = "8957117877:AAHXGH7p9yZtnqhW-UiHhvAj2n436skM46E"
TIMEOUT_SECONDS = 180
POLL_INTERVAL = 3


def get_updates(offset=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    if offset is not None:
        url += f"?offset={offset}"
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.loads(r.read())


def get_bot_username():
    try:
        with urllib.request.urlopen(
            f"https://api.telegram.org/bot{BOT_TOKEN}/getMe", timeout=10
        ) as r:
            return json.loads(r.read())["result"]["username"]
    except Exception:
        return "?"


def main():
    bot_user = get_bot_username()
    print(f"🔍 Monitoring bot @{bot_user} for new messages...")
    print(f"⏰ Will wait up to {TIMEOUT_SECONDS}s.")
    print(f"👉 Open https://t.me/{bot_user} and send any message (e.g. /start or 'oi').")
    print()
    start = time.time()
    last_update_id = 0
    seen = set()

    while time.time() - start < TIMEOUT_SECONDS:
        try:
            data = get_updates(offset=last_update_id + 1 if last_update_id else None)
            for u in data.get("result", []):
                uid = u.get("id", 0)
                if uid in seen:
                    continue
                seen.add(uid)
                last_update_id = max(last_update_id, uid)
                msg = u.get("message") or u.get("edited_message") or {}
                chat = msg.get("chat", {})
                frm = msg.get("from", {})
                chat_id = chat.get("id")
                username = frm.get("username", "?")
                first_name = frm.get("first_name", "?")
                text = msg.get("text", "")
                print(f"✅ Got message!")
                print(f"   From: {first_name} (@{username})")
                print(f"   chat_id: {chat_id}")
                print(f"   text: {text[:80]}")
                print()
                print(f"=== TELEGRAM_CHAT_ID={chat_id} ===")
                return 0
        except Exception as e:
            print(f"⚠️ poll error: {e}")
        time.sleep(POLL_INTERVAL)

    print("⏰ Timeout — no messages received.")
    print("Did you open https://t.me/lucasdevggbot and send a message?")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
