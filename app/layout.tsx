import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

/*
  One family, two cuts. BMW Type Next Latin is licensed and cannot ship
  here; DESIGN-bmw-m.md names Inter as the closest open substitute at the
  same 700/300 pair, with display tracking pulled to -0.5px (applied in
  the .display-* classes in globals.css).

  Deliberately not two typefaces: the contrast in this system comes from
  weight — heavy display against Light body — and adding a second family
  would blur exactly the gap that carries the voice.

  Variable, so 300 and 700 come from one file rather than two static
  cuts, and the intermediate weights the layout never asks for cost
  nothing.
*/
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} Manchester — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "used cars Manchester",
    "Japanese imports",
    "Toyota Prius Manchester",
    "hybrid cars Manchester",
    "car finance Manchester",
    "Burraq Motors",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

/*
  True black, matching the canvas the inline script applies by default.
  `colorScheme` is deliberately not declared here: globals.css sets it per theme
  on <html>, and a meta tag pinning it to dark would describe the light theme
  incorrectly.
*/
export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} h-full antialiased`}
      /*
        The script below stamps `data-js` on this element before React hydrates,
        so the server HTML deliberately lacks an attribute the client DOM has.
        Rendering it server-side instead would hide every revealed section for
        anyone without scripting — the exact failure the flag exists to prevent.
      */
      suppressHydrationWarning
    >
      <head>
        {/*
          Arms the scroll-reveal styles and selects the colour theme. Both have
          to happen before first paint: the reveal flag so content isn't shown
          and then hidden, and the theme so a visitor who chose light doesn't
          get a black flash on every navigation.

          Dark is the default, and an unreadable or absent preference falls back
          to it — the dark palette is the brand's own look, so the light one is
          opt-in rather than something the OS setting turns on unasked.

          If scripting is unavailable neither runs: content stays visible and
          the site stays dark, which are both correct resting states.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-js','');try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
