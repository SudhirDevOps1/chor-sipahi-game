import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raja Mantri Chor Sipahi — Play online",
  description: "A private, four-player online version of the classic Indian guessing game.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" }
    ],
    apple: "/icon.png"
  }

};


export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className="dark">{children}</body></html>;
}

