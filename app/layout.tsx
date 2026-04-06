import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "조이조아 | JoyJoa 커뮤니티",
  description: "작가 조남희 팬클럽 조이조아 - 따뜻한 연대, 봉사, 작가들의 성장",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="antialiased">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
