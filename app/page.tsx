'use client';

import Navbar from '@/components/sections/Navbar';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Stats from '@/components/sections/Stats';
import FAQ from '@/components/sections/FAQ';
import Footer from '@/components/sections/Footer';
import HowItWorks from '@/components/sections/HowItWorks';

// Include other section components if available
// import Pricing from '@/components/sections/Pricing';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <FAQ />
      <Footer />
    </main>
  );
}
