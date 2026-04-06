import Link from "next/link";
import { SITE_NAME } from "@/lib/constants/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/villas">Villas</Link>
          <Link href="/blog">Blog</Link>
          {/* TODO: WhatsApp CTA button */}
        </nav>
      </div>
    </header>
  );
}
