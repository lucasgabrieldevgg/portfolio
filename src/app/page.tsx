import { AIChat } from "@/components/ai-chat";
import { ContactForm } from "@/components/contact-form";
import {
  Github,
  Send,
  Mail,
  Sparkles,
  Wand2,
  Lightbulb,
  Video,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Target,
  Code2,
  ExternalLink,
  Gamepad2,
  Brain,
  BookOpen,
  Trophy,
  Youtube,
  Calculator,
  GraduationCap,
  Baby,
  MessageSquare,
  Check,
  Crown,
  Rocket,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 grid-pattern opacity-60" />
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-700/15 blur-3xl animate-blob [animation-delay:4s]" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-pink-700/10 blur-3xl animate-blob [animation-delay:8s]" />
      </div>

      <div className="relative z-10">
        <NavBar />
        <Hero />
        <About />
        <Skills />
        <Process />
        <Portfolio />
        <Pricing />
        <Contact />
        <Footer />
      </div>

      <AIChat />
    </div>
  );
}

/* ---------------------------- NAVBAR ---------------------------- */
function NavBar() {
  const links = [
    { href: "#sobre", label: "Sobre" },
    { href: "#habilidades", label: "Habilidades" },
    { href: "#portfolio", label: "Portfólio" },
    { href: "#precos", label: "Preços" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 shadow-lg shadow-purple-900/40">
            <span className="font-display text-lg font-bold text-white">L</span>
            <span className="absolute -bottom-1 -right-1 text-xs">⚡</span>
          </div>
          <div className="leading-none">
            <div className="font-display text-lg font-semibold tracking-tight text-white">
              Lucas Gabriel
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-400">
              AI Creative Builder
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-300 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative transition hover:text-purple-400 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-purple-400 after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#contato"
          className="hidden rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-purple-700/40 sm:inline-block md:hidden lg:inline-block"
        >
          Vamos conversar
        </a>
      </div>
    </header>
  );
}

/* ---------------------------- HERO ---------------------------- */
function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center pt-32 pb-20"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
        {/* Left column - text */}
        <div className="space-y-7">
          <div className="inline-flex items-center gap-3 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300 sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            DISPONÍVEL PARA COLABORAÇÕES
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tighter sm:text-6xl md:text-7xl">
            Olá, eu sou
            <br />
            <span className="gradient-text">Lucas Gabriel</span>
          </h1>

          <p className="max-w-xl text-xl text-zinc-300 sm:text-2xl">
            Tenho ideias criativas, crio prompts poderosos e uso IA para
            construir coisas rapidamente.
          </p>

          {/* Social row */}
          <div className="flex flex-wrap gap-6 text-base text-zinc-300">
            <SocialLink
              href="https://github.com/lukepalys"
              icon={<Github className="h-5 w-5" />}
              label="@lukepalys"
              accent="hover:text-white"
            />
            <SocialLink
              href="https://t.me/lucasgabrieldev"
              icon={<Send className="h-5 w-5 text-sky-400" />}
              label="@lucasgabrieldev"
              accent="hover:text-sky-300"
            />
            <SocialLink
              href="#contato"
              icon={<Mail className="h-5 w-5 text-indigo-400" />}
              label="lukeplays0643"
              accent="hover:text-indigo-300"
            />
          </div>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#contato"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-black transition hover:bg-zinc-100"
            >
              Falar comigo
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#sobre"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:border-purple-500/50 hover:bg-purple-500/10"
            >
              Conhecer trabalho
            </a>
          </div>
        </div>

        {/* Right column - profile photo in the circle */}
        <div className="relative flex items-center justify-center">
          {/* Decorative rings */}
          <div className="absolute h-[380px] w-[380px] rounded-full border border-purple-500/20" />
          <div className="absolute h-[440px] w-[440px] rounded-full border border-purple-500/10" />
          <div className="absolute h-[500px] w-[500px] rounded-full border border-purple-500/5" />

          {/* Glow */}
          <div className="absolute h-[340px] w-[340px] rounded-full bg-purple-600/30 blur-3xl" />

          {/* The photo in the circle (bolinha no meio) */}
          <div className="animate-float">
            <img
              src="/foto-perfil.jpg"
              alt="Lucas Gabriel — AI Creative Builder"
              className="relative z-10 h-[280px] w-[280px] rounded-full border-8 border-purple-500/40 object-cover shadow-2xl shadow-purple-900/60 sm:h-[320px] sm:w-[320px] md:h-[340px] md:w-[340px]"
            />
          </div>

          {/* Floating badges */}
          <div className="absolute -left-2 top-12 z-20 hidden animate-float [animation-delay:1.5s] sm:block">
            <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5">
              <Wand2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">System Prompter</span>
            </div>
          </div>
          <div className="absolute -right-2 bottom-16 z-20 hidden animate-float [animation-delay:2.5s] sm:block">
            <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white">IA Builder</span>
            </div>
          </div>
          <div className="absolute right-8 -top-2 z-20 hidden animate-float [animation-delay:3.5s] sm:block">
            <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5">
              <Video className="h-4 w-4 text-rose-400" />
              <span className="text-sm font-medium text-white">Video Editor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#sobre"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 transition hover:text-purple-400 md:flex"
      >
        <span className="text-xs uppercase tracking-widest">Role</span>
        <div className="h-10 w-6 rounded-full border border-current p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-current" />
        </div>
      </a>
    </section>
  );
}

