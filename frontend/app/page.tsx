import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Workflow from "@/components/Workflow";
import EngineeringPrinciples from "@/components/EngineeringPrinciples";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-slate-950">
      <Navbar />
      <Hero />
      <Workflow />
      <EngineeringPrinciples />
      <FinalCTA />
      <Footer />
    </main>
  );
}