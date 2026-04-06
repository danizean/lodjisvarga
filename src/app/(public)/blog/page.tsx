import type { Metadata } from "next";
// import { getArticles } from "@/lib/queries/blog";
// import { ArticleCard } from "@/components/features/blog/ArticleCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "Travel tips, villa guides, and local insights for your luxury getaway.",
};

export default async function BlogPage() {
  // const articles = await getArticles();
  return (
    <div>
      {/* TODO: Blog article listing */}
    </div>
  );
}
