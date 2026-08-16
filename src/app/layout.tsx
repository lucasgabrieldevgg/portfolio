import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lucas Gabriel | AI Creative Builder",
  description:
    "Portfólio profissional do Lucas Gabriel — System Prompter, criativo e builder com IA. Crio prompts avançados e uso IA para construir ideias rapidamente.",
  keywords: [
    "Lucas Gabriel",
    "AI Creative Builder",
    "System Prompter",
    "Inteligência Artificial",
    "Portfólio",
    "Prompt Engineering",
    "Edição de Vídeo",
  ],
  authors: [{ name: "Lucas Gabriel" }],
  openGraph: {
    title: "Lucas Gabriel | AI Creative Builder",
    description:
      "Tenho ideias criativas, crio prompts poderosos e uso IA para construir coisas rapidamente.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucas Gabriel | AI Creative Builder",
    description:
      "Tenho ideias criativas, crio prompts poderosos e uso IA para construir coisas rapidamente.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/foto-perfil.jpg", sizes: "any" },
    ],
    apple: "/foto-perfil.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
