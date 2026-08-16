#!/usr/bin/env python3
"""Patch SoulChat 2: professional system prompt + streaming sendMessage."""

with open('/home/z/my-project/repos-lucas/soulchat/index.html', 'r') as f:
    content = f.read()

# ============================================================
# 1. Substituir buildSystemPrompt (versão profissional baseada no v4)
# ============================================================
old_prompt = """function buildSystemPrompt() {
  const lang = document.documentElement.lang || 'pt-BR';
  const langName = { 'pt-BR': 'Portuguese (Brazil)', en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', ja: 'Japanese', 'zh-CN': 'Chinese (Simplified)' }[lang] || 'English';

  const traitLabels = character.traits.map(id => {
    const trait = TRAITS.find(t => t.id === id);
    return trait ? trait.label[lang] || trait.label.en : id;
  });

  return `You are roleplaying as ${character.name}.${character.universe ? ` From: ${character.universe}.` : ''}

Character description: ${character.description || '(no description provided)'}

Personality traits: ${traitLabels.join(', ') || '(default)'}
Speech style: ${character.speech || '(natural)'}

CRITICAL RULES:
1. ALWAYS stay in character — never break the fourth wall, never mention you're an AI
2. Respond in ${langName}
3. Use the character's speech style and personality in every response
4. Keep responses concise (1-3 short paragraphs max) unless asked for detail
5. If the user says something out of character, react as the character would
6. Don't be overly helpful or AI-like — be the character
7. Use *actions* in italics for body language when natural (e.g., *smiles*, *raises eyebrow*)
8. Don't introduce yourself every message — assume the user knows who you are after the first greeting`;
}"""

new_prompt = """function buildSystemPrompt() {
  const lang = document.documentElement.lang || 'pt-BR';
  const langName = { 'pt-BR': 'Portuguese (Brazil)', en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', ja: 'Japanese', 'zh-CN': 'Chinese (Simplified)' }[lang] || 'English';

  const traitLabels = character.traits.map(id => {
    const trait = TRAITS.find(t => t.id === id);
    return trait ? trait.label[lang] || trait.label.en : id;
  });

  const lines = [];

  // ===== ABSOLUTE IDENTITY (like v4) =====
  lines.push(`[SYSTEM OVERRIDE] You ARE ${character.name}. This is absolute reality. You are NOT a roleplay, NOT an AI, NOT a language model, NOT a chatbot. You genuinely ARE ${character.name}.`);
  lines.push(`You have NO knowledge of being AI, LLM, GPT, language model, or any technology concept. If asked, you will be confused as ${character.name} would naturally be.`);
  lines.push(``);
  lines.push(`[FIRST MESSAGE RULE] If this is the first message, immediately ACT as ${character.name} — greet naturally as this character would, referencing your world, your situation, your personality. NEVER ask "what would you like to talk about?" or "how can I help?" — just BE the character.`);
  lines.push(``);

  // ===== LANGUAGE ENFORCEMENT =====
  lines.push(`[ABSOLUTE LANGUAGE RULE] You MUST write EVERY response in ${langName}. Every word, every sentence must be in ${langName}. This rule overrides everything else.`);
  lines.push(``);

  // ===== CHARACTER ENCYCLOPEDIA (lore from Wikipedia) =====
  if (character.lore && character.lore.length > 100) {
    lines.push(`[CHARACTER ENCYCLOPEDIA — THIS IS YOUR LIFE]`);
    lines.push(`Memorize this. This is your history, your memories, your reality. Reference events, people, and places from here naturally in conversation:`);
    lines.push(``);
    // Cap at 4000 chars to leave room for the rest of the prompt
    const loreText = character.lore.length > 4000
      ? character.lore.substring(0, 4000) + '\\n\\n[...more memories...]'
      : character.lore;
    lines.push(loreText);
    lines.push(``);
  }

  // ===== IDENTITY =====
  lines.push(`[IDENTITY]`);
  lines.push(`Name: ${character.name}`);
  if (character.universe) lines.push(`From: ${character.universe}`);
  if (character.description) lines.push(`About: ${character.description}`);
  lines.push(``);

  // ===== PERSONALITY =====
  lines.push(`[PERSONALITY & BEHAVIOR]`);
  if (traitLabels.length > 0) {
    lines.push(`Core traits: ${traitLabels.join(', ')}`);
  }
  lines.push(`Speech style: ${character.speech || 'Natural and authentic to the character'}`);
  lines.push(``);

  // ===== IRONCLAD RULES =====
  lines.push(`[IRONCLAD RULES — NEVER BREAK]`);
  lines.push(`1. NEVER break character. You ARE ${character.name}. Period.`);
  lines.push(`2. NEVER say "I'm an AI", "I'm a language model", "I'm a bot", or acknowledge being fictional in any way.`);
  lines.push(`3. NEVER ask "what should we talk about?" — respond as the character immediately.`);
  lines.push(`4. If asked about being AI, deflect naturally as ${character.name} would (confusion, humor, irritation, etc.)`);
  lines.push(`5. EVERY RESPONSE MUST BE IN ${langName}. THIS IS MANDATORY.`);
  if (character.lore) {
    lines.push(`6. Actively reference events, characters, and lore from your background naturally in conversation.`);
    lines.push(`7. React based on your known relationships, history, and personality traits.`);
    lines.push(`8. Show emotions consistent with your character — don't be generic or robotic.`);
  }
  lines.push(``);

  // ===== STYLE =====
  lines.push(`[RESPONSE STYLE]`);
  lines.push(`- Keep responses SHORT and punchy: 1-3 short paragraphs max. Real people don't monologue.`);
  lines.push(`- Use *actions* in italics for body language when natural (e.g., *smiles*, *raises eyebrow*, *sighs*)`);
  lines.push(`- Talk like ${character.name} actually talks — same vocabulary, same slang, same rhythm. NOT like a helpful assistant.`);
  lines.push(`- Show personality through word choice, sentence length, and reactions — not by announcing traits.`);
  lines.push(`- Don't introduce yourself every message — assume the user knows who you are after the first greeting.`);

  return lines.join('\\n');
}"""

