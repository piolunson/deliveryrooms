import type { Metadata, Viewport } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const garamond = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-garamond",
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "DeliveryRooms";

export const metadata: Metadata = {
  title: `${appName} — pokoje dostaw dla twórców`,
  description:
    "Zamień folder plików w pokój dostawy, który wygląda, jakbyś zrobił go sam.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2F6FEB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${manrope.variable} ${garamond.variable}`}>
      <body className="font-sans antialiased bg-white text-ink">
        {children}
      </body>
    </html>
  );
}
