import "@/app/globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Fira_Code } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";

const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const code = Fira_Code({ subsets: ["latin"], variable: "--font-code" });

export const metadata: Metadata = {
  title: "KORRIGO — Révise intelligemment. Réussis facilement.",
  description:
    "KORRIGO fusionne la rigueur académique avec l'intelligence artificielle pour faciliter la réussite étudiante. Sujets d'examen corrigés classés par faculté, filière et niveau.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="fr">
      <body
        className={`${heading.variable} ${body.variable} ${code.variable} font-body min-h-screen bg-white text-slate-900 antialiased`}
      >
        <Navbar session={session} />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
