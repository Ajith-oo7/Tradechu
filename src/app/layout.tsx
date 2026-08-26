import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Tradechu — Find Your Next Trade",
  description:
    "Find Pokémon card collectors who have cards from your wishlist and want cards from your trade binder.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tradechu",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased safe-top">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
