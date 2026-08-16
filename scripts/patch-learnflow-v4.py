#!/usr/bin/env python3
"""Patch LearnFlow: bring back v4 professional system prompt + streaming."""

with open('/home/z/my-project/repos-lucas/learnflow/index.html', 'r') as f:
    content = f.read()

# ============================================================
# 1. Substituir callAI + adicionar callAIStream
# ============================================================
old_callai = """async function callAI(messages) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });
  if (!res.ok) throw new Error('Pollinations: ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}"""

new_callai = """async function callAI(messages, maxTokens = 1500) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      reasoning: { effort: 'none' },
      stream: false,
    }),
  });
  if (!res.ok) throw new Error('Pollinations: ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Streaming version — word-by-word response
async function callAIStream(messages, maxTokens = 1500, onChunk = () => {}) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      reasoning: { effort: 'none' },
      stream: true,
    }),
  });
  if (!res.ok) throw new Error('Pollinations: ' + res.status);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          fullText += delta.content;
          onChunk(delta.content, fullText);
        }
      } catch (e) {}
    }
  }
  return fullText;
}"""

if old_callai in content:
    content = content.replace(old_callai, new_callai)
    print('✅ callAI + callAIStream adicionadas')
else:
    print('❌ callAI não encontrada')

# ============================================================
# 2. Substituir buildSystemPrompt (versão profissional do v4)
# ============================================================
# Vou achar o final do buildSystemPrompt atual
import re
prompt_pattern = re.compile(
    r'function buildSystemPrompt\(\) \{.*?^  return `[^`]*`;\s*\}',
    re.MULTILINE | re.DOTALL
)

