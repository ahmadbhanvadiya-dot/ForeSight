'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Lightbulb, Network, Zap } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'SLA Risk Prediction',
    description:
      'Identify requests likely to miss their deadlines before the breach occurs. Get a precise risk score from 0–100 for every active request.',
    color: 'text-primary',
    borderColor: 'border-primary/30',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Lightbulb,
    title: 'Explainable Risk',
    description:
      'Understand exactly which factors are driving the risk — SLA consumption, stage duration, historical rates — explained in plain language.',
    color: 'text-accent',
    borderColor: 'border-accent/30',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Network,
    title: 'Bottleneck Detection',
    description:
      'Identify departments and processing stages responsible for recurring delays. Pinpoint the root cause, not just the symptom.',
    color: 'text-risk-medium',
    borderColor: 'border-risk-medium/30',
    bgColor: 'bg-risk-medium/10',
  },
  {
    icon: Zap,
    title: 'Recommended Actions',
    description:
      'Turn predictions into concrete operational decisions. Escalate, Reassign, Prioritize, Add Resources, or Monitor — matched to the exact conditions.',
    color: 'text-risk-low',
    borderColor: 'border-risk-low/30',
    bgColor: 'bg-risk-low/10',
  },
];

export default function ProductIntelligence() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="product" className="py-20 lg:py-28 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label block mb-3">Product Intelligence</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            More than a{' '}
            <span className="text-gradient-primary">risk score.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            ForeSight gives operations teams the full picture — from detection to decision.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features?.map((feature, i) => (
            <motion.div
              key={feature?.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i + 0.2 }}
              className="glass-card rounded-2xl p-5 border border-border hover:border-border/60 hover:-translate-y-1 transition-all duration-300 group cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl ${feature?.bgColor} border ${feature?.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon size={18} className={feature?.color} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{feature?.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature?.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}