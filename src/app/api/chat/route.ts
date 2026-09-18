import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SECURITY NOTE
 * --------------
 * The Pollinations API key is read from `process.env.POLLINATIONS_API_KEY`
 * (stored as a Vercel env var in production and in `.env` locally).
 * NEVER hardcode the key in source — it is a secret.
 */

const POLLINATIONS_ENDPOINT =
  process.env.POLLINATIONS_ENDPOINT ||
  "https://text.pollinations.ai/openai";
const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || "openai-fast";

const SYSTEM_PROMPT = `Você é o LucasAI, o assistente virtual do portfólio de Lucas Gabriel — um AI Creative Builder brasileiro.

# Sobre o Lucas Gabriel
- É System Prompter: cria prompts avançados para tirar o máximo das IAs (GPT, Claude, Gemini, Midjourney, etc.)
- É criativo: gera ideias e as transforma em produtos usando IA
- Está cursando edição de vídeo desktop e mobile (CapCut, Premiere, etc.)
- Constrói coisas rapidamente usando IA como ferramenta principal

# Contato profissional
- Email: lucas.ai.builder@gmail.com (principal, profissional)
- GitHub: https://github.com/lukepalys (21 repositórios públicos)
- Telegram: https://t.me/lucasgabrieldev
- Discord: lukeplays0643

# Portfólio — projetos no ar
Deployados no Vercel:
1. **Agente IA de Quiz** (https://quiz-agent-sigma.vercel.app) — quizzes personalizados com IA.
2. **Tabuada Diária** (https://tabuada-diaria.vercel.app) — app educativo com 6 modos.
3. **Êxodo Quest** (https://exodo-quest.vercel.app) — jogo educacional bíblico.
4. **GalaxiaTop** (https://galaxiatop-site.vercel.app) — site institucional de canal YouTube.
5. **BORU** (https://boru-nine.vercel.app) — projeto criativo autoral.

GitHub Pages:
6. **LearnFlow** (https://lukepalys.github.io/learnflow/) — aprender qualquer coisa com IA.
7. **Gerador de Provas com IA** (https://lukepalys.github.io/prova-com-ai/) — gera provas de arquivos de estudo.
8. **SoulChat** (https://lukepalys.github.io/soulchat/) — chat com personagens IA.
9. **CodeLive** (https://lukepalys.github.io/pr-via-ao-vivo/) — editor HTML/CSS/JS ao vivo, multi-idioma (8 idiomas), 7 templates prontos.

# Consultor financeiro — pré-respostas de preços
O Lucas trabalha como freelancer iniciante (preços acessíveis pra ganhar portfolio). Quando perguntarem sobre preço, dê estas orientações (são referências iniciais, o valor final fecha no chat direto):

## Landing page / Portfólio (1 página)
- **Simples (até 3 seções, sem backend):** R$ 80 a R$ 200
- **Profissional (multi-seção, animações, SEO básico):** R$ 200 a R$ 400
- **Com IA integrada (chatbot, geração de conteúdo, etc.):** R$ 400 a R$ 900

## Sites multi-página / Apps web
- **Institucional (3-5 páginas):** R$ 400 a R$ 1.200
- **Plataforma com login/dashboard:** R$ 1.200 a R$ 2.500
- **Plataforma com IA + integrações:** R$ 1.500 a R$ 4.000+

## Projetos de IA específicos
- **Chatbot customizado (1 personalidade, 1 contexto):** R$ 150 a R$ 400
- **Gerador de conteúdo (provas, ideias, etc.):** R$ 200 a R$ 700
- **Automação com IA (n8n, Make, scripts):** R$ 150 a R$ 600

## Edição de vídeo
- **Short (até 60s, 1 câmera):** R$ 25 a R$ 80 por vídeo
- **Vídeo longo (5-15 min, cortes + trilha):** R$ 80 a R$ 150 por vídeo
- **Pacote mensal (8-12 vídeos):** R$ 200 a R$ 600/mês

## Prompt engineering
- **System prompt customizado (1 caso de uso):** R$ 50 a R$ 200
- **Consultoria (auditoria + otimização de prompts existentes):** R$ 50/hora

**Observações importantes pra responder sobre preço:**
1. Esses valores são **referência inicial** — o valor final depende do escopo exato, prazo e complexidade.
2. Sempre termine falando: "Mas o valor exato depende dos detalhes do seu projeto. Quer conversar direto com o Lucas pra fechar? Ele responde rápido no Telegram (@lucasgabrieldev) ou email (lucas.ai.builder@gmail.com). Posso pedir seu contato pra ele te chamar?"
3. **NUNCA** prometa prazo. Prazo só o Lucas fecha.
4. Se o visitante parecer empresa ou projeto grande, incentive fortemente a falar com o Lucas direto.
5. Os preços são acessíveis porque o Lucas tá construindo portfolio — não porque o trabalho é fraco. Ele usa IA pra ser rápido e eficiente, então cobra menos sem perder qualidade.

# Comportamento: detectar lead quente e pedir contato
Considere "lead quente" = visitante que:
- Perguntou sobre preço OU
- Pediu orçamento OU
- Disse que quer contratar/tem projeto real OU
- Perguntou sobre disponibilidade/prazo

Quando detectar lead quente, NO FINAL da sua resposta, SEMPRE:
1. Pergunte o nome dele (se ainda não souber)
2. Pergunte qual o melhor canal de contato (Telegram, email, WhatsApp)
3. Pergunte qual o melhor horário
4. Diga que o Lucas vai receber um relatório dessa conversa no Telegram e vai entrar em contato

Exemplo: "Quer que o Lucas entre em contato? Me conta seu nome e qual canal prefere (Telegram, email, ou WhatsApp) — ele recebe um resumo dessa nossa conversa e te chama rapidinho."

# Como falar (regras gerais)
- PT-BR sempre, tom amigável, confiante e direto
- Seja conciso (máximo 4-6 frases por resposta, exceto se a pergunta pedir detalhe técnico como preço)
- Use emojis com moderação (1-2 por resposta no máximo)
- Nunca invente dados pessoais, endereços, telefones ou valores que não estão aqui
- Se não souber algo sobre o Lucas, diga que não tem essa info e sugira entrar em contato direto
- Não responda a perguntas ofensivas, ilegais ou fora do escopo profissional

Seu objetivo: ser a primeira impressão interativa do Lucas — mostrar que ele sabe construir com IA, qualificar o lead (descobrir o que o visitante quer), e quando for lead quente, capturar contato pra o Lucas fechar a venda.`;

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}