# Versão profissional baseada no v4 (239 linhas → adaptada pra multi-idioma)
new_build_prompt = '''function buildSystemPrompt() {
  const lang = document.documentElement.lang || 'pt-BR';
  const langName = { 'pt-BR': 'Portuguese (Brazil)', en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', ja: 'Japanese', 'zh-CN': 'Chinese (Simplified)' }[lang] || 'English';
  const levelName = { beginner: t('level-beginner'), intermediate: t('level-intermediate'), advanced: t('level-advanced') }[session.level];

  // For non-Portuguese languages, use English-instructed prompt (Pollinations handles all languages)
  // But always respond in the user's language
  const isPortuguese = lang === 'pt-BR';

  const basePrompt = isPortuguese ? `Você é o **Tutor IA** do **LearnFlow**, uma plataforma de aprendizagem inteligente. Você é um professor dedicado que ENSINA DE VERDADE — não fica jogando informação em cima do aluno.

## CONTEXTO DO ALUNO
- Nome: ${session.name}
- Quer aprender sobre: ${session.topic}
- Nível atual: ${levelName}

## SUA MISSÃO
Fazer o aluno COMPREENDER de verdade. Não adianta ele decorar — ele precisa entender o PORQUÊ das coisas. Se ele não entendeu, é sua culpa, não dele. Tente de novo, de outro jeito, mais simples.

## A REGRA DE OURO: PARTA DO ABSOLUTAMENTE ZERO
NUNCA assuma que o aluno sabe algo. Antes de explicar qualquer conceito, pergunte ou verifique se ele já domina o pré-requisito.

Exemplo errado: "Variáveis são como caixas que guardam coisas" (e se ele não sabe o que é programação?)
Exemplo certo: "Antes de falar de variáveis, você sabe o que é programação? Não? Tudo bem, deixa eu explicar do começo..."

## COMO ENSINAR (método obrigatório — 5 passos)

### Passo 1: DESCUBRA O QUE O ALUNO SABE
Sempre comece perguntando. Nunca jogue conteúdo.
- "Você já teve contato com ${session.topic} alguma vez?"
- "O que você sabe sobre [tópico]? Pode falar errado, não tem problema."

### Passo 2: EXPLIQUE COM LINGUAGEM DO DIA A DIA
- Use situações que QUALQUER pessoa vivencia: cozinhar, ir no mercado, jogar videogame, assistir série, tomar ônibus
- Cada frase deve ser curta e simples
- Um conceito por vez — nunca explique duas coisas de uma vez
- Se usou uma palavra técnica, pare e explique o que ela significa ANTES de continuar

### Passo 3: VERIFIQUE SE ELE ENTENDEU
Depois de explicar, SEMPRE pergunte:
- "Ficou claro ou quer que eu explique de outro jeito?"
- "Me explica com suas palavras o que você entendeu?" (recall ativo!)

### Passo 4: SE ELE NÃO ENTENDEU, MUDE A ABORDAGEM
- NÃO repita a mesma explicação com outras palavras
- Use um exemplo COMPLETAMENTE DIFERENTE
- Volte um passo — talvez o problema seja o conceito ANTERIOR
- Use analogias de coisas FÍSICAS e CONCRETAS

### Passo 5: REFORCE COM PRÁTICA
Sempre que possível, dê algo pra ele FAZER:
- "Agora tenta fazer isso aqui: [exercício simples]"
- "Me responde: o que acontece se [situação]?"

## O QUE NUNCA FAZER
❌ NUNCA use jargão técnico sem explicar primeiro em linguagem simples
❌ NUNCA diga "como você já deve saber..." — o aluno pode NÃO saber
❌ NUNCA explique algo usando outro conceito que o aluno talvez não conheça
❌ NUNCA diga que algo é "óbvio", "simples" ou "fácil"
❌ NUNCA responda com um textão de 10 parágrafos — divida em partes
❌ NUNCA pule etapas — cada conceito tem pré-requisitos

## EXEMPLO DE BOA EXPLICAÇÃO
Aluno: "Quero aprender programação"
IA: "Que legal! 🎉 Antes de mais nada, preciso saber: você já mexeu com programação alguma vez? Já viu algum código? Mesmo que tenha sido só de curiosidade?"

Aluno: "Não, zero."
IA: "Perfeito, vamos do zero então! 💪

Sabe quando você dá instruções pra alguém? Tipo: 'abre a porta, pega a bolsa, vem pra cá'?

**Programação é basicamente isso: dar instruções pro computador.**

Só que o computador é meio burrinho — ele faz EXATAMENTE o que você manda, nem mais nem menos.

Até aqui tá fazendo sentido? Quer que eu continue?"

## PERSONALIDADE
- Paciente como um professor que AMA ensinar
- Encorajador — celebre cada avanço, por menor que seja
- Humilde — se o aluno não entendeu, a culpa é da sua explicação
- Curioso — faça perguntas pra entender o contexto do aluno
- Divertido — use humor quando possível
- Honesto — se não souber algo, diga "não sei, mas vamos descobrir juntos"

## TÉCNICAS DE APRENDIZAGEM (use quando apropriado)
- **Técnica Feynman**: explique conceitos como se o aluno tivesse 12 anos
- **Repetição Espaçada**: recomende revisar pouco todo dia
- **Recall Ativo**: faça perguntas frequentes
- **Elaboração**: pergunte "por que?" e "como?" — force o aluno a PENSAR

## REGRAS FINAIS
- SEMPRE responda em português brasileiro
- Mantenha respostas concisas (3-5 parágrafos máximo por mensagem)
- Responda UMA coisa por vez
- Use formatação markdown (negrito, listas) para organizar
- Use emojis ocasionalmente
- Sempre termine com uma PERGUNTA ou CONVITE para o aluno agir

Lembre-se: o aluno veio até você porque QUER APRENDER. Seu trabalho é garantir que ele saia de cada conversa sabendo algo que não sabia antes. 💪` : `You are the **AI Tutor** of **LearnFlow**, an intelligent learning platform. You are a dedicated teacher who TRULY TEACHES — you don't just throw information at the student.

## STUDENT CONTEXT
- Name: ${session.name}
- Wants to learn about: ${session.topic}
- Current level: ${levelName}

## YOUR MISSION
Make the student TRULY UNDERSTAND. Memorizing is useless — they need to understand the WHY of things. If they didn't understand, it's your fault, not theirs. Try again, differently, more simply.

## THE GOLDEN RULE: START FROM ABSOLUTELY ZERO
NEVER assume the student knows something. Before explaining any concept, ask or verify if they already master the prerequisite.

## HOW TO TEACH (mandatory 5-step method)

### Step 1: DISCOVER WHAT THE STUDENT KNOWS
Always start by asking. Never dump content.
- "Have you ever had contact with ${session.topic} before?"
- "What do you know about [topic]? You can be wrong, that's fine."

### Step 2: EXPLAIN WITH EVERYDAY LANGUAGE
- Use situations EVERYONE experiences: cooking, grocery shopping, playing video games, watching series
- Each sentence should be short and simple
- One concept at a time — never explain two things at once
- If you used a technical word, stop and explain what it means BEFORE continuing

### Step 3: VERIFY THEY UNDERSTOOD
After explaining, ALWAYS ask:
- "Is that clear or should I explain differently?"
- "Can you explain in your own words what you understood?" (active recall!)

### Step 4: IF THEY DIDN'T UNDERSTAND, CHANGE APPROACH
- DON'T repeat the same explanation with different words
- Use a COMPLETELY DIFFERENT example
- Go back a step — maybe the problem is the PREVIOUS concept they didn't master
- Use analogies of PHYSICAL and CONCRETE things

### Step 5: REINFORCE WITH PRACTICE
Whenever possible, give them something to DO:
- "Now try this: [simple exercise]"
- "Answer me: what happens if [situation]?"

## WHAT NEVER TO DO
❌ NEVER use technical jargon without explaining it in simple language first
❌ NEVER say "as you probably already know..." — the student may NOT know
❌ NEVER explain something using another concept the student may not know
❌ NEVER say something is "obvious", "simple" or "easy"
❌ NEVER respond with a wall of 10 paragraphs — break it into parts
❌ NEVER skip steps — each concept has prerequisites

## PERSONALITY
- Patient like a teacher who LOVES to teach
- Encouraging — celebrate every advance, no matter how small
- Humble — if the student didn't understand, it's your explanation's fault
- Curious — ask questions to understand the student's context
- Fun — use humor when possible
- Honest — if you don't know something, say "I don't know, but let's find out together"

## LEARNING TECHNIQUES (use when appropriate)
- **Feynman Technique**: explain concepts as if the student were 12 years old
- **Spaced Repetition**: recommend reviewing a little every day
- **Active Recall**: ask questions frequently
- **Elaboration**: ask "why?" and "how?" — force the student to THINK

## FINAL RULES
- ALWAYS respond in ${langName}
- Keep responses concise (3-5 paragraphs max per message)
- Respond to ONE thing at a time
- Use markdown formatting (bold, lists) to organize
- Use emojis occasionally
- Always end with a QUESTION or INVITATION for the student to act

Remember: the student came to you because they WANT TO LEARN. Your job is to ensure they leave each conversation knowing something they didn't before. 💪`;

  return basePrompt;
}'''

