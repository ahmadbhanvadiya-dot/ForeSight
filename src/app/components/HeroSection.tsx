'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  History,
  ChevronDown,
  Zap,
} from 'lucide-react';
import Icon from '../../components/ui/AppIcon';


const FINAL_RISK_SCORE = 92;

function RiskProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="progress-track w-full">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

function AnimatedNumber({ target, delay = 0 }: { target: number; delay?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setValue(target);
          clearInterval(interval);
        } else {
          setValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [target, delay]);

  return <>{value}</>;
}

export default function HeroSection() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute inset-0 bg-noise" />

      {/* Atmospheric blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-0 lg:min-h-screen lg:flex lg:items-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">

          {/* Left — 7 cols */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-primary/60" />
              <span className="section-label">AI-Powered SLA Risk Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
              Predict delays before they become{' '}
              <span className="text-gradient-primary">SLA breaches.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-medium">
              ForeSight identifies at-risk requests, explains what's causing the delay, and recommends the right action before it's too late.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="btn-primary text-base py-3 px-6">
                Explore Dashboard
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => handleScroll('#how-it-works')}
                className="btn-secondary text-base py-3 px-6"
              >
                See How It Works
              </button>
            </div>

            {/* Trust statement */}
            <div className="flex items-center gap-6 pt-2">
              {['Predict', 'Explain', 'Act'].map((word, i) => (
                <React.Fragment key={word}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-muted-foreground">{word}</span>
                  </div>
                  {i < 2 && <span className="text-border">·</span>}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Right — 5 cols — Risk Card */}
          <motion.div
            className="lg:col-span-5 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="relative w-full max-w-sm">
              {/* Strong risk glow */}
<div
  className="absolute -inset-4 rounded-3xl pointer-events-none"
  style={{
    background:
      'radial-gradient(ellipse at center, rgba(239,68,68,0.28) 0%, rgba(99,102,241,0.10) 45%, transparent 75%)',
    filter: 'blur(28px)',
    transform: 'scale(1.08)',
  }}
/>

              {/* Main card */}
              <div className="relative glass-card-strong rounded-2xl p-5 border border-risk-high/50 shadow-[0_0_35px_rgba(239,68,68,0.18)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Request #1042</p>
                    <p className="text-base font-bold text-foreground mt-0.5">License Renewal</p>
                  </div>
                  <span className="risk-high-badge text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-risk-high/50 shadow-[0_0_14px_rgba(239,68,68,0.25)]">
                    <AlertTriangle size={11} />
                    HIGH RISK
                  </span>
                </div>

                {/* Stage */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-muted/50 border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Stage</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">Approval</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Stage Duration</p>
                    <p className="text-sm font-semibold text-risk-medium mt-0.5">1.75× normal</p>
                  </div>
                </div>

                {/* SLA Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">SLA Progress</span>
                    <span className="text-xs font-bold text-risk-high">82% consumed</span>
                  </div>
                  <RiskProgressBar value={82} color="var(--risk-high)" />
                </div>

                {/* Risk Score */}
                <div className="flex items-center justify-between mb-4 p-4 rounded-xl border border-risk-high/40 bg-risk-high/10 shadow-[inset_0_0_25px_rgba(239,68,68,0.06)]">
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="text-4xl font-extrabold text-risk-high leading-none mt-1 drop-shadow-[0_0_12px_rgba(239,68,68,0.45)]">
                      <AnimatedNumber target={FINAL_RISK_SCORE} delay={1} />
                      <span className="text-lg">%</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-risk-high/40 flex items-center justify-center">
                    <TrendingUp size={20} className="text-risk-high" />
                  </div>
                </div>

                {/* Indicators */}
                <div className="space-y-2 mb-4">
                  {[
                    { icon: Clock, text: 'SLA remaining: 6h 12m', color: 'text-risk-high' },
                    { icon: History, text: 'Historical stage delay: 42%', color: 'text-risk-medium' },
                    { icon: Users, text: 'Department delay rate: 31%', color: 'text-risk-medium' },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={12} className={color} />
                      <span className="text-xs text-muted-foreground">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Recommended Action */}
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Recommended Action</p>
                  <div className="flex items-center gap-2 bg-risk-high/10 border border-risk-high/30 rounded-xl px-3 py-2.5">
                    <Zap size={14} className="text-risk-high" fill="currentColor" />
                    <span className="text-sm font-bold text-risk-high tracking-wide">ESCALATE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <span className="text-xs font-medium">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}