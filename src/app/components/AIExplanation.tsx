'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, Zap, Brain, Info } from 'lucide-react';

export default function AIExplanation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 lg:py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label block mb-3">AI Explainability</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            AI that{' '}
            <span className="text-gradient-primary">explains the decision.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The risk score is calculated deterministically. AI turns the factors into a clear, human-readable explanation.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left — Explanation Panel */}
          <motion.div
            className="glass-card-strong rounded-2xl p-6 border border-primary/20 glow-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Score header */}
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk Score</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-extrabold text-risk-high">92%</span>
                  <span className="risk-high-badge text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle size={11} />
                    HIGH RISK
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Brain size={18} className="text-primary" />
              </div>
            </div>

            {/* Why section */}
            <div className="mb-5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Info size={14} className="text-primary" />
                Why?
              </h4>
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "This request is currently in the{' '}
                  <span className="text-foreground font-semibold not-italic">Approval stage</span> and has already consumed most of its SLA window. Approval requests in the{' '}
                  <span className="text-foreground font-semibold not-italic">Licensing department</span> historically experience frequent delays, while the current stage is taking{' '}
                  <span className="text-risk-medium font-semibold not-italic">1.75× longer</span> than normal."
                </p>
              </div>
            </div>

            {/* Recommended Action */}
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Zap size={14} className="text-primary" />
                Recommended Action
              </h4>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-risk-high/10 border border-risk-high/30">
                <div className="w-8 h-8 rounded-lg bg-risk-high/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={14} className="text-risk-high" />
                </div>
                <div>
                  <p className="text-sm font-bold text-risk-high">Escalate to the Approval Team</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Immediate escalation required — SLA breach imminent</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — How AI Works */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="glass-card rounded-2xl p-5 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-black text-primary">01</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">Deterministic Risk Engine</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The risk score is calculated using a transparent, auditable formula — not a black-box model. Every score can be traced back to exact input values.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-black text-accent">02</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">AI-Powered Explanation Layer</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Once the score is calculated, an AI layer translates the contributing factors into plain language — making the risk immediately understandable to any operations team member.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-risk-low/10 border border-risk-low/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-black text-risk-low">03</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">Deterministic Recommendations</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Action recommendations follow explicit business rules based on risk score thresholds and delay rates — not probabilistic AI outputs. Predictable, auditable, and trustworthy.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust note */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                <span className="text-foreground font-semibold">Note:</span> AI determines the explanation, not the score. The risk engine is fully deterministic and auditable.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}