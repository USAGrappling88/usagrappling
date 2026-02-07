import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { SecondaryHeroSection } from "@/components/home/SecondaryHeroSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { NewsSection } from "@/components/home/NewsSection";
import { MembershipSection } from "@/components/home/MembershipSection";
import { FAQPreviewSection } from "@/components/home/FAQPreviewSection";
import { CTASection } from "@/components/home/CTASection";
import { InstagramFeedSection } from "@/components/home/InstagramFeedSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BenefitsSection />
      <NewsSection />
      <SecondaryHeroSection />
      <InstagramFeedSection />
      <TestimonialSection />
      <MembershipSection />
      <FAQPreviewSection />
      <PartnersSection />
      <CTASection />
    </Layout>
  );
};

export default Index;