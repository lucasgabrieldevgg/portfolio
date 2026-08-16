#!/usr/bin/env python3
"""Patch Prova-com-ai: bring back v4 features + faster response."""

with open('/home/z/my-project/repos-lucas/prova-com-ai/index.html', 'r') as f:
    content = f.read()

# ============================================================
# 1. Aumentar limite de questões de 15 pra 50 (igual original)
# ============================================================
old_input = '<input type="number" id="numQuestions" value="5" min="1" max="15">'
new_input = '<input type="number" id="numQuestions" value="5" min="1" max="50">'

if old_input in content:
    content = content.replace(old_input, new_input)
    print('✅ Limite de questões: 15 → 50')
else:
    print('❌ input numQuestions não encontrado')

# ============================================================
# 2. Desativar reasoning tokens no callAI (deixa mais rápido)
# ============================================================
old_callai = """async function callAI(messages) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages,
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });
  if (!res.ok) throw new Error('Pollinations error: ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}"""

new_callai = """async function callAI(messages) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages,
      temperature: 0.5,
      max_tokens: 3500,
      reasoning: { effort: 'none' },
      stream: false,
    }),
  });
  if (!res.ok) throw new Error('Pollinations error: ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}"""

if old_callai in content:
    content = content.replace(old_callai, new_callai)
    print('✅ callAI: reasoning desativado + max_tokens aumentado')
else:
    print('❌ callAI não encontrada')

# ============================================================
# 3. Melhorar o system prompt (mais rigoroso, como o original)
# ============================================================
# Vou achar o userPrompt dentro do generateQuiz
old_prompt_start = """  const systemPrompt = `You are a quiz generator. Create educational quizzes in ${langName}. Always respond with valid JSON only — no markdown, no code blocks, just the JSON object.`;"""

new_prompt_start = """  const systemPrompt = `You are a university professor creating rigorous educational quizzes in ${langName}. You ALWAYS respond with valid JSON only — no markdown, no code fences, just the JSON object.

CRITICAL RULES:
- Base questions ONLY on the study material provided (when available)
- Questions must be challenging but fair
- Each question must test understanding, not just memorization
- Wrong options (distractors) must be plausible — never obviously wrong
- The hint should help the student think, NOT give away the answer
- All output must be in ${langName}`;"""

if old_prompt_start in content:
    content = content.replace(old_prompt_start, new_prompt_start)
    print('✅ System prompt melhorado (rigoroso como original)')
else:
    print('❌ systemPrompt não encontrado')

# ============================================================
# 4. Melhorar o userPrompt pra incluir dica (igual original)
# ============================================================
old_user_prompt = """  const userPrompt = `Create a quiz with the following specifications:
- Number of questions: ${numQ}
- Difficulty: ${level}
- Topic: ${topic || '(derived from the study files)'}
${context ? `- Study material context:\\n${context.slice(0, 6000)}` : ''}

Each question should have 4 options (a, b, c, d) with exactly one correct answer.
Include a brief explanation for why the correct answer is right.

Respond ONLY with this JSON format (no markdown, no code fences):
{
  "questions": [
    {
      "question": "The question text",
      "options": {
        "a": "Option A text",
        "b": "Option B text",
        "c": "Option C text",
        "d": "Option D text"
      },
      "correct": "a",
      "explanation": "Brief explanation why 'a' is correct"
    }
  ]
}`;"""

new_user_prompt = """  const userPrompt = `Create a quiz with the following specifications:
- Number of questions: ${numQ}
- Difficulty: ${level}
- Topic: ${topic || '(derived from the study files)'}
${context ? `- Study material context (use ONLY this material for the questions):\\n${context.slice(0, 8000)}` : ''}

STRICT REQUIREMENTS:
1. Each question must have EXACTLY 4 options: a, b, c, d
2. Only ONE correct answer per question
3. For each question, provide a HINT that helps the student think — but does NOT reveal the answer directly
4. The 3 wrong options must be PLAUSIBLE (common misconceptions, similar concepts, etc.) — never obviously wrong
5. Questions should test UNDERSTANDING, not just memorization
6. Vary the question types: definitions, applications, scenarios, comparisons

Respond ONLY with this JSON format (no markdown, no code fences, no preamble):
{
  "questions": [
    {
      "question": "The question text",
      "options": {
        "a": "Option A text",
        "b": "Option B text",
        "c": "Option C text",
        "d": "Option D text"
      },
      "correct": "a",
      "hint": "A hint that guides thinking without revealing the answer",
      "explanation": "Detailed explanation of why 'a' is correct AND why the others are wrong"
    }
  ]
}`;"""

