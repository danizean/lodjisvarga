// MetaTags is intentionally minimal — Next.js App Router handles metadata via generateMetadata().
// Use this component for any additional meta tags not covered by the Metadata API.

interface MetaTagsProps {
  canonical?: string;
  ogImage?: string;
}

export function MetaTags({ canonical, ogImage }: MetaTagsProps) {
  return (
    <>
      {canonical && <link rel="canonical" href={canonical} />}
      {/* Additional meta tags */}
    </>
  );
}