function SocialLink({
  href,
  icon,
  label,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("#") ? undefined : "_blank"}
      rel={href.startsWith("#") ? undefined : "noopener noreferrer"}
      className={`group flex items-center gap-2 transition ${accent}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </a>
  );
}

/* ---------------------------- ABOUT ---------------------------- */
function About() {
  return (
    <section id="sobre" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-purple-400">
          <span className="h-px w-10 bg-purple-500/50" />
          Sobre mim
        </div>
        <h2 className="font-display mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Construindo com IA,{" "}
          <span className="gradient-text">um prompt por vez.</span>
        </h2>
        <div className="space-y-5 text-lg leading-relaxed text-zinc-300">
          <p>
            Sou criativo por natureza e encontrai na IA a ferramenta perfeita
            para transformar ideias em realidade. Como{" "}
            <strong className="text-white">System Prompter</strong>, crio
            prompts avançados e estruturados que extrair o máximo de
            modelos como GPT, Claude, Gemini e outros — não é só escrever
            perguntas, é arquitetar instruções que produzem resultados
            consistentes e profissionais.
          </p>
          <p>
            Uso IA para construir rápido: do conceito ao produto, do rascunho
            ao entregável. Acelero processos que levariam dias para acontecer
            em horas, sempre mantendo o controle criativo e a qualidade do
            resultado final. A IA é minha ferramenta — a visão e a execução
            continuam sendo minhas.
          </p>
          <p>
            Atualmente curso{" "}
            <strong className="text-white">
              edição de vídeo desktop e mobile
            </strong>{" "}
            para ampliar meu repertório criativo. Combinação de prompts bem
            feitos, edição de qualidade e visão estratégica me permite
            entregar projetos completos — do conceito ao conteúdo final.
          </p>
        </div>

        {/* Quick stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value="∞" label="Ideias geradas" />
          <Stat value="100%" label="Foco em IA" />
          <Stat value="2+" label="Stacks criativas" />
          <Stat value="24/7" label="Construindo" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-5 text-center">
      <div className="font-display text-3xl font-bold gradient-text sm:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-zinc-400">
        {label}
      </div>
    </div>
  );
}

/* ---------------------------- SKILLS ---------------------------- */
function Skills() {
  const skills = [
    {
      icon: <Wand2 className="h-7 w-7" />,
      title: "System Prompter",
      description:
        "Crio prompts avançados e estruturados para tirar o máximo das IAs — GPT, Claude, Gemini, Midjourney. System prompts, few-shot, chain-of-thought e técnicas avançadas para resultados consistentes.",
      color: "from-purple-500 to-fuchsia-500",
      bgGlow: "bg-purple-500/15",
      border: "border-purple-500/30",
    },
    {
      icon: <Lightbulb className="h-7 w-7" />,
      title: "Criatividade",
      description:
        "Gero ideias e transformo elas em produtos reais usando IA como ferramenta. Brainstorming rápido, validação na prática e entrega em velocidade que só IA permite.",
      color: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/15",
      border: "border-amber-500/30",
    },
    {
      icon: <Video className="h-7 w-7" />,
      title: "Edição de Vídeo",
      description:
        "Cursando edição de vídeo desktop e mobile. CapCut, Premiere e ferramentas mobile para criar conteúdo dinâmico, cortes inteligentes e narrativas visuais que prendem atenção.",
      color: "from-rose-500 to-pink-500",
      bgGlow: "bg-rose-500/15",
      border: "border-rose-500/30",
    },
    {
      icon: <Code2 className="h-7 w-7" />,
      title: "AI Builder",
      description:
        "Construo soluções, scripts e protótipos rápidos usando IA como copiloto. Do conceito ao MVP em horas, não semanas — sempre com qualidade de produção.",
      color: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/15",
      border: "border-emerald-500/30",
    },
    {
      icon: <Target className="h-7 w-7" />,
      title: "Visão Estratégica",
      description:
        "Entendo o que cada projeto precisa e onde a IA entrega mais valor. Mapeio processo, defino escopo e uso a ferramenta certa para cada parte do problema.",
      color: "from-sky-500 to-cyan-500",
      bgGlow: "bg-sky-500/15",
      border: "border-sky-500/30",
    },
    {
      icon: <Sparkles className="h-7 w-7" />,
      title: "Execução Rápida",
      description:
        "Velocidade é hábito. Com IA bem aplicada, entrego mais em menos tempo sem abrir mão do acabamento. Iteração curta, feedback rápido, resultado final sólido.",
      color: "from-fuchsia-500 to-pink-500",
      bgGlow: "bg-fuchsia-500/15",
      border: "border-fuchsia-500/30",
    },
  ];

  return (
    <section id="habilidades" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-purple-400">
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />{" "}
          Habilidades{" "}
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />
        </div>
        <h2 className="font-display mb-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          O que eu faço melhor
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-zinc-400">
          Um mix de criatividade, técnica e domínio de ferramentas de IA para
          entregar projetos completos do conceito ao resultado.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <article
              key={s.title}
              className={`group relative overflow-hidden rounded-3xl border ${s.border} bg-zinc-900/40 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-zinc-900/70`}
            >
              <div
                className={`absolute -top-12 -right-12 h-32 w-32 rounded-full ${s.bgGlow} blur-2xl transition group-hover:scale-150`}
              />
              <div className="relative">
                <div
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}
                >
                  {s.icon}
                </div>
                <h3 className="font-display mb-2 text-xl font-semibold text-white">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {s.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- PROCESS ---------------------------- */
function Process() {
  const steps = [
    {
      number: "01",
      title: "Ideia",
      description:
        "Tudo começa com uma ideia. Brainstorm rápido, validação prática e definição clara do problema a resolver.",
      icon: <Lightbulb className="h-6 w-6" />,
    },
    {
      number: "02",
      title: "Prompt",
      description:
        "Estruturo um system prompt avançado: contexto, regras, exemplos, formato de saída. É a arquitetura que vai guiar a IA.",
      icon: <Wand2 className="h-6 w-6" />,
    },
    {
      number: "03",
      title: "Build com IA",
      description:
        "Executo usando a IA como copiloto. Itero, ajusto e refino até o resultado ter qualidade profissional.",
      icon: <Zap className="h-6 w-6" />,
    },
  ];

  return (
    <section id="processo" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-4 flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-purple-400">
          <span className="h-px w-10 bg-purple-500/50" />
          Como eu trabalho
        </div>
        <h2 className="font-display mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Processo em{" "}
          <span className="gradient-text">3 passos</span>
        </h2>
        <p className="mb-14 max-w-2xl text-lg text-zinc-400">
          Da faísca criativa ao produto final — um fluxo enxuto, repetível e
          otimizado para velocidade sem perder qualidade.
        </p>

        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Connection line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0 md:block" />

          {steps.map((s) => (
            <div
              key={s.number}
              className="glass relative rounded-3xl p-7 transition hover:border-purple-500/40 hover:bg-purple-500/5"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40">
                  {s.icon}
                </div>
                <span className="font-display text-5xl font-bold text-purple-500/20">
                  {s.number}
                </span>
              </div>
              <h3 className="font-display mb-2 text-2xl font-semibold text-white">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom flow */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
          <span className="rounded-full bg-purple-500/10 px-4 py-1.5 text-purple-300">
            Ideia
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-600" />
          <span className="rounded-full bg-purple-500/10 px-4 py-1.5 text-purple-300">
            Prompt estruturado
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-600" />
          <span className="rounded-full bg-purple-500/10 px-4 py-1.5 text-purple-300">
            IA constrói
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-600" />
          <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-white">
            Resultado
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- PORTFOLIO ---------------------------- */
function Portfolio() {
  const projects = [
    {
      title: "Agente IA de Quiz",
      tag: "Educação + IA",
      description:
        "App que cria quizzes personalizados com IA e conversa com o aluno pra explicar os erros. Backend multi-modelo: se um modelo grátis está cheio, tenta outro automaticamente.",
      url: "https://quiz-agent-sigma.vercel.app",
      source: "Deployado no Vercel",
      icon: <Brain className="h-5 w-5" />,
      gradient: "from-purple-600 to-fuchsia-600",
      tags: ["Next.js", "IA", "Educação"],
    },
    {
      title: "Tabuada Diária",
      tag: "App educativo",
      description:
        "Plataforma completa pra dominar multiplicação com 6 modos: tabela, flashcards, quiz, desafio cronometrado, dicas e plano de estudo diário. Foco em aprendizado progressivo.",
      url: "https://tabuada-diaria.vercel.app",
      source: "Deployado no Vercel",
      icon: <Calculator className="h-5 w-5" />,
      gradient: "from-amber-500 to-orange-600",
      tags: ["Educativo", "UX", "Mobile-first"],
    },
    {
      title: "Êxodo Quest",
      tag: "Jogo educacional",
      description:
        "Jogo pra aprender Êxodo 1–20 de forma interativa. Gamificação aplicada a conteúdo bíblico, com modo escuro, sistema de progressão e narrativa envolvente.",
      url: "https://exodo-quest.vercel.app",
      source: "Deployado no Vercel",
      icon: <Gamepad2 className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-600",
      tags: ["Gamificação", "Educação", "Criatividade"],
    },
    {
      title: "GalaxiaTop",
      tag: "Landing page pra canal YouTube",
      description:
        "Landing page completa que desenvolvi pra um canal de YouTube — design responsivo, link tree integrado (YouTube, Discord, Instagram, GitHub), seção de vídeo mais recente e atalhos da comunidade.",
      url: "https://galaxiatop-site.vercel.app",
      source: "Deployado no Vercel",
      icon: <Youtube className="h-5 w-5" />,
      gradient: "from-rose-500 to-red-600",
      tags: ["Landing page", "Link tree", "Projeto real"],
    },
    {
      title: "BORU",
      tag: "Projeto criativo",
      description:
        "Book Oficial das Respostas Universais — manual satírico bem-humorado documentando como 1–2 palavras substituem horas de argumentação. Projeto autoral de criatividade.",
      url: "https://boru-nine.vercel.app",
      source: "Deployado no Vercel",
      icon: <BookOpen className="h-5 w-5" />,
      gradient: "from-sky-500 to-indigo-600",
      tags: ["Criativo", "Autoral", "Conteúdo"],
    },
    {
      title: "LearnFlow — Mente Ninja",
      tag: "Plataforma de aprendizado",
      description:
        "Plataforma pra aprender QUALQUER COISA com IA como tutora pessoal. Onboarding guiado, escolha de tema (programação, matemática, inglês, ciências, música...) e chat contextual pra te levar do zero ao domínio.",
      url: "https://lukepalys.github.io/learnflow/",
      source: "GitHub Pages",
      icon: <GraduationCap className="h-5 w-5" />,
      gradient: "from-violet-500 to-purple-600",
      tags: ["IA", "Educação", "Onboarding"],
    },
    {
      title: "Gerador de Provas com IA",
      tag: "Ferramenta de estudo",
      description:
        "Gera provas personalizadas a partir dos seus arquivos de estudo (.txt, .md, .csv). Você define o número de questões e a IA cria o teste completo. Ideal pra estudantes e professores.",
      url: "https://lukepalys.github.io/prova-com-ai/",
      source: "GitHub Pages",
      icon: <BookOpen className="h-5 w-5" />,
      gradient: "from-fuchsia-500 to-pink-600",
      tags: ["IA", "Estudo", "Upload"],
    },
    {
      title: "SoulChat",
      tag: "Chat com personagens IA",
      description:
        "Plataforma pra conversar com chatbots de IA como se fossem personagens iguaizinhos — Goku, Naruto, Batman ou qualquer um que você criar. Cria personagem com pesquisa detalhada, personalidade, tom de voz e imagem.",
      url: "https://lukepalys.github.io/soulchat/",
      source: "GitHub Pages",
      icon: <MessageSquare className="h-5 w-5" />,
      gradient: "from-sky-500 to-indigo-600",
      tags: ["IA", "Chat", "Personagens"],
    },
    {
      title: "CodeLive — Editor ao Vivo",
      tag: "Ferramenta dev",
      description:
        "Editor HTML/CSS/JS ao vivo com preview instantâneo, 8 idiomas (PT-BR, EN, ES, FR, DE, IT, JP, ZH), 7 templates prontos (landing, todo, game, clock...), syntax highlighting e compartilhamento via URL. 100% client-side.",
      url: "https://lukepalys.github.io/pr-via-ao-vivo/",
      source: "GitHub Pages",
      icon: <Code2 className="h-5 w-5" />,
      gradient: "from-emerald-500 to-cyan-600",
      tags: ["HTML/CSS/JS", "CodeMirror", "Multi-idioma"],
    },
  ];

  return (
    <section id="portfolio" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-purple-400">
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />{" "}
          Portfólio{" "}
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />
        </div>
        <h2 className="font-display mb-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Projetos que <span className="gradient-text">construí</span>
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-zinc-400">
          Seleção dos projetos que mais representam como eu trabalho: IA aplicada,
          educação, criatividade e produtos reais no ar. Todo projeto aqui tá
          deployado e funcionando.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <a
              key={p.title}
              href={p.url}
              target={p.url.startsWith("#") ? undefined : "_blank"}
              rel={p.url.startsWith("#") ? undefined : "noopener noreferrer"}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-purple-500/40 hover:bg-zinc-900/70"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} text-white shadow-lg`}
                >
                  {p.icon}
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
                  {p.source}
                </span>
              </div>

              <h3 className="font-display mb-1 text-xl font-semibold text-white">
                {p.title}
              </h3>
              <div className="mb-3 text-xs font-medium uppercase tracking-wider text-purple-400">
                {p.tag}
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-400">
                {p.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-300"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-purple-300 opacity-0 transition group-hover:opacity-100">
                Abrir projeto
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://github.com/lukepalys"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:border-purple-500/50 hover:bg-purple-500/10"
          >
            <Github className="h-5 w-5" />
            Ver todos os {21} repositórios no GitHub
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- PRICING ---------------------------- */
function Pricing() {
  // Pacotes específicos organizados por categoria
  const categories = [
    {
      title: "Sites & Landing Pages",
      icon: <Rocket className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-600",
      packages: [
        {
          name: "Landing Pessoal",
          desc: "1 página, até 3 seções, sem backend. Ideal pra portfólio ou link tree.",
          price: "R$ 80 — 200",
          delivery: "2-4 dias",
          popular: false,
        },
        {
          name: "Landing Profissional",
          desc: "1 página multi-seção, animações, SEO básico, formulário de contato.",
          price: "R$ 200 — 400",
          delivery: "4-7 dias",
          popular: true,
        },
        {
          name: "Landing com IA",
          desc: "Landing page + chatbot IA integrado (LucasAI-style) pra responder visitantes.",
          price: "R$ 400 — 900",
          delivery: "7-12 dias",
          popular: false,
        },
      ],
    },
    {
      title: "Sites Multi-página & Plataformas",
      icon: <Crown className="h-5 w-5" />,
      gradient: "from-purple-600 to-fuchsia-600",
      packages: [
        {
          name: "Site Institucional",
          desc: "3-5 páginas (home, sobre, serviços, contato). Pronto pra pequeno negócio.",
          price: "R$ 400 — 1.200",
          delivery: "7-14 dias",
          popular: false,
        },
        {
          name: "Plataforma com Login",
          desc: "Multi-página + auth + dashboard. Usuário loga, vê dados, salva preferências.",
          price: "R$ 1.200 — 2.500",
          delivery: "14-21 dias",
          popular: false,
        },
        {
          name: "Plataforma IA Completa",
          desc: "Login + dashboard + IA integrada + banco de dados. Tipo LearnFlow/SoulChat.",
          price: "R$ 1.500 — 4.000+",
          delivery: "21-35 dias",
          popular: false,
        },
      ],
    },
    {
      title: "Projetos de IA",
      icon: <Brain className="h-5 w-5" />,
      gradient: "from-amber-500 to-orange-600",
      packages: [
        {
          name: "Chatbot Customizado",
          desc: "1 personalidade, 1 contexto. Tipo LucasAI — responde sobre seu negócio.",
          price: "R$ 150 — 400",
          delivery: "3-7 dias",
          popular: false,
        },
        {
          name: "Gerador de Conteúdo",
          desc: "Ferramenta que gera provas, ideias, posts, roteiros a partir de input.",
          price: "R$ 200 — 700",
          delivery: "5-10 dias",
          popular: false,
        },
        {
          name: "Automação com IA",
          desc: "Scripts n8n/Make integrando IAs pra automatizar tarefas repetitivas.",
          price: "R$ 150 — 600",
          delivery: "3-10 dias",
          popular: false,
        },
      ],
    },
    {
      title: "Serviços Avulsos",
      icon: <Video className="h-5 w-5" />,
      gradient: "from-rose-500 to-pink-600",
      packages: [
        {
          name: "Edição de Vídeo Short",
          desc: "Até 60s, 1 câmera, cortes + legenda. Ideal pra Reels/Shorts/TikTok.",
          price: "R$ 25 — 80 / vídeo",
          delivery: "1-2 dias",
          popular: false,
        },
        {
          name: "Edição de Vídeo Longo",
          desc: "5-15 min, cortes + trilha + legendas. Pacote mensal: R$ 200-600.",
          price: "R$ 80 — 150 / vídeo",
          delivery: "2-4 dias",
          popular: false,
        },
        {
          name: "Prompt Engineering",
          desc: "System prompt customizado pra 1 caso de uso. Consultoria: R$ 50/hora.",
          price: "R$ 50 — 200",
          delivery: "1-3 dias",
          popular: false,
        },
      ],
    },
  ];

  return (
    <section id="precos" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-purple-400">
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />{" "}
          Pacotes & Preços{" "}
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />
        </div>
        <h2 className="font-display mb-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Pacotes prontos{" "}
          <span className="gradient-text">pra cada necessidade</span>
        </h2>
        <p className="mx-auto mb-14 max-w-2xl text-center text-lg text-zinc-400">
          Escolha o pacote que mais combina com seu projeto. Os valores são
          referência inicial — o orçamento final fecha no chat direto, sem
          compromisso.
        </p>

        {/* Tabela de pacotes por categoria */}
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.title}>
              {/* Header da categoria */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg`}
                >
                  {cat.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                  {cat.title}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
              </div>

              {/* Tabela dos pacotes */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40">
                {/* Header da tabela (desktop) */}
                <div className="hidden grid-cols-12 gap-4 border-b border-white/10 bg-zinc-950/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:grid">
                  <div className="col-span-4">Pacote</div>
                  <div className="col-span-5">O que inclui</div>
                  <div className="col-span-1 text-center">Prazo</div>
                  <div className="col-span-2 text-right">Preço</div>
                </div>

                {/* Linhas da tabela */}
                <div className="divide-y divide-white/5">
                  {cat.packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className={`grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-purple-500/5 sm:grid-cols-12 sm:gap-4 sm:py-5 ${
                        pkg.popular ? "bg-purple-500/5" : ""
                      }`}
                    >
                      {/* Nome + badge */}
                      <div className="sm:col-span-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base font-semibold text-white">
                            {pkg.name}
                          </h4>
                          {pkg.popular && (
                            <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                              Popular
                            </span>
                          )}
                        </div>
                        {/* Mobile-only inline price */}
                        <div className="mt-1 font-display text-lg font-bold gradient-text sm:hidden">
                          {pkg.price}
                        </div>
                      </div>

                      {/* Descrição */}
                      <div className="text-sm text-zinc-400 sm:col-span-5">
                        {pkg.desc}
                      </div>

                      {/* Prazo */}
                      <div className="text-xs text-zinc-500 sm:col-span-1 sm:text-center">
                        <span className="sm:hidden font-medium text-zinc-400">
                          Prazo:{" "}
                        </span>
                        {pkg.delivery}
                      </div>

                      {/* Preço (desktop) */}
                      <div className="hidden text-right sm:col-span-2 sm:block">
                        <span className="font-display text-lg font-bold gradient-text">
                          {pkg.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-zinc-950 to-zinc-950 p-8 text-center sm:p-10">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Não achou o pacote certo?
          </h3>
          <p className="max-w-xl text-zinc-400">
            Cada projeto é único. Me conta o que você precisa e eu monto um
            pacote personalizado pra você — sem compromisso.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-7 py-3.5 text-base font-semibold text-white transition hover:shadow-xl hover:shadow-purple-700/40"
            >
              Pedir orçamento personalizado
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:lucas.ai.builder@gmail.com"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:border-purple-500/50 hover:bg-purple-500/10"
            >
              <Mail className="h-4 w-4" />
              Email direto
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center text-sm text-amber-200/80">
          <strong className="font-semibold text-amber-200">
            * Por enquanto:
          </strong>{" "}
          esses valores são os atuais enquanto o portfolio tá crescendo. Podem
          ser ajustados conforme a demanda — mas quem fechar agora trava o
          preço. 🚀
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- CONTACT ---------------------------- */
function Contact() {
  const cards = [
    {
      label: "Email",
      value: "lucas.ai.builder@gmail.com",
      href: "mailto:lucas.ai.builder@gmail.com",
      icon: <Mail className="h-6 w-6" />,
      color: "hover:border-purple-500/50 hover:text-purple-300",
    },
    {
      label: "GitHub",
      value: "@lukepalys",
      href: "https://github.com/lukepalys",
      icon: <Github className="h-6 w-6" />,
      color: "hover:border-purple-500/50 hover:text-purple-300",
    },
    {
      label: "Telegram",
      value: "@lucasgabrieldev",
      href: "https://t.me/lucasgabrieldev",
      icon: <Send className="h-6 w-6 text-sky-400" />,
      color: "hover:border-sky-500/50 hover:text-sky-300",
    },
    {
      label: "Discord",
      value: "lukeplays0643",
      href: "#",
      icon: <MessageSquare className="h-6 w-6 text-indigo-400" />,
      color: "hover:border-indigo-500/50 hover:text-indigo-300",
    },
  ];

  return (
    <section id="contato" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-purple-400">
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />{" "}
          Contato{" "}
          <span className="inline-block h-px w-10 align-middle bg-purple-500/50" />
        </div>
        <h2 className="font-display mb-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Bora conversar?
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-lg text-zinc-400">
          Tem uma ideia, projeto ou só quer trocar uma ideia sobre IA, prompts
          ou edição? Me chama — o formulário aqui do lado manda direto pro meu
          Telegram.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT — contact cards + email CTA */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("#") ? undefined : "_blank"}
                  rel={
                    c.href.startsWith("#") ? undefined : "noopener noreferrer"
                  }
                  className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition ${c.color}`}
                >
                  <div className="transition group-hover:scale-110">{c.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">
                      {c.label}
                    </div>
                    <div className="truncate font-medium text-white">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <a
              href="mailto:lucas.ai.builder@gmail.com"
              className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white transition hover:shadow-xl hover:shadow-purple-700/40"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-80">
                    Email profissional
                  </div>
                  <div className="font-semibold">
                    lucas.ai.builder@gmail.com
                  </div>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400">
              <p className="mb-2 flex items-center gap-2 font-medium text-zinc-200">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Atalhos rápidos
              </p>
              <p>
                Pode falar com o LucasAI no botão flutuante aqui do lado →
                {" "}ou mandar mensagem pelo formulário. Os dois chegam direto
                pra mim.
              </p>
            </div>
          </div>

          {/* RIGHT — contact form (Telegram webhook) */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-zinc-950 to-zinc-950 p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-400" />
              <h3 className="font-display text-xl font-semibold text-white">
                Manda direto pro meu Telegram
              </h3>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- FOOTER ---------------------------- */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
            <span className="text-sm font-bold text-white">L</span>
          </div>
          <span className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Lucas Gabriel — AI Creative Builder
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-zinc-600">
          <span>Feito com Next.js + Z.ai</span>
          <span className="hidden sm:inline">•</span>
          <a
            href="#top"
            className="transition hover:text-purple-400"
          >
            Voltar ao topo ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
