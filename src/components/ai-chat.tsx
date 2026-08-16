"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Send, Bot, User, Loader2, X, Play, Square, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";
interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

type SessionState = "idle" | "active" | "ended";

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Fala! Eu sou o LucasAI, o assistente do Lucas Gabriel. Pra começar a conversar, aperta o botão \"Começar conversa\" aí embaixo. Depois de 10 minutos parado (ou quando você encerrar), o Lucas recebe um resumo no Telegram dele. Bora?",
  timestamp: Date.now(),
};

const SUGGESTIONS = [
  "O que o Lucas sabe fazer com IA?",
  "Como ele cria prompts?",
  "Quero propor um projeto, como faço?",
  "Ele edita vídeo?",
];

// 10 minutes of inactivity = session auto-ends
const INACTIVITY_MS = 10 * 60 * 1000;
// Warning at 9 min (1 min before auto-end)
const WARNING_MS = 9 * 60 * 1000;

export function AIChat() {
  const [open, setOpen] = React.useState(false);
  const [sessionState, setSessionState] = React.useState<SessionState>("idle");
  const [messages, setMessages] = React.useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sessionStart, setSessionStart] = React.useState<number | null>(null);
  const [lastActivity, setLastActivity] = React.useState<number | null>(null);
  const [showWarning, setShowWarning] = React.useState(false);
  const [reportSending, setReportSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const autoEndTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  React.useEffect(() => {
    if (open && sessionState === "active") {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open, sessionState]);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (autoEndTimerRef.current) clearTimeout(autoEndTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  const startSession = () => {
    setSessionState("active");
    setSessionStart(Date.now());
    setLastActivity(Date.now());
    setShowWarning(false);
    setMessages([GREETING]);
    scheduleTimers();
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const scheduleTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (autoEndTimerRef.current) clearTimeout(autoEndTimerRef.current);
    warningTimerRef.current = setTimeout(() => setShowWarning(true), WARNING_MS);
    autoEndTimerRef.current = setTimeout(() => {
      void endSession("timeout");
    }, INACTIVITY_MS);
  };

  const resetTimers = () => {
    setShowWarning(false);
    setLastActivity(Date.now());
    scheduleTimers();
  };

  const endSession = React.useCallback(
    async (reason: "manual" | "timeout") => {
      if (autoEndTimerRef.current) clearTimeout(autoEndTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      setShowWarning(false);
      setSessionState("ended");

      // Only send report if there were real user messages (besides greeting)
      const userMessages = messages.filter(
        (m) => m.role === "user" && m.id !== "greeting"
      );
      if (userMessages.length === 0) {
        // No conversation to report — just reset
        setTimeout(() => resetToIdle(), 1500);
        return;
      }

      setReportSending(true);
      try {
        const durationSec = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
        await fetch("/api/chat-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp,
            })),
            sessionStart,
            sessionEnd: Date.now(),
            durationSec,
            reason,
            userMessageCount: userMessages.length,
          }),
        });
      } catch {
        // swallow — report failure shouldn't block UX
      } finally {
        setReportSending(false);
      }

      // Show end-of-session message
      setMessages((prev) => [
        ...prev,
        {
          id: `end-${Date.now()}`,
          role: "assistant",
          content:
            reason === "timeout"
              ? "⏰ Conversa encerrada automaticamente após 10 minutos sem atividade. Enviei um resumo pro Lucas no Telegram dele — se quiser continuar, é só apertar \"Começar nova conversa\". 🚀"
              : "✅ Conversa encerrada. Enviei um resumo pro Lucas no Telegram dele. Se quiser conversar de novo, é só apertar \"Começar nova conversa\". 👊",
          timestamp: Date.now(),
        },
      ]);
    },
    [messages, sessionStart]
  );

  const resetToIdle = () => {
    setSessionState("idle");
    setMessages([GREETING]);
    setSessionStart(null);
    setLastActivity(null);
    setShowWarning(false);
    setInput("");
  };

  const send = async (text: string) => {
    if (sessionState !== "active") return;
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    resetTimers();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m.id !== "greeting")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 503) {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              content:
                "Tive um problema pra me conectar agora. Tenta de novo em alguns segundos — ou fala direto com o Lucas no Telegram @lucasgabrieldev.",
              timestamp: Date.now(),
            },
          ]);
          return;
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const reply =
        data.reply ?? "Não consegui responder agora. Tente novamente em instantes.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Tive um problema para me conectar agora. Tente de novo em alguns segundos — ou fale direto com o Lucas no Telegram @lucasgabrieldev.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const elapsedMin = sessionStart
    ? Math.floor((Date.now() - sessionStart) / 60000)
    : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Abrir chat com LucasAI"
          className="group fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-2xl shadow-purple-900/50 transition-all hover:scale-105 hover:shadow-purple-700/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/40"
        >
          <span className="absolute inset-0 rounded-full bg-purple-500 opacity-60 blur-xl transition-opacity group-hover:opacity-80" />
          {sessionState === "active" ? (
            <MessageSquare className="relative h-7 w-7" />
          ) : (
            <Sparkles className="relative h-7 w-7" />
          )}
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              AI
            </span>
          </span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-purple-500/20 bg-zinc-950/95 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 to-zinc-950 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-11 w-11 border-2 border-purple-500/50">
                  <AvatarImage src="/foto-perfil.jpg" alt="LucasAI" />
                  <AvatarFallback className="bg-purple-900 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-950",
                    sessionState === "active"
                      ? "bg-emerald-500"
                      : sessionState === "ended"
                        ? "bg-amber-500"
                        : "bg-zinc-500"
                  )}
                />
              </div>
              <div>
                <SheetTitle className="font-display text-lg leading-tight text-white">
                  LucasAI
                </SheetTitle>
                <p className="text-xs text-zinc-400">
                  {sessionState === "active" && `● Conversa ativa • ${elapsedMin}min`}
                  {sessionState === "idle" && "● Pronto pra começar"}
                  {sessionState === "ended" && "● Conversa encerrada"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {sessionState === "active" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                  onClick={() => endSession("manual")}
                  disabled={reportSending}
                  title="Encerrar conversa e mandar resumo pro Lucas"
                >
                  {reportSending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Square className="h-3.5 w-3.5" />
                  )}
                  Encerrar
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Inactivity warning */}
        {showWarning && sessionState === "active" && (
          <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Você tá inativo há 9 minutos. Em 1 minuto a conversa vai encerrar
              automaticamente e o Lucas vai receber o resumo no Telegram.
            </span>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="nice-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <Avatar className="h-8 w-8 border border-purple-500/40">
                <AvatarImage src="/foto-perfil.jpg" alt="LucasAI" />
                <AvatarFallback className="bg-purple-900 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-bl-sm bg-zinc-900 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                </div>
              </div>
            </div>
          )}

          {sessionState === "idle" && !loading && (
            <div className="space-y-3 pt-4">
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-zinc-900 p-5 text-center">
                <Clock className="mx-auto mb-2 h-8 w-8 text-purple-400" />
                <p className="mb-3 text-sm text-zinc-300">
                  Conversa com tempo limite de 10 minutos. Quando encerrar
                  (manualmente ou por inatividade), o Lucas recebe um resumo
                  no Telegram dele.
                </p>
                <Button
                  onClick={startSession}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Começar conversa
                </Button>
              </div>
            </div>
          )}

          {sessionState === "ended" && !loading && (
            <div className="pt-4">
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-zinc-900 p-5 text-center">
                <p className="mb-3 text-sm text-zinc-300">
                 Quer conversar de novo? Começa uma nova sessão.
                </p>
                <Button
                  onClick={startSession}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Começar nova conversa
                </Button>
              </div>
            </div>
          )}

          {sessionState === "active" &&
            messages.length === 1 &&
            !loading && (
              <div className="space-y-2 pt-2">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Sugestões
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-left text-sm text-zinc-200 transition hover:border-purple-500/50 hover:bg-purple-500/15 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="border-t border-purple-500/20 bg-zinc-950/80 p-4"
        >
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                sessionState === "active"
                  ? "Pergunte algo sobre o Lucas..."
                  : "Aperte \"Começar conversa\" acima pra falar comigo"
              }
              disabled={loading || sessionState !== "active"}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim() || sessionState !== "active"}
              className="h-10 w-10 shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-zinc-600">
            Powered by Pollinations AI • Encerra automaticamente em 10 min
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex items-start gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar
        className={cn(
          "h-8 w-8 border",
          isUser ? "border-zinc-700" : "border-purple-500/40"
        )}
      >
        {isUser ? (
          <AvatarFallback className="bg-zinc-800 text-zinc-300">
            <User className="h-4 w-4" />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src="/foto-perfil.jpg" alt="LucasAI" />
            <AvatarFallback className="bg-purple-900 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-purple-600 to-pink-600 text-white"
            : "rounded-bl-sm bg-zinc-900 text-zinc-100"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
