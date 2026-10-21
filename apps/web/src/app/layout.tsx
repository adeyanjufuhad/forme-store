import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { StoreProvider } from "@/components/store-provider";
import { MotionProvider } from "@/components/motion-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FORME — Find your everyday.", template: "%s | FORME" },
  description:
    "Clothing and footwear for your everyday. Discover the FORME collection in NGN and USD.",
};
export const viewport: Viewport = { themeColor: "#F5F1E9" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body id="top">
        <StoreProvider>
          <MotionProvider>
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <Header />
            {children}
            <Footer />
          </MotionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