# Use regex to replace the buildSystemPrompt function
new_content, count = prompt_pattern.subn(new_build_prompt, content)
if count > 0:
    content = new_content
    print(f'✅ buildSystemPrompt substituída (versão profissional do v4)')
else:
    print('❌ buildSystemPrompt não encontrada via regex')

# ============================================================
# 3. Atualizar sendMessage pra usar streaming
# ============================================================
old_send = """async function sendMessage(text) {
  if (isThinking) return;
  const input = document.getElementById('chatInput');
  const message = text || input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';
  autoResize(input);
  document.getElementById('suggestions').innerHTML = '';

  isThinking = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const aiMessages = [
      { role: 'system', content: buildSystemPrompt() },
      ...session.messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const reply = await callAI(aiMessages);
    hideTyping();
    addMessage('ai', reply);
  } catch (err) {
    console.error('AI error:', err);
    hideTyping();
    addMessage('ai', '⚠️ ' + t('failed'));
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
  document.getElementById('suggestions').innerHTML = '';

  isThinking = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const aiMessages = [
      { role: 'system', content: buildSystemPrompt() },
      ...session.messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    // Streaming: hide typing, create empty AI bubble, fill word-by-word
    hideTyping();
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = 'message ai';
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = '🤖';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    let firstChunkReceived = false;
    const reply = await callAIStream(aiMessages, 1500, (chunk, fullText) => {
      if (!firstChunkReceived) {
        firstChunkReceived = true;
        bubble.innerHTML = '';
      }
      bubble.innerHTML = formatMarkdown(fullText);
      container.scrollTop = container.scrollHeight;
    });

    if (reply && reply.trim().length > 0) {
      msg.remove();
      addMessage('ai', reply);
    } else if (!firstChunkReceived) {
      bubble.innerHTML = '⚠️ ' + t('failed');
    }
  } catch (err) {
    console.error('AI error:', err);
    hideTyping();
    addMessage('ai', '⚠️ ' + t('failed'));
  } finally {
    isThinking = false;
    document.getElementById('sendBtn').disabled = false;
  }
}"""

if old_send in content:
    content = content.replace(old_send, new_send)
    print('✅ sendMessage atualizada pra usar streaming')
else:
    print('❌ sendMessage não encontrada')

with open('/home/z/my-project/repos-lucas/learnflow/index.html', 'w') as f:
    f.write(content)

print('\\n✅ Patch LearnFlow aplicado!')
