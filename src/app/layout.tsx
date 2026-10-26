import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { shop } from "@/data/shop";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: `${shop.name} | Barbershop and online booking`, template: `%s | ${shop.name}` },
  description: `${shop.tagline} Book a cut online in under a minute.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        {shop.concept && (
          <div className="banner">
            Concept demo. Not affiliated with any business. Bookings are saved in this browser only.
          </div>
        )}
        <header className="nav">
          <Link href="/" className="logo">{shop.name}</Link>
          <Link href="/book" className="btn">Book now</Link>
        </header>
        {children}
        <footer className="foot">
          <span>{shop.address}</span>
          <Link href="/manage">Owner view (demo)</Link>
        </footer>
      </body>
    </html>
  );
}
