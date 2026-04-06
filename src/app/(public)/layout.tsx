import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Lodji Svarga Villa",
    default: "Lodji Svarga Villa – Luxury Villa Rentals",
  },
  description: "Experience luxury villa rentals with breathtaking views and world-class amenities.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
