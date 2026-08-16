"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    social: "",
    message: "",
    bottrap: "", // honeypot
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Preencha pelo menos seu nome e a mensagem.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        fallback?: boolean;
        message?: string;
        error?: string;
      };

      if (res.ok && (data.ok || data.fallback)) {
        setStatus("success");
        toast.success(
          data.message || "Mensagem enviada pro Telegram do Lucas!"
        );
        setForm({ name: "", email: "", social: "", message: "", bottrap: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        toast.error(
          data.error || "Algo deu errado. Tente novamente em instantes."
        );
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      toast.error("Sem conexão agora. Tente novamente.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      {/* Honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        value={form.bottrap}
        onChange={(e) => setForm({ ...form, bottrap: e.target.value })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">
            Nome <span className="text-purple-400">*</span>
          </Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Como posso te chamar?"
            disabled={status === "loading"}
            className="border-zinc-700 bg-zinc-900/60 text-white placeholder:text-zinc-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com (opcional)"
            disabled={status === "loading"}
            className="border-zinc-700 bg-zinc-900/60 text-white placeholder:text-zinc-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="social" className="text-zinc-300">
          Rede social (opcional)
        </Label>
        <Input
          id="social"
          value={form.social}
          onChange={(e) => setForm({ ...form, social: e.target.value })}
          placeholder="@seu_insta, @seu_tg, link do seu site..."
          disabled={status === "loading"}
          className="border-zinc-700 bg-zinc-900/60 text-white placeholder:text-zinc-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-zinc-300">
          Mensagem <span className="text-purple-400">*</span>
        </Label>
        <Textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Conta a ideia, projeto ou só manda um oi..."
          disabled={status === "loading"}
          className="resize-none border-zinc-700 bg-zinc-900/60 text-white placeholder:text-zinc-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/30"
        />
      </div>

      <Button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-base font-semibold hover:from-purple-500 hover:to-pink-500 sm:w-auto"
      >
        {status === "loading" && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mensagem enviada!
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Tentar de novo
          </>
        )}
        {status === "idle" && (
          <>
            <Send className="mr-2 h-4 w-4" />
            Mandar pro Telegram do Lucas
          </>
        )}
      </Button>

      <p className="text-center text-xs text-zinc-500 sm:text-left">
        Vai direto pro Telegram do Lucas — ele responde rapidinho.
      </p>
    </form>
  );
}
