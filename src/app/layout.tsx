import "@/app/globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Fira_Code, Noto_Sans_Arabic } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/components/I18nProvider";
import { getSession } from "@/lib/auth";
import { getI18n } from "@/i18n/get-i18n";

const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const code = Fira_Code({ subsets: ["latin"], variable: "--font-code" });
const arabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" });

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = getI18n();
  return { title: dict.meta.title, description: dict.meta.description };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const { locale } = getI18n();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${heading.variable} ${body.variable} ${code.variable} ${arabic.variable} ${locale === "ar" ? "font-arabic" : "font-body"} min-h-screen bg-brand-50 text-slate-900 antialiased`}
      >
        <I18nProvider locale={locale}>
          <Navbar session={session} locale={locale} />
          <main className="min-h-[calc(100vh-8rem)]">{children}</main>
          <Footer locale={locale} />
        </I18nProvider>
      </body>
    </html>
  );
}
