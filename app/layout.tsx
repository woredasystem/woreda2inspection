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
  title: "የብልጽግና ፓርቲ የኢንስፔክሽንና የሥነምግባር ኮሚሽን",
  description:
    "የከተማ ኮሚሽን አመራሮች፣ የሰነድ ቤተ-መዛግብት እና የቀጠሮ አገልግሎት የሚሰጥ ኦፊሴላዊ መድረክ።",
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
