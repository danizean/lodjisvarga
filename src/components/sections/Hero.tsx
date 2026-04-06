import { Container } from "@/components/shared/Container";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      <Container>
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            {/* TODO: Dynamic headline */}
            Your Private Paradise Awaits
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {/* TODO: Subtitle */}
          </p>
          {/* TODO: CTA buttons + search bar */}
        </div>
      </Container>
      {/* TODO: Hero background image with overlay */}
    </section>
  );
}
