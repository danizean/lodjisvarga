# Arsitektur Technical SEO - Lodjisvarga

Dokumen ini memetakan seluruh implementasi teknikal SEO di dalam project **Lodjisvarga** (Next.js App Router). Gunakan dokumen ini sebagai acuan sentral untuk audit, *maintenance*, dan penskalaan fitur SEO di masa depan.

## 1. Tabel Pemetaan Elemen SEO

| Kategori | Elemen SEO | Lokasi File | Fungsi / Deskripsi Singkat |
| :--- | :--- | :--- | :--- |
| **Metadata & Tags** | Global Metadata (Title Template, Default Desc, Favicon) | `src/app/layout.tsx` | Mendefinisikan `export const metadata` secara global. Memberikan struktur dasar title (misal: `%s | Lodjisvarga`) dan *fallback* jika halaman tidak memilikinya. |
| | Static Page Metadata (Homepage) | `src/app/page.tsx` / `src/app/layout.tsx` | Menyediakan judul dan deskripsi spesifik untuk Homepage yang ditargetkan pada *brand intent* dan kata kunci utama. |
| | Dynamic Metadata (GenerateMetadata) | `src/app/(public)/villas/[slug]/page.tsx` <br/> `src/app/(public)/blog/[slug]/page.tsx` | Mengambil data dari Supabase untuk *generate* title, deskripsi, dan gambar secara dinamis untuk unit villa atau artikel blog tertentu menggunakan `generateMetadata`. |
| | Canonical Tags | `src/app/layout.tsx` <br/> `generateMetadata` (Villa/Blog) | Disematkan via objek `alternates.canonical` pada Metadata Next.js untuk menghindari duplikasi konten (*duplicate content penalty*). |
| | Open Graph & Twitter Cards | `layout.tsx` (Global) <br/> `generateMetadata` (Dinamis) | Menyediakan gambar *thumbnail* (OG Image), tipe web, dan deskripsi khusus saat URL dibagikan di media sosial (WhatsApp, X, Facebook). |
| **Search Engine Instructions** | Robots.txt | `src/app/robots.ts` | Instruksi dinamis (*MetadataRoute.Robots*) yang mengontrol halaman mana yang boleh dan tidak boleh (*disallow: /admin, /api*) dirayapi oleh *crawler*. |
| | Sitemap.xml | `src/app/sitemap.ts` *(Asumsi standar Next.js)* | Memetakan dan menyediakan daftar URL secara dinamis yang diambil dari database Supabase (Villa, Artikel, Promo) agar Google lebih cepat mengindeks halaman baru. |
| **Structured Data (JSON-LD)** | Organization Schema | `src/app/page.tsx` | Menginformasikan Google tentang entitas bisnis Lodjisvarga, mencakup nama merek, logo, dan profil media sosial (Instagram). |
| | LodgingBusiness Schema | `src/app/(public)/villas/[slug]/page.tsx` | Memberikan *rich snippet* khusus akomodasi kepada Google, termasuk nama villa, foto, harga (*PriceRange*), dan fasilitas (*LocationFeatureSpecification*). |
| | BreadcrumbList Schema | `src/app/(public)/villas/[slug]/page.tsx` | Digabung dengan *LodgingBusiness* untuk menampilkan struktur navigasi path (Beranda > Villas > Nama Villa) pada hasil pencarian (SERP). |
| | BlogPosting / Article Schema | `src/app/(public)/blog/[slug]/page.tsx` | Mengkategorikan halaman edukasi/wisata sebagai artikel, membantu Google memahami penulis, tanggal rilis, dan isi bahasan. |
| **Performance & Rendering** | Rendering Strategy (ISR / SSG) | `src/app/page.tsx` <br/> `src/app/(public)/villas/[slug]/page.tsx` | Menentukan kontrol cache via `export const revalidate = 3600` (ISR) dan penggunaan `unstable_cache` untuk optimalisasi *Time to First Byte* (TTFB) dan menjaga kecepatan loading skor Core Web Vitals. |
| | Image Optimization | Semua Komponen UI (`Hero`, `Gallery`, `Cards`) | Menggunakan komponen `<Image>` dari `next/image` dengan *priority tags* (`priority={true}`) pada elemen Hero (LCP) dan *lazy loading* untuk foto di bagian bawah. |
| | Font Optimization | `src/app/layout.tsx` / `src/app/fonts.ts` | Mengimplementasikan `next/font/google` atau font lokal, memastikan teks muncul tanpa gejala *Layout Shift* (CLS nol) atau *Flash of Unstyled Text*. |
| **Semantic & Internal Linking** | Main Navigation & Footer | `src/components/shared/Navbar.tsx` <br/> `src/components/shared/Footer.tsx` | Titik distribusi bobot SEO (Link Equity) yang menghubungkan Homepage ke halaman krusial seperti /villas, /blog, dan /promo. |
| | Breadcrumbs UI | `src/app/(public)/villas/[slug]/page.tsx` | Navigasi internal hirarkis dengan efek UI yang bersih. Membantu pengguna dan bot kembali ke *parent route* dengan logis. |
| | H1 - H6 Hierarchy | `src/components/sections/*.tsx` | Struktur semantik dokumen: H1 diatur satu kali per halaman (contoh: Hero title), diikuti oleh sub-bagian dengan H2, H3, dan seterusnya agar *screen reader* dan Google mudah membaca hierarki konten. |

