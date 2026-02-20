import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "የአቃቂ ቃሊቲ ወረዳ 1 ብልፅግና ኢንስፔክሽንና ስነ ምግባር ኮሚሽን",
  description:
    "የወረዳ 1 ኮሚሽን አመራሮች፣ የሰነድ ቤተ-መዛግብት እና የቀጠሮ አገልግሎት የሚሰጥ ኦፊሴላዊ መድረክ።",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="am" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
