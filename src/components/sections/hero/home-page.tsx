"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { IntroSplash } from "@/components/sections/hero/intro-splash";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { WhySection } from "@/components/sections/why/why-section";
import { FeaturedProductsSection } from "@/components/sections/products/featured-products-section";
import { FreeServicesSection } from "@/components/sections/services/free-services-section";
import { GlobalSection } from "@/components/sections/global/global-section";
import { ReviewsSection } from "@/components/sections/reviews/reviews-section";
import { TeamSection } from "@/components/sections/team/team-section";
import { BlogSection } from "@/components/sections/blog/blog-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal"
;

export function HomePage() {
  const [splashDone, setSplashDone] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const fallback = window.setTimeout(() => setHeroReady(true), 3200);
    return () => window.clearTimeout(fallback);
  }, []);

  return (
    <div className="relative bg-black">
      <HeroSection heroReady={heroReady} />

      <ScrollReveal delay={0}>
        <WhySection />
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <FeaturedProductsSection />
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <FreeServicesSection />
      </ScrollReveal>

      <ScrollReveal delay={0} direction="none" duration={0.9}>
        <GlobalSection />
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <ReviewsSection />
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <TeamSection />
      </ScrollReveal>

      <ScrollReveal delay={0}>
        <BlogSection />
      </ScrollReveal>

      <Footer />

      {!splashDone && (
        <IntroSplash
          onBurstStart={() => setHeroReady(true)}
          onComplete={() => setSplashDone(true)}
        />
      )}
    </div>
  );
}