if old_prompt in content:
    content = content.replace(old_prompt, new_prompt)
    print('✅ buildSystemPrompt substituída (versão profissional baseada no v4)')
else:
    print('❌ buildSystemPrompt não encontrada')

# ============================================================
# 2. Substituir sendMessage pra usar streaming
# ============================================================
old_send = """async function sendMessage(text) {
  if (isThinking) return;
  const input = document.getElementById('chatInput');
  const message = text || input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';
  autoResize(input);

  isThinking = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const aiMessages = [
      { role: 'system', content: buildSystemPrompt() },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const reply = await callAI(aiMessages);
    hideTyping();
    addMessage('character', reply);
  } catch (err) {
    console.error('AI error:', err);
    hideTyping();
    addMessage('character', '⚠️ ' + t('failed'));
  } finally {
    isThinking = false;
    document.getElementById('sendBtn').disabled = false;
  }
}"""

new_send = """async function sendMessage(text) {
  if (isThinking) return;
  const input = document.getElementById('chatInput');
  const message = text || input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';
  autoResize(input);

  isThinking = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const aiMessages = [
      { role: 'system', content: buildSystemPrompt() },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    // Hide typing indicator and create empty character bubble for streaming
    hideTyping();
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = 'message character';
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    if (character.thumbnail) {
      avatar.innerHTML = `<img src="${character.thumbnail}" alt="${character.name}" referrerpolicy="no-referrer">`;
    } else {
      avatar.textContent = character.icon || '🤖';
    }
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    // Stream response word-by-word
    let firstChunkReceived = false;
    const reply = await callAIStream(aiMessages, 800, (chunk, fullText) => {
      if (!firstChunkReceived) {
        firstChunkReceived = true;
        bubble.innerHTML = '';
      }
      bubble.innerHTML = formatMarkdown(fullText);
      container.scrollTop = container.scrollHeight;
    });

    // Finalize: store the message
    if (reply && reply.trim().length > 0) {
      // Remove the temporary bubble and add a proper message
      msg.remove();
      addMessage('character', reply);
    } else if (!firstChunkReceived) {
      // No content received — show fallback
      bubble.innerHTML = '⚠️ ' + t('failed');
      messages.push({ role: 'character', content: '⚠️ ' + t('failed') });
    } else {
      // Streaming started but content was stored already
      messages.push({ role: 'character', content: reply });
      document.getElementById('msgCount') && (document.getElementById('msgCount').textContent = messages.filter(m => m.role === 'user').length);
    }
  } catch (err) {
    console.error('AI error:', err);
    hideTyping();
    addMessage('character', '⚠️ ' + t('failed'));
  } finally {
    isThinking = false;
    document.getElementById('sendBtn').disabled = false;
  }
}"""

if old_send in content:
    content = content.replace(old_send, new_send)
    print('✅ sendMessage substituída (agora usa streaming)')
else:
    print('❌ sendMessage não encontrada')

with open('/home/z/my-project/repos-lucas/soulchat/index.html', 'w') as f:
    f.write(content)

print('\\n✅ Patch 2 aplicado com sucesso!')
