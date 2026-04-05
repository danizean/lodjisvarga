import "../styles/globals.css";

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
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
