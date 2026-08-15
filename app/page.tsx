import CtaBanner from "@/components/CtaBanner";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import FinanceSection from "@/components/FinanceSection";
import Hero from "@/components/Hero";
import LiveStock from "@/components/LiveStock";
import Marquee from "@/components/Marquee";
import SearchByMaker from "@/components/SearchByMaker";
import Showcase from "@/components/Showcase";
import Testimonials from "@/components/Testimonials";
import TrustBar from "@/components/TrustBar";
import WhyUs from "@/components/WhyUs";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedVehicles />
      <LiveStock />
      <SearchByMaker />
      <Showcase />
      <FinanceSection />
      <Marquee />
      <WhyUs />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