if old_user_prompt in content:
    content = content.replace(old_user_prompt, new_user_prompt)
    print('✅ User prompt melhorado (com hint + explanation detalhada)')
else:
    print('❌ userPrompt não encontrado')

# ============================================================
# 5. Renderizar a dica (hint) na exibição da questão
# ============================================================
old_render = """  quiz.questions.forEach((q, i) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question';
    qDiv.dataset.correct = q.correct;
    qDiv.innerHTML = `
      <div class="question-header">
        <div class="question-num">${i + 1}</div>
        <div class="question-text">${escapeHtml(q.question)}</div>
      </div>
      <div class="options">
        ${['a', 'b', 'c', 'd'].map(letter => `
          <label class="option" data-letter="${letter}">
            <input type="radio" name="q${i}" value="${letter}">
            <span class="option-letter">${letter.toUpperCase()}.</span>
            <span>${escapeHtml(q.options[letter] || '')}</span>
          </label>
        `).join('')}
      </div>
      <div class="explanation" style="display:none;">
        <strong>${t('explanation')}:</strong> ${escapeHtml(q.explanation || '')}
      </div>
    `;
    content.appendChild(qDiv);
  });"""

new_render = """  quiz.questions.forEach((q, i) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question';
    qDiv.dataset.correct = q.correct;
    const hintHtml = q.hint ? `
      <div class="hint" style="margin-left:40px;margin-top:8px;padding:8px 12px;background:rgba(251,191,36,0.08);border-left:3px solid var(--warning);border-radius:6px;font-size:12px;color:var(--text-dim);">
        <strong style="color:var(--warning);">💡 ${t('hint')}:</strong> ${escapeHtml(q.hint)}
      </div>
    ` : '';
    qDiv.innerHTML = `
      <div class="question-header">
        <div class="question-num">${i + 1}</div>
        <div class="question-text">${escapeHtml(q.question)}</div>
      </div>
      <div class="options">
        ${['a', 'b', 'c', 'd'].map(letter => `
          <label class="option" data-letter="${letter}">
            <input type="radio" name="q${i}" value="${letter}">
            <span class="option-letter">${letter.toUpperCase()}.</span>
            <span>${escapeHtml(q.options[letter] || '')}</span>
          </label>
        `).join('')}
      </div>
      ${hintHtml}
      <div class="explanation" style="display:none;">
        <strong>${t('explanation')}:</strong> ${escapeHtml(q.explanation || '')}
      </div>
    `;
    content.appendChild(qDiv);
  });"""

if old_render in content:
    content = content.replace(old_render, new_render)
    print('✅ Hint agora aparece na questão (antes da resposta)')
else:
    print('❌ render quiz não encontrado')

# ============================================================
# 6. Adicionar chave 'hint' nas traduções
# ============================================================
i18n_additions = [
    ("'pt-BR':", "    'hint': 'Dica',"),
    ("en: {", "    'hint': 'Hint',"),
    ("es: {", "    'hint': 'Pista',"),
    ("fr: {", "    'hint': 'Indice',"),
    ("de: {", "    'hint': 'Tipp',"),
    ("it: {", "    'hint': 'Suggerimento',"),
    ("ja: {", "    'hint': 'ヒント',"),
    ("'zh-CN': {", "    'hint': '提示',"),
]

# Find each language block and add hint after explanation
import re
for lang_marker, hint_line in i18n_additions:
    # Find pattern: lang_marker followed by lines, then 'explanation' line, add hint after
    pattern = re.compile(
        r'(' + re.escape(lang_marker) + r'[^}]*?\'explanation\':\s*\'[^\']*\',\n)',
        re.DOTALL
    )
    matches = pattern.findall(content)
    if matches:
        for match in matches:
            if "'hint':" not in match:
                # Insert hint line after explanation
                new_block = match + '  ' + hint_line + '\n'
                content = content.replace(match, new_block, 1)
                print(f'✅ hint adicionada em {lang_marker}')
                break
    else:
        print(f'⚠️ {lang_marker}: bloco não encontrado')

with open('/home/z/my-project/repos-lucas/prova-com-ai/index.html', 'w') as f:
    f.write(content)

print('\\n✅ Patch Prova-com-ai aplicado!')
