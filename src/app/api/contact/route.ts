import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SECURE CONTACT FORM ENDPOINT
 * -----------------------------
 * Receives contact form submissions from the portfolio site and forwards
 * them to the Lucas's Telegram via a Bot. No third-party service, no DB —
 * just a serverless function calling the Telegram Bot API.
 *
 * Env vars (stored encrypted in Vercel + locally in .env):
 *   - TELEGRAM_BOT_TOKEN  (from @BotFather)
 *   - TELEGRAM_CHAT_ID    (Lucas's personal user id, get via @userinfobot)
 *
 * The visitor never sees these — they live only in the server environment.
 */

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  social?: string;
  bottrap?: string; // honeypot — should stay empty
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactBody;

    // Honeypot — silently drop bots
    if (body.bottrap && body.bottrap.trim().length > 0) {
      return NextResponse.json({ ok: true }); // pretend success
    }

    const name = (body.name || "").trim().slice(0, 100);
    const email = (body.email || "").trim().slice(0, 200);
    const message = (body.message || "").trim().slice(0, 4000);
    const social = (body.social || "").trim().slice(0, 200);

    if (!name || !message) {
      return NextResponse.json(
        { error: "Nome e mensagem são obrigatórios." },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // If Telegram isn't configured yet, we still acknowledge — fall back to email
    if (!botToken || !chatId) {
      console.warn(
        "[/api/contact] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Message dropped:",
        { name, email, messagePreview: message.slice(0, 80) }
      );
      return NextResponse.json({
        ok: true,
        fallback: true,
        message:
          "Mensagem recebida! Mas o Lucas ainda não conectou o Telegram. Fale direto com ele: lucas.ai.builder@gmail.com",
      });
    }

    // Build a clean Telegram message (Markdown)
    const escapeMd = (s: string) =>
      s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");

    const tgMessage = [
      `*Nova mensagem de contato* \\(lucas\\-ai\\.vercel\\.app\\)`,
      ``,
      `*Nome:* ${escapeMd(name)}`,
      email ? `*Email:* ${escapeMd(email)}` : `*Email:* _não informado_`,
      social ? `*Rede social:* ${escapeMd(social)}` : ``,
      ``,
      `*Mensagem:*`,
      `${escapeMd(message)}`,
      ``,
      `_Enviado via formulário do portfólio_`,
    ]
      .filter(Boolean)
      .join("\n");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: tgMessage,
          parse_mode: "MarkdownV2",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!tgRes.ok) {
      const errText = await tgRes.text().catch(() => "");
      console.error(
        `[/api/contact] Telegram ${tgRes.status}: ${errText.slice(0, 200)}`
      );
      return NextResponse.json(
        {
          error:
            "Não consegui enviar agora. Tente de novo em alguns segundos — ou mande direto pro lucas.ai.builder@gmail.com",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Mensagem enviada! O Lucas vai ver no Telegram agora. 🚀",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro interno no servidor.";
    console.error("[/api/contact] error:", message);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Lucas Contact",
    usage: "POST com body { name, email, message, social }",
  });
}
