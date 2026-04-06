import { Container } from "@/components/shared/Container";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";
import Link from "next/link";

export function CTASection() {
  const waLink = generateWhatsAppLink("Halo, saya ingin tahu lebih lanjut tentang villa.");
  return (
    <section className="py-24">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Dream Villa?</h2>
          <p className="text-muted-foreground mb-8">
            Contact us via WhatsApp for instant availability check and personalized offers.
          </p>
          <Link href={waLink} target="_blank" className="btn-primary">
            Chat on WhatsApp
          </Link>
        </div>
      </Container>
    </section>
  );
}
