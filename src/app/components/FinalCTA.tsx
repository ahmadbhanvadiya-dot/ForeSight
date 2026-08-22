'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const handleDemo = () => {
    const el = document.querySelector('#simulator');
    if (el) el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden" ref={ref}>
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(99,102,241,0.06) 50%, rgba(239,68,68,0.04) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,247,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
              Don't wait for the{' '}
              <span className="text-risk-high">SLA breach.</span>
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-gradient-primary">Act before it happens.</span>
            </h2>
          </div>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Turn operational data into early warnings, clear explanations, and actionable decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary text-base py-3.5 px-8 justify-center">
              Launch ForeSight
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={handleDemo}
              className="btn-secondary text-base py-3.5 px-8"
            >
              <Play size={16} />
              Explore the Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              'Deterministic Risk Engine',
              'Explainable AI',
              'Real-time Assessment',
            ]?.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-risk-low" />
                <span className="text-sm text-muted-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}