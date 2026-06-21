import type { Metadata } from "next";
import { Fraunces, Space_Grotesk, Space_Mono } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import "@/styles/global.css";
import "@/styles/components.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Book Undo",
  description:
    "Book Undo is a community book circulation and donation network. Donate, borrow, and share books, and sponsor textbooks for schools.",
  openGraph: {
    title: "Book Undo",
    description:
      "Book Undo is a community book circulation and donation network. Donate, borrow, and share books, and sponsor textbooks for schools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>"
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="grain" aria-hidden="true"></div>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
