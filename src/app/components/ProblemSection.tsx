'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const traditionalSteps = [
  { label: 'Request Created', status: 'ok' },
  { label: 'Processing', status: 'ok' },
  { label: 'Waiting', status: 'warning' },
  { label: 'Waiting', status: 'warning' },
  { label: 'SLA Breach', status: 'breach' },
];

const delayGuardSteps = [
  { label: 'Request Created', status: 'ok' },
  { label: 'Processing', status: 'ok' },
  { label: '⚠ Risk Detected', status: 'detect' },
  { label: 'Recommended Action', status: 'action' },
  { label: 'SLA Protected', status: 'protected' },
];

function FlowStep({ label, status, delay }: { label: string; status: string; delay: number }) {
  const colorMap: Record<string, string> = {
    ok: 'border-border bg-muted text-muted-foreground',
    warning: 'border-risk-medium/40 bg-risk-medium/10 text-risk-medium',
    breach: 'border-risk-high/50 bg-risk-high/15 text-risk-high font-bold',
    detect: 'border-risk-medium/50 bg-risk-medium/10 text-risk-medium font-semibold',
    action: 'border-primary/40 bg-primary/10 text-primary font-semibold',
    protected: 'border-risk-low/50 bg-risk-low/15 text-risk-low font-bold',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`px-3 py-2 rounded-xl border text-xs text-center ${colorMap[status]}`}
    >
      {label}
    </motion.div>
  );
}

function FlowArrow({ color }: { color: string }) {
  return (
    <div className={`w-px h-5 mx-auto ${color}`} />
  );
}

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="problem" className="py-20 lg:py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label block mb-3">The Problem</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            Delays are discovered{' '}
            <span className="text-risk-high">too late.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Most teams react after an SLA is already at risk. ForeSight helps them intervene while there is still time to act.
          </p>
        </motion.div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Traditional */}
          <motion.div
            className="glass-card rounded-2xl p-6 border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <XCircle size={20} className="text-risk-high" />
              <h3 className="text-base font-bold text-foreground">Traditional Approach</h3>
            </div>

            <div className="flex flex-col items-center gap-0 max-w-xs mx-auto">
              {traditionalSteps.map((step, i) => (
                <React.Fragment key={i}>
                  <FlowStep label={step.label} status={step.status} delay={0.1 * i} />
                  {i < traditionalSteps.length - 1 && (
                    <FlowArrow color={step.status === 'warning' ? 'bg-risk-medium/30' : 'bg-border'} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-risk-high/10 border border-risk-high/20">
              <p className="text-xs text-risk-high font-medium text-center">
                SLA breach discovered only after it occurs
              </p>
            </div>
          </motion.div>

          {/* DelayGuard */}
          <motion.div
            className="glass-card-strong rounded-2xl p-6 border border-primary/20"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle size={20} className="text-risk-low" />
              <h3 className="text-base font-bold text-foreground">With ForeSight</h3>
            </div>

            <div className="flex flex-col items-center gap-0 max-w-xs mx-auto">
              {delayGuardSteps.map((step, i) => (
                <React.Fragment key={i}>
                  <FlowStep label={step.label} status={step.status} delay={0.1 * i} />
                  {i < delayGuardSteps.length - 1 && (
                    <FlowArrow color={step.status === 'detect' ? 'bg-primary/30' : 'bg-border'} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-risk-low/10 border border-risk-low/20">
              <p className="text-xs text-risk-low font-medium text-center">
                Risk detected early — action taken before breach
              </p>
            </div>
          </motion.div>
        </div>

        {/* Key insight */}
        <motion.div
          className="mt-10 max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="glass-card rounded-2xl p-5 border border-border">
            <AlertTriangle size={16} className="text-risk-medium mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">The window to act is narrow.</span>{' '}
              By the time a delay is visible in traditional dashboards, there is often no time left to prevent the breach.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}