---

## 2. Analisis Skalabilitas (Scalability Analysis)

Saat ini, beberapa logika SEO disematkan (*inline*) di dalam komponen atau halaman yang terkait. Meskipun hal ini bekerja dengan baik, Lodjisvarga dapat menerapkan sistem tersentralisasi untuk menjaga konsistensi pada saat proyek ini berskala besar (misal, menambah belasan halaman baru atau integrasi multi-bahasa).

**Saran Optimalisasi (SEO Centralization):**

1. **Buat File Konfigurasi SEO Terpusat (`src/lib/seo.ts` atau `src/config/site.ts`):**
   *   Pindahkan semua nilai statis URL, deskripsi global, default OG image, dan informasi media sosial ke satu objek `siteConfig`.
   *   **Alasan:** Jika perusahaan mengganti nama akun Instagram atau nomor WhatsApp global, Anda hanya perlu merubahnya di 1 file, bukan me-refactor `layout.tsx`, `page.tsx` dan halaman lainnya secara terpisah.

2. **Abstraksi JSON-LD Builder (`src/lib/json-ld.ts`):**
   *   Buat fungsi *helper* seperti `buildOrganizationSchema()`, `buildLodgingSchema(villa)`, `buildBreadcrumbSchema(paths)`.
   *   **Alasan:** Mencegah redundansi kode `<script type="application/ld+json">` yang berulang di banyak halaman. Selain itu, Anda menghindari salah ketik sintaksis *Schema.org* yang dapat merusak *Rich Snippets*.

3. **Komponen Breadcrumb Global (`src/components/shared/Breadcrumb.tsx`):**
   *   Pindahkan UI Breadcrumb dari file Villa Detail ke komponen mandiri yang menerima prop `paths: { label: string, href: string }[]`.
   *   **Alasan:** Ketika fitur Blog atau Halaman Promo selesai, Anda bisa dengan mudah menggunakan komponen yang sama untuk menjaga tampilan UI yang elegan dan konsisten tanpa melakukan *copy-paste*.

---

## 3. Maintenance Checklist

Jika Anda (atau tim developer lain) di masa mendatang hendak **menambah fitur baru** (contoh: Halaman "Event", halaman "Fasilitas Premium", atau tipe properti baru), pastikan melakukan *checklist* SEO berikut:

- [ ] **Apakah Meta Data dinamis sudah tersedia?**
  Setiap *Dynamic Route* (misal `/events/[slug]`) wajib menggunakan `generateMetadata` agar judul dan *Open Graph* (gambar share WA/IG) relevan.
- [ ] **Apakah URL sudah masuk Sitemap?**
  Jika itu adalah fitur dinamis besar, pastikan *query* dari Supabase dimasukkan ke dalam logika *generator* `src/app/sitemap.ts`.
- [ ] **Apakah Rendering Strategy sesuai?**
  Gunakan **ISR** (`export const revalidate = ...`) untuk halaman yang jarang berubah tapi butuh update (seperti artikel atau landing page), dan gunakan *dynamic* hanya untuk halaman berinteraksi spesifik pengguna (seperti keranjang booking atau halaman admin).
- [ ] **Apakah elemen media menggunakan `next/image`?**
  Bila ada asset banner yang baru, pastikan formatnya WebP/AVIF via `<Image>` Next.js. Berikan atribut `priority` jika banner itu muncul tanpa perlu men-scroll (*Above the Fold*).
- [ ] **Apakah ada 1 (dan hanya 1) tag `<h1>`?**
  Lakukan inspeksi elemen semantik. Hindari menggunakan `<h1>` lebih dari satu di setiap page. Gunakan `<h2>` dan `<h3>` untuk susunan *section* di bawahnya.
- [ ] **Apakah JSON-LD yang tepat sudah ditambahkan?**
  Halaman layanan baru perlu schema yang relevan (misalnya *Event Schema* atau *Product Schema*). Tes implementasi URL Anda dengan [Google Rich Results Test](https://search.google.com/test/rich-results) pasca *deploy*.
