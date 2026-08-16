import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TELEGRAM WEBHOOK — makes the bot interactive
 * ----------------------------------------------
 * Telegram sends a POST here every time someone messages the bot.
 * We parse the command and reply accordingly.
 *
 * Security: Telegram sends a secret token in the `X-Telegram-Bot-Api-Secret-Token`
 * header. We verify it matches the env var TELEGRAM_WEBHOOK_SECRET.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
  };
}

// ===================== COMMANDS =====================

const COMMANDS: Record<string, (firstName: string) => string> = {
  start: (firstName) =>
    `👋 *Fala${firstName ? ", " + firstName : ""}!*\n\n` +
    "Eu sou o *LucasAI Bot* — o assistente do portfólio do *Lucas Gabriel*, AI Creative Builder 🚀\n\n" +
    "Posso te ajudar com:\n" +
    "• 🚀 Ver os projetos que ele já fez\n" +
    "• 💰 Conhecer os preços e pacotes\n" +
    "• 📞 Pegar as formas de contato\n" +
    "• 🟢 Ver status dos sites no ar\n\n" +
    "*Digita /help* pra ver tudo que eu faço, ou acessa o portfólio completo: 👇\n" +
    "🌐 https://lucas-ai.vercel.app",

  help: () =>
    "*🤖 Comandos disponíveis:*\n\n" +
    "• /start — Mensagem de boas-vindas\n" +
    "• /projetos — Lista de projetos no ar\n" +
    "• /precos — Tabela de preços e pacotes\n" +
    "• /contato — Formas de contato\n" +
    "• /sobre — Sobre o Lucas\n" +
    "• /status — Status dos sites\n" +
    "• /help — Esta mensagem\n\n" +
    "💡 *Dica:* também dá pra falar com o LucasAI direto no site — tem um botão flutuante no canto inferior direito em https://lucas-ai.vercel.app",

  projetos: () =>
    "*🚀 Projetos no ar:*\n\n" +
    "*Deployados no Vercel:*\n" +
    "1️⃣ Agente IA de Quiz — https://quiz-agent-sigma.vercel.app\n" +
    "2️⃣ Tabuada Diária — https://tabuada-diaria.vercel.app\n" +
    "3️⃣ Êxodo Quest — https://exodo-quest.vercel.app\n" +
    "4️⃣ GalaxiaTop — https://galaxiatop-site.vercel.app\n" +
    "5️⃣ BORU — https://boru-nine.vercel.app\n\n" +
    "*GitHub Pages:*\n" +
    "6️⃣ LearnFlow (IA tutora) — https://lukepalys.github.io/learnflow/\n" +
    "7️⃣ Gerador de Provas com IA — https://lukepalys.github.io/prova-com-ai/\n" +
    "8️⃣ SoulChat (personagens IA) — https://lukepalys.github.io/soulchat/\n" +
    "9️⃣ CodeLive (editor ao vivo) — https://lukepalys.github.io/pr-via-ao-vivo/\n\n" +
    "🌐 Portfólio completo: https://lucas-ai.vercel.app/#portfolio",

  precos: () =>
    "*💰 Pacotes e preços:*\n\n" +
    "*Sites & Landing Pages:*\n" +
    "• Landing Pessoal — R$ 80-200\n" +
    "• Landing Profissional — R$ 200-400\n" +
    "• Landing com IA — R$ 400-900\n\n" +
    "*Sites Multi-página & Plataformas:*\n" +
    "• Site Institucional — R$ 400-1.200\n" +
    "• Plataforma com Login — R$ 1.200-2.500\n" +
    "• Plataforma IA Completa — R$ 1.500-4.000+\n\n" +
    "*Projetos de IA:*\n" +
    "• Chatbot Customizado — R$ 150-400\n" +
    "• Gerador de Conteúdo — R$ 200-700\n" +
    "• Automação com IA — R$ 150-600\n\n" +
    "*Serviços Avulsos:*\n" +
    "• Edição de Vídeo Short — R$ 25-80/vídeo\n" +
    "• Edição Longo — R$ 80-150/vídeo\n" +
    "• Prompt Engineering — R$ 50-200\n\n" +
    "💡 *Valores de referência* — orçamento final fecha no chat. Tabela completa: https://lucas-ai.vercel.app/#precos",

  contato: () =>
    "*📞 Formas de contato:*\n\n" +
    "📧 *Email:* lucas.ai.builder@gmail.com\n" +
    "💬 *Telegram:* @lucasgabrieldev\n" +
    "🐙 *GitHub:* github.com/lukepalys\n" +
    "🎮 *Discord:* lukeplays0643\n\n" +
    "🌐 *Portfólio:* https://lucas-ai.vercel.app\n\n" +
    "💡 *Dica:* o formulário no site manda direto pra esse bot — resposta rápida garantida!",

  sobre: () =>
    "*👤 Sobre o Lucas Gabriel:*\n\n" +
    "🚀 *AI Creative Builder* — usa IA pra construir coisas rapidamente\n\n" +
    "*O que ele faz:*\n" +
    "• 🧠 System Prompter (prompts avançados pra GPT/Claude/Gemini)\n" +
    "• 💡 Criativo (ideias → produtos com IA)\n" +
    "• 🎬 Edição de vídeo (desktop & mobile)\n" +
    "• 💻 Dev (sites, plataformas, apps)\n\n" +
    "*Stack favorita:*\n" +
    "Next.js + TypeScript + Tailwind + shadcn/ui + Pollinations AI + Telegram Bot API\n\n" +
    "🌐 Conhece mais: https://lucas-ai.vercel.app/#sobre",

  status: async () => {
    const sites = [
      { name: "lucas-ai.vercel.app", url: "https://lucas-ai.vercel.app/" },
      { name: "quiz-agent-sigma.vercel.app", url: "https://quiz-agent-sigma.vercel.app/" },
      { name: "tabuada-diaria.vercel.app", url: "https://tabuada-diaria.vercel.app/" },
      { name: "exodo-quest.vercel.app", url: "https://exodo-quest.vercel.app/" },
      { name: "galaxiatop-site.vercel.app", url: "https://galaxiatop-site.vercel.app/" },
      { name: "boru-nine.vercel.app", url: "https://boru-nine.vercel.app/" },
      { name: "learnflow (GitHub Pages)", url: "https://lukepalys.github.io/learnflow/" },
      { name: "prova-com-ai (GitHub Pages)", url: "https://lukepalys.github.io/prova-com-ai/" },
      { name: "soulchat (GitHub Pages)", url: "https://lukepalys.github.io/soulchat/" },
      { name: "pr-via-ao-vivo (GitHub Pages)", url: "https://lukepalys.github.io/pr-via-ao-vivo/" },
    ];

    const results = await Promise.all(
      sites.map(async (s) => {
        try {
          const res = await fetch(s.url, {
            method: "HEAD",
            signal: AbortSignal.timeout(8000),
            redirect: "follow",
          });
          return { ...s, ok: res.ok, status: res.status };
        } catch {
          return { ...s, ok: false, status: 0 };
        }
      })
    );

    const online = results.filter((r) => r.ok).length;
    const offline = results.filter((r) => !r.ok);

    let text = `*🟢 Status dos sites:*\n\n*${online}/${results.length} online* ✅\n\n`;
    results.forEach((r) => {
      text += `${r.ok ? "✅" : "❌"} ${r.name}\n`;
    });

    if (offline.length > 0) {
      text += `\n⚠️ *Atenção:* ${offline.length} site(s) offline.`;
    } else {
      text += `\n🎉 *Tudo funcionando perfeitamente!*`;
    }

    return text;
  },
};

