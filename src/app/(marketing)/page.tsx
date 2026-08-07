"use client";

import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { PlatformSection } from "@/components/marketing/PlatformSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { StatsBand } from "@/components/marketing/StatsBand";
import { ProgrammesSection } from "@/components/marketing/ProgrammesSection";
import { EcosystemSection } from "@/components/marketing/EcosystemSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FAQSection } from "@/components/marketing/FAQSection";
import { FinalCTASection } from "@/components/marketing/FinalCTASection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main style={{ overflowX: "hidden" }}>
      <MarketingNav />
      <HeroSection onScrollTo={scrollTo} />
      <ProblemSection />
      <PlatformSection />
      <HowItWorksSection />
      <StatsBand />
      <ProgrammesSection onScrollTo={scrollTo} />
      <EcosystemSection />
      <PricingSection onScrollTo={scrollTo} />
      <FAQSection />
      <FinalCTASection />
      <MarketingFooter />
    </main>
  );
}
