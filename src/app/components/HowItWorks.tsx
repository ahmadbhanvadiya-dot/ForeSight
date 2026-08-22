'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Database, Brain, MessageSquare, Zap } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Database,
    title: 'Analyze',
    description:
      'ForeSight analyzes request history, SLA deadlines, processing stages, departments, and historical performance to build a complete operational picture.',
    color: 'text-primary',
    borderColor: 'border-primary/30',
    bgColor: 'bg-primary/10',
  },
  {
    number: '02',
    icon: Brain,
    title: 'Predict',
    description:
      'A deterministic risk engine calculates an SLA Risk Score from 0–100 using weighted factors: SLA pressure, stage duration, historical rates, and department patterns.',
    color: 'text-risk-medium',
    borderColor: 'border-risk-medium/30',
    bgColor: 'bg-risk-medium/10',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Explain',
    description:
      'The system identifies the factors contributing to the risk and explains them in plain language — so any team member understands why a request is flagged.',
    color: 'text-accent',
    borderColor: 'border-accent/30',
    bgColor: 'bg-accent/10',
  },
  {
    number: '04',
    icon: Zap,
    title: 'Act',
    description:
      'ForeSight recommends a concrete operational action: Escalate, Reassign, Prioritize, Add Resources, or Monitor — matched to the specific risk conditions.',
    color: 'text-risk-low',
    borderColor: 'border-risk-low/30',
    bgColor: 'bg-risk-low/10',
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label block mb-3">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            From raw service data to{' '}
            <span className="text-gradient-primary">proactive action.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A four-step intelligence pipeline that turns operational data into early warnings.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block">
          {/* Connector line */}
          <div className="relative mb-8">
            <div className="absolute top-8 left-16 right-16 h-px bg-gradient-to-r from-primary/30 via-accent/30 to-risk-low/30" />
            <div className="grid grid-cols-4 gap-6">
              {steps?.map((step, i) => (
                <motion.div
                  key={step?.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i + 0.2 }}
                  className="relative"
                >
                  {/* Step icon circle */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${step?.bgColor} border ${step?.borderColor} flex items-center justify-center relative z-10`}>
                      <step.icon size={24} className={step?.color} />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="glass-card rounded-2xl p-5 border border-border hover:border-border/80 transition-colors group">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-black tracking-widest ${step?.color} opacity-60`}>
                        {step?.number}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{step?.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step?.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden space-y-4">
          {steps?.map((step, i) => (
            <motion.div
              key={step?.number}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="flex gap-4"
            >
              {/* Left: number + line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl ${step?.bgColor} border ${step?.borderColor} flex items-center justify-center flex-shrink-0`}>
                  <step.icon size={18} className={step?.color} />
                </div>
                {i < steps?.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2 min-h-8" />
                )}
              </div>

              {/* Right: content */}
              <div className="glass-card rounded-2xl p-4 border border-border flex-1 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-black tracking-widest ${step?.color} opacity-60`}>
                    {step?.number}
                  </span>
                  <h3 className="text-sm font-bold text-foreground">{step?.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step?.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}