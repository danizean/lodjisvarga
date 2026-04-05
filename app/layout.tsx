import "../styles/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Lodjisvarga Villa",
  description: "Jagonya Nyaman,Villa Private Pool di Yogyakarta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
