import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { SecondaryHeroSection } from "@/components/home/SecondaryHeroSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { MembershipSection } from "@/components/home/MembershipSection";
import { FAQPreviewSection } from "@/components/home/FAQPreviewSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BenefitsSection />
      <SecondaryHeroSection />
      <PartnersSection />
      <TestimonialSection />
      <MembershipSection />
      <FAQPreviewSection />
      <CTASection />
    </Layout>
  );
};

export default Index;