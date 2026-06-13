import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";

export const metadata: Metadata = {
  title: "Privacy Policy | Lodjisvarga Villa",
  description:
    "Kebijakan privasi dan perlindungan data pengunjung Lodjisvarga Villa.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="py-24">
      <Container>
        <article className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Legal
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Terakhir diperbarui: 11 Juni 2026
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Pengumpulan Informasi</h2>
            <p className="leading-7 text-muted-foreground">
              Kami mengumpulkan informasi yang Anda berikan secara langsung
              kepada kami saat melakukan pemesanan, mengisi formulir kontak,
              atau berkomunikasi melalui WhatsApp. Informasi ini dapat mencakup
              nama, alamat email, nomor telepon, dan detail reservasi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Penggunaan Informasi</h2>
            <p className="leading-7 text-muted-foreground">
              Informasi yang kami kumpulkan digunakan untuk memproses dan
              mengelola reservasi villa, berkomunikasi terkait layanan, promo,
              dan pembaruan, serta meningkatkan kualitas layanan dan pengalaman
              pengguna di website Lodjisvarga Villa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Keamanan Data</h2>
            <p className="leading-7 text-muted-foreground">
              Kami berkomitmen untuk melindungi informasi pribadi pengunjung dan
              tamu. Kami menerapkan langkah-langkah keamanan teknis dan
              organisasi yang wajar untuk mencegah akses, pengungkapan, atau
              modifikasi data yang tidak sah.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Hubungi Kami</h2>
            <p className="leading-7 text-muted-foreground">
              Jika memiliki pertanyaan tentang Kebijakan Privasi ini, silakan
              hubungi Lodjisvarga Villa melalui email
              `lodjisvargavilla@gmail.com` atau WhatsApp resmi yang tercantum
              pada halaman kontak.
            </p>
          </section>
        </article>
      </Container>
    </main>
  );
}
