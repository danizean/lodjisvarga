import React from 'react';

// MetaTags is intentionally minimal — Next.js App Router handles metadata via generateMetadata().
// Use this component for any additional meta tags not covered by the Metadata API,
// such as specific geo tags and focused keywords for "villa private pool di jogja".

interface MetaTagsProps {
  canonical?: string;
}

export function MetaTags({ canonical }: MetaTagsProps) {
  return (
    <>
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* High-Intent SEO Keywords for Lodjisvarga */}
      <meta 
        name="keywords" 
        content="villa private pool di jogja, villa private pool jogja, sewa villa jogja, villa mewah jogja, staycation jogja, penginapan keluarga jogja, villa jogja kolam renang pribadi, luxury villa yogyakarta, lodjisvarga" 
      />
      
      {/* Geo-targeting for Local SEO (Yogyakarta) */}
      <meta name="geo.region" content="ID-YO" />
      <meta name="geo.placename" content="Yogyakarta" />
      {/* Koordinat wilayah Sleman / Jogja */}
      <meta name="geo.position" content="-7.730310;110.293935" />
      <meta name="ICBM" content="-7.730310, 110.293935" />
      
      <meta name="author" content="Lodjisvarga Villa" />
    </>
  );
}
