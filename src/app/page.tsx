import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../app/components/HeroSection';
import ProblemSection from '../app/components/ProblemSection';
import HowItWorks from '../app/components/HowItWorks';
import RiskSimulator from '../app/components/RiskSimulator';
import ProductIntelligence from '../app/components/ProductIntelligence';
import BottleneckSection from '../app/components/BottleneckSection';
import RiskTrajectory from '../app/components/RiskTrajectory';
import AIExplanation from '../app/components/AIExplanation';
import FinalCTA from '../app/components/FinalCTA';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <HeroSection />
      <ProblemSection />
      <HowItWorks />
      <RiskSimulator />
      <ProductIntelligence />
      <BottleneckSection />
      <RiskTrajectory />
      <AIExplanation />
      <FinalCTA />
      <Footer />
    </main>
  );
}