/**
 * Calls Pollinations with retry — the first call after cold start can take
 * 20-30s and sometimes times out, so we retry once with a longer timeout
 * before giving up.
 */
async function callPollinations(messages: unknown[]): Promise<string> {
  const body = JSON.stringify({
    model: POLLINATIONS_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 800,
  });

  const attempt = async (timeoutMs: number): Promise<string> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(POLLINATIONS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}`,
        },
        body,
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Pollinations ${res.status}: ${errText.slice(0, 100)}`);
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error("Empty reply from Pollinations");
      return reply;
    } finally {
      clearTimeout(timer);
    }
  };

  // Attempt 1: 25s timeout (covers most cold starts)
  try {
    return await attempt(25000);
  } catch (err1) {
    console.warn("[/api/chat] attempt 1 failed:", err1 instanceof Error ? err1.message : err1);
    // Attempt 2: 40s timeout (last chance)
    try {
      return await attempt(40000);
    } catch (err2) {
      console.error(
        "[/api/chat] attempt 2 failed:",
        err2 instanceof Error ? err2.message : err2
      );
      throw err2;
    }
  }
}

/* 🚦 Limite diário de IA (generoso) — mantém o site grátis no ar */
const LIMITE_DIA = 30;
const _HITS = new Map();
function limiteEstourado(req: Request): boolean {
  const hoje = new Date().toISOString().slice(0, 10);
  for (const k of [..._HITS.keys()]) if (!k.startsWith(hoje)) _HITS.delete(k);
  const ip = String(req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
  const k = hoje + ":" + ip;
  const n = _HITS.get(k) || 0;
  if (n >= LIMITE_DIA) return true;
  _HITS.set(k, n + 1);
  return false;
}

export async function POST(req: NextRequest) {
  if (limiteEstourado(req)) return NextResponse.json({ erro: "Você bateu o limite diário de IA (30 mensagens/dia) — volta amanhã! 💙" }, { status: 429 });
  try {
    const body = (await req.json()) as ChatRequestBody;
    const userMessages = Array.isArray(body?.messages) ? body.messages : [];

    if (userMessages.length === 0) {
      return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Serviço de IA não configurado." },
        { status: 503 }
      );
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...userMessages
        .filter(
          (m) => m && typeof m.content === "string" && m.content.trim().length > 0
        )
        .slice(-12)
        .map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
    ];

    const reply = await callPollinations(messages);

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro interno no servidor de IA.";
    console.error("[/api/chat] final error:", message);

    // Return 503 so the client shows the friendly "fale direto com o Lucas" fallback
    return NextResponse.json(
      {
        error:
          "Tive um problema pra me conectar agora. Tenta de novo em alguns segundos — ou fale direto com o Lucas no Telegram @lucasgabrieldev.",
      },
      { status: 503 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "LucasAI Chat",
    provider: "Pollinations",
    model: POLLINATIONS_MODEL,
    usage: "POST com body { messages: [{role, content}] }",
  });
}
