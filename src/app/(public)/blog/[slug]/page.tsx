import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div>
      {/* TODO: Article content with structured data (JSON-LD) */}
    </div>
  );
}
