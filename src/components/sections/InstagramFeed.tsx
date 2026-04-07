import Image from "next/image";

export function InstagramFeed() {
  const images = [
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590490359854-8ba615cc78a4?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613490908578-8fc5fb529453?q=80&w=600&auto=format&fit=crop",
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-[#3A4A1F] text-3xl font-bold mb-2 tracking-tight">@lodjisvarga</h2>
          <p className="text-gray-500 font-light">Follow us on Instagram for daily inspiration</p>
        </div>

        <div className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 no-scrollbar">
          {images.map((src, idx) => (
            <div 
                key={idx} 
                className="relative min-w-[280px] md:min-w-[320px] aspect-square rounded-3xl overflow-hidden group cursor-pointer shadow-sm border border-gray-100"
            >
              <Image src={src} alt="Instagram Post" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-[#3A4A1F]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
    </section>
  );
}
