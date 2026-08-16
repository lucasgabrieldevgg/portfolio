import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CHAT SESSION REPORT ENDPOINT
 * -----------------------------
 * Called by the AIChat component when a visitor's session ends (either by
 * manual "Encerrar" button or by 10-min inactivity timeout). Generates a
 * clean Markdown summary of the conversation and forwards it to the Lucas's
 * Telegram.
 *
 * Env vars (same as /api/contact):
 *   - TELEGRAM_BOT_TOKEN
 *   - TELEGRAM_CHAT_ID
 *   - POLLINATIONS_API_KEY (optional — used to ask IA to summarize the conversation)
 */

interface ReportMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface ReportBody {
  messages: ReportMessage[];
  sessionStart: number;
  sessionEnd: number;
  durationSec: number;
  reason: "manual" | "timeout";
  userMessageCount: number;
}

function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}min ${s}s`;
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  // Use America/Sao_Paulo timezone (Lucas's tz)
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function summarizeWithAI(
  messages: ReportMessage[]
): Promise<{ summary: string | null; isHotLead: boolean; contactCaptured: string | null }> {
  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey || messages.length < 4) {
    // Fallback: heuristic detection without AI
    const userText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ")
      .toLowerCase();
    const isHotLead = /pre[çc]o|quanto|or[çc]amento|quero|projeto|contratar|dispon[ií]vel|prazo|telegram|email|whats|@|comprar|fechar/.test(userText);
    return { summary: null, isHotLead, contactCaptured: null };
  }

  try {
    const transcript = messages
      .map(
        (m) =>
          `${m.role === "user" ? "VISITANTE" : "LUCASAI"}: ${m.content.slice(0, 400)}`
      )
      .join("\n");

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
                "Você analisa conversas entre um visitante e o LucasAI (assistente do Lucas Gabriel, que vende serviços de IA/web/vídeo). Responda APENAS com JSON válido, sem markdown, no formato: {\"summary\": \"2-3 frases em PT-BR sobre o que o visitante queria\", \"isHotLead\": true/false (true se perguntou preço, orçamento, disse que quer contratar/tem projeto, ou pediu contato), \"contactCaptured\": \"nome + canal de contato se o visitante forneceu, ou null\"}. Não invente dados. Se a conversa foi só curiosa, isHotLead=false.",
            },
            {
              role: "user",
              content: `Conversa:\n${transcript}\n\nAnalise:`,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      }
    );

    if (!res.ok) {
      // Fallback: heuristic detection
      const userText = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ")
        .toLowerCase();
      const isHotLead = /pre[çc]o|quanto|or[çc]amento|quero|projeto|contratar|dispon[ií]vel|prazo|telegram|email|whats|@|comprar|fechar/.test(userText);
      return { summary: null, isHotLead, contactCaptured: null };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data?.choices?.[0]?.message?.content?.trim() || "";

    // Try to parse as JSON; if it fails, treat raw as summary
    try {
      const cleaned = raw.replace(/^```json?\s*|\s*```$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        summary: typeof parsed.summary === "string" ? parsed.summary : null,
        isHotLead: Boolean(parsed.isHotLead),
        contactCaptured:
          typeof parsed.contactCaptured === "string" && parsed.contactCaptured.length > 0
            ? parsed.contactCaptured
            : null,
      };
    } catch {
      // JSON parse failed — use raw as summary, fallback heuristic for isHotLead
      const userText = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ")
        .toLowerCase();
      const isHotLead = /pre[çc]o|quanto|or[çc]amento|quero|projeto|contratar|dispon[ií]vel|prazo|telegram|email|whats|@|comprar|fechar/.test(userText);
      return {
        summary: raw.slice(0, 300) || null,
        isHotLead,
        contactCaptured: null,
      };
    }
  } catch {
    return { summary: null, isHotLead: false, contactCaptured: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReportBody;

    if (!body?.messages || body.messages.length === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn(
        "[/api/chat-report] Telegram not configured. Report dropped."
      );
      return NextResponse.json({
        ok: true,
        fallback: true,
        message: "Telegram ainda não configurado — relatório não enviado.",
      });
    }

    // Generate AI summary in parallel with building the report
    const userMessages = body.messages.filter((m) => m.role === "user");
    const firstUserMsg = userMessages[0]?.content?.slice(0, 80) || "(sem msg)";
    const lastUserMsg =
      userMessages[userMessages.length - 1]?.content?.slice(0, 80) ||
      "(sem msg)";

    const { summary, isHotLead, contactCaptured } = await summarizeWithAI(body.messages);

    const reasonLabel =
      body.reason === "timeout"
        ? "⏰ Encerrada por inatividade \\(10 min\\)"
        : "✋ Encerrada pelo visitante";

    // Build the report message — keep it under Telegram's 4096 char limit
    const sections: string[] = [];
    sections.push(`*📊 Relatório de conversa* \\(lucas\\-ai\\.vercel\\.app\\)`);
    sections.push(``);
    sections.push(`*${reasonLabel}*`);
    sections.push(``);

    // HOT LEAD BADGE — most important thing, goes right at the top
    if (isHotLead) {
      sections.push(`🔥 *LEAD QUENTE\\! Oportunidade real de projeto*`);
      if (contactCaptured) {
        sections.push(`*📞 Contato capturado:* ${escapeMd(contactCaptured.slice(0, 200))}`);
      } else {
        sections.push(`⚠️ _Contato não capturado — entra em contato direto pra não perder_`);
      }
      sections.push(``);
    } else {
      sections.push(`💭 _Conversa exploratória \\(sem intenção clara de contrato\\)_`);
      sections.push(``);
    }

    sections.push(`*⏱ Duração:* ${escapeMd(fmtDuration(body.durationSec))}`);
    sections.push(`*💬 Mensagens do visitante:* ${body.userMessageCount}`);
    sections.push(
      `*🕐 Início:* ${escapeMd(fmtTime(body.sessionStart))}`
    );
    sections.push(`*🕐 Fim:* ${escapeMd(fmtTime(body.sessionEnd))}`);
    sections.push(``);
    sections.push(`*Primeira msg do visitante:*`);
    sections.push(`> ${escapeMd(firstUserMsg)}`);
    sections.push(``);
    sections.push(`*Última msg do visitante:*`);
    sections.push(`> ${escapeMd(lastUserMsg)}`);

    if (summary) {
      sections.push(``);
      sections.push(`*🤖 Resumo da IA:*`);
      sections.push(escapeMd(summary.slice(0, 600)));
    }

    // Add transcript of user messages (truncated)
    sections.push(``);
    sections.push(`*📜 Mensagens do visitante:*`);
    userMessages.slice(0, 10).forEach((m, i) => {
      sections.push(
        `${i + 1}\\) ${escapeMd(m.content.slice(0, 200))}`
      );
    });

    let tgMessage = sections.join("\n");

    // Hard cap at 4000 chars (Telegram limit is 4096)
    if (tgMessage.length > 4000) {
      tgMessage = tgMessage.slice(0, 3990) + "\\n\\.\\.\\.\\(truncado\\)";
    }

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
        `[/api/chat-report] Telegram ${tgRes.status}: ${errText.slice(0, 200)}`
      );
      return NextResponse.json(
        { error: "Falha ao enviar relatório pro Telegram." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Relatório enviado pro Telegram do Lucas!",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro interno no servidor.";
    console.error("[/api/chat-report] error:", message);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "LucasAI Chat Report",
    usage:
      "POST com body { messages, sessionStart, sessionEnd, durationSec, reason, userMessageCount }",
  });
}
