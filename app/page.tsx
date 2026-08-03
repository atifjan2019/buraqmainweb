import CtaBanner from "@/components/CtaBanner";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import FinanceSection from "@/components/FinanceSection";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Testimonials from "@/components/Testimonials";
import TrustBar from "@/components/TrustBar";
import WhyUs from "@/components/WhyUs";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedVehicles />
      <FinanceSection />
      <Marquee />
      <WhyUs />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
