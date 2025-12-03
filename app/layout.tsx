import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pantau Aceh - Info BBM, Listrik & Elpiji",
  description: "Platform crowdsourcing info BBM, listrik, dan elpiji dari masyarakat Aceh. Pantau stok SPBU, status listrik PLN, dan ketersediaan elpiji secara realtime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Script untuk mencegah flash saat load dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var tema = localStorage.getItem('tema');
                if (tema === 'gelap') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
