import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Codelium Company — Automação e IA para Clínicas",
  description:
    "Encha a sua agenda e reduza faltas com automações para clínicas. Capte pacientes pelo WhatsApp e Instagram, automatize agendamentos e confirmações com IA.",
  keywords: [
    "automação clínica",
    "IA saúde",
    "captação pacientes",
    "WhatsApp clínica",
    "agendamento automático",
    "Codelium Company",
  ],
  authors: [{ name: "Codelium Company" }],

  openGraph: {
    title: "Codelium Company — Automação e IA para Clínicas",
    description:
      "Encha a sua agenda e reduza faltas com automações para clínicas.",
    siteName: "Codelium Company",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