// ===================== FALLBACK (IA response) =====================

async function aiFallback(userText: string): Promise<string> {
  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    return "🤖 Não entendi esse comando. Digita /help pra ver o que posso fazer!";
  }

  try {
    const res = await fetch(
      process.env.POLLINATIONS_ENDPOINT || "https://text.pollinations.ai/openai",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.POLLINATIONS_MODEL || "openai-fast",
          messages: [
            {
              role: "system",
              content:
                "Você é o LucasAI Bot no Telegram. Responda em PT-BR de forma curta (2-4 frases). Você é o assistente do portfólio do Lucas Gabriel (AI Creative Builder). Se perguntarem algo que não sabe, sugira visitar https://lucas-ai.vercel.app ou usar /help. Seja amigável e direto. Use emojis com moderação.",
            },
            { role: "user", content: userText },
          ],
          temperature: 0.6,
          max_tokens: 300,
          reasoning: { effort: "none" },
        }),
      }
    );
    if (!res.ok) throw new Error("Pollinations: " + res.status);
    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content?.trim() ||
      "🤖 Não consegui processar agora. Tenta /help pra ver os comandos!"
    );
  } catch {
    return "🤖 Tive um problema agora. Tenta /help pra ver os comandos disponíveis!";
  }
}

// ===================== TELEGRAM HELPERS =====================

async function sendTelegramMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });
}

// ===================== MAIN HANDLER =====================

export async function POST(req: NextRequest) {
  // Verify secret token (Telegram sends it in header)
  if (WEBHOOK_SECRET) {
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    if (secretHeader !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const update = (await req.json()) as TelegramUpdate;
    const msg = update.message;
    if (!msg || !msg.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || "";
    const text = msg.text.trim();

    // Check if it's a command (starts with /)
    if (text.startsWith("/")) {
      const command = text.split(" ")[0].slice(1).toLowerCase().split("@")[0];
      const handler = COMMANDS[command];

      if (handler) {
        const reply = await handler(firstName);
        await sendTelegramMessage(chatId, reply);
      } else {
        await sendTelegramMessage(
          chatId,
          `🤔 Não conheço o comando *${command}*. Digita /help pra ver o que posso fazer!`
        );
      }
    } else {
      // Not a command — use IA fallback for natural language
      const reply = await aiFallback(text);
      await sendTelegramMessage(chatId, reply);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/telegram-webhook] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "LucasAI Telegram Webhook",
    commands: Object.keys(COMMANDS),
  });
}
