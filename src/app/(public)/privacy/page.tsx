import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kebijakan privasi dan perlindungan data pengunjung Lodjisvarga Villa.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-24 pb-20 bg-[#FAF8F4] min-h-screen">
      <Container className="max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#3A4A1F] mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="lead">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
          </p>

          <h2 className="text-xl font-bold text-[#3A4A1F] mt-8 mb-4">1. Pengumpulan Informasi</h2>
          <p>
            Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat Anda melakukan pemesanan,
            mengisi formulir kontak, atau berkomunikasi dengan kami melalui WhatsApp. Informasi ini dapat mencakup
            nama, alamat email, nomor telepon, dan detail reservasi Anda.
          </p>

          <h2 className="text-xl font-bold text-[#3A4A1F] mt-8 mb-4">2. Penggunaan Informasi</h2>
          <p>
            Informasi yang kami kumpulkan digunakan untuk:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Memproses dan mengelola reservasi villa Anda.</li>
            <li>Berkomunikasi dengan Anda terkait layanan, promo, dan pembaruan.</li>
            <li>Meningkatkan kualitas layanan dan pengalaman pengguna di website kami.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#3A4A1F] mt-8 mb-4">3. Keamanan Data</h2>
          <p>
            Kami berkomitmen untuk melindungi informasi pribadi Anda. Kami menerapkan langkah-langkah keamanan
            teknis dan organisasi yang wajar untuk mencegah akses, pengungkapan, atau modifikasi yang tidak sah.
          </p>

          <h2 className="text-xl font-bold text-[#3A4A1F] mt-8 mb-4">4. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di:
            <br />
            Email: hello@lodjisvarga.com
            <br />
            WhatsApp: 0851-8477-9808
          </p>
        </div>
      </Container>
    </div>
  );
}
