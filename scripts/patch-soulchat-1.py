#!/usr/bin/env python3
"""Patch SoulChat with: streaming + better system prompt + Wikipedia lore."""

with open('/home/z/my-project/repos-lucas/soulchat/index.html', 'r') as f:
    content = f.read()

# ============================================================
# 1. Substituir callAI pra desativar reasoning + adicionar callAIStream
# ============================================================
old_callai = """async function callAI(aiMessages, maxTokens = 600) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages: aiMessages,
      temperature: 0.85,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error('Pollinations: ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}"""

new_callai = """async function callAI(aiMessages, maxTokens = 800) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages: aiMessages,
      temperature: 0.85,
      max_tokens: maxTokens,
      // Disable reasoning tokens — they slow down response without adding value for the user
      reasoning: { effort: 'none' },
      stream: false,
    }),
  });
  if (!res.ok) throw new Error('Pollinations: ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Streaming version — returns text word-by-word as it's generated
async function callAIStream(aiMessages, maxTokens = 800, onChunk = () => {}) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai-fast',
      messages: aiMessages,
      temperature: 0.85,
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

    // Process SSE lines
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
        // Ignore delta.reasoning (the slow part)
      } catch (e) {
        // partial JSON, skip
      }
    }
  }

  return fullText;
}"""

if old_callai in content:
    content = content.replace(old_callai, new_callai)
    print('✅ callAI substituída + callAIStream adicionada')
else:
    print('❌ callAI não encontrada')

# ============================================================
# 2. Atualizar Wikipedia search pra pegar conteúdo completo (lore)
# ============================================================
old_wiki = """// Search Wikipedia for a character
async function searchWikipedia(query) {
  const wikiLang = getWikiLang();
  // Use the search API to find the best matching page
  const searchUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw new Error('Wiki search failed');
  const searchData = await searchRes.json();
  const results = searchData?.query?.search || [];
  if (results.length === 0) return null;

  // Get the summary of the best match
  const bestTitle = results[0].title;
  const summaryUrl = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
  const summaryRes = await fetch(summaryUrl);
  if (!summaryRes.ok) throw new Error('Wiki summary failed');
  const summary = await summaryRes.json();

  return {
    title: summary.title,
    description: summary.description || '',
    extract: summary.extract || '',
    thumbnail: summary.thumbnail?.source || null,
    contentUrls: summary.content_urls,
  };
}"""

new_wiki = """// Search Wikipedia for a character — returns summary + full extract (lore)
async function searchWikipedia(query) {
  const wikiLang = getWikiLang();
  // Step 1: search for the best matching page title
  const searchUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw new Error('Wiki search failed');
  const searchData = await searchRes.json();
  const results = searchData?.query?.search || [];
  if (results.length === 0) return null;

  const bestTitle = results[0].title;

  // Step 2: get summary (short extract + thumbnail)
  const summaryUrl = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
  const summaryRes = await fetch(summaryUrl);
  if (!summaryRes.ok) throw new Error('Wiki summary failed');
  const summary = await summaryRes.json();

  // Step 3: get full extract (longer text for lore)
  let fullExtract = summary.extract || '';
  try {
    const extractUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(bestTitle)}&format=json&origin=*&exintro=0&exsectionformat=plain`;
    const extractRes = await fetch(extractUrl);
    if (extractRes.ok) {
      const extractData = await extractRes.json();
      const pages = extractData?.query?.pages || {};
      const page = Object.values(pages)[0];
      if (page?.extract) {
        // Cap at 6000 chars to keep prompt manageable
        fullExtract = page.extract.slice(0, 6000);
      }
    }
  } catch (e) {
    // keep summary.extract
  }

  return {
    title: summary.title,
    description: summary.description || '',
    extract: summary.extract || '',
    lore: fullExtract,
    thumbnail: summary.thumbnail?.source || null,
    contentUrls: summary.content_urls,
  };
}"""

if old_wiki in content:
    content = content.replace(old_wiki, new_wiki)
    print('✅ searchWikipedia atualizada (agora pega full extract = lore)')
else:
    print('❌ searchWikipedia não encontrada')

# ============================================================
# 3. Atualizar generateWithAI pra guardar lore no character
# ============================================================
old_gen = """    // Store wiki thumbnail for later use as avatar
    window._generatedThumbnail = wiki?.thumbnail || null;"""

new_gen = """    // Store wiki thumbnail + lore for later use
    window._generatedThumbnail = wiki?.thumbnail || null;
    window._generatedLore = wiki?.lore || '';"""

if old_gen in content:
    content = content.replace(old_gen, new_gen)
    print('✅ generateWithAI atualizada (guarda lore)')
else:
    print('❌ generateWithAI: trecho não encontrado')

# ============================================================
# 4. Atualizar loadFeatured pra pegar lore também
# ============================================================
old_feat = """  // Try to fetch thumbnail from Wikipedia
  character = {
    name: char.name,
    universe: char.universe,
    icon: char.icon,
    thumbnail: null,
    description: char.desc,
    traits: char.traits,
    speech: char.speech,
    greeting: '',
  };

  // Try to get wiki thumbnail in background
  try {
    const wiki = await searchWikipedia(char.wikiPage || char.name);
    if (wiki?.thumbnail) {
      character.thumbnail = wiki.thumbnail;
    }
  } catch (e) {
    // ignore — use icon
  }

  startChat();"""

new_feat = """  // Try to fetch thumbnail + lore from Wikipedia
  character = {
    name: char.name,
    universe: char.universe,
    icon: char.icon,
    thumbnail: null,
    lore: '',
    description: char.desc,
    traits: char.traits,
    speech: char.speech,
    greeting: '',
  };

  // Try to get wiki thumbnail + lore in background
  try {
    const wiki = await searchWikipedia(char.wikiPage || char.name);
    if (wiki?.thumbnail) {
      character.thumbnail = wiki.thumbnail;
    }
    if (wiki?.lore) {
      character.lore = wiki.lore;
    }
  } catch (e) {
    // ignore — use defaults
  }

  startChat();"""

if old_feat in content:
    content = content.replace(old_feat, new_feat)
    print('✅ loadFeatured atualizada (guarda lore)')
else:
    print('❌ loadFeatured: trecho não encontrado')

# ============================================================
# 5. Atualizar createCharacter pra guardar lore
# ============================================================
old_create = """  character = {
    name,
    universe: document.getElementById('charUniverse').value.trim(),
    icon: '🤖',
    thumbnail: window._generatedThumbnail || null,
    description: document.getElementById('charDesc').value.trim(),
    traits: [...selectedTraits],
    speech: document.getElementById('charSpeech').value.trim(),
    greeting: document.getElementById('charGreeting').value.trim(),
  };
  startChat();"""

new_create = """  character = {
    name,
    universe: document.getElementById('charUniverse').value.trim(),
    icon: '🤖',
    thumbnail: window._generatedThumbnail || null,
    lore: window._generatedLore || '',
    description: document.getElementById('charDesc').value.trim(),
    traits: [...selectedTraits],
    speech: document.getElementById('charSpeech').value.trim(),
    greeting: document.getElementById('charGreeting').value.trim(),
  };
  startChat();"""

if old_create in content:
    content = content.replace(old_create, new_create)
    print('✅ createCharacter atualizada (guarda lore)')
else:
    print('❌ createCharacter: trecho não encontrado')

with open('/home/z/my-project/repos-lucas/soulchat/index.html', 'w') as f:
    f.write(content)

print('\\n✅ Patch 1 aplicado com sucesso!')
