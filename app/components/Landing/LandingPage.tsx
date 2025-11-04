"use client";

import { HeroSection } from "./HeroSection";
import { TrustBar } from "./TrustBar";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";
import { SocialProofSection } from "./SocialProofSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";
import { FinalCTASection } from "./FinalCTASection";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TrustBar />
      <ProblemSection />
      <SolutionSection />
      <SocialProofSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}

