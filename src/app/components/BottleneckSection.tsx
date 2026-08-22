'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const bottlenecks = [
  { stage: 'Approval', delayRate: 42, avgDuration: 1.8, isPrimary: true },
  { stage: 'Verification', delayRate: 31, avgDuration: 1.4, isPrimary: false },
  { stage: 'Doc Review', delayRate: 18, avgDuration: 1.2, isPrimary: false },
  { stage: 'Processing', delayRate: 12, avgDuration: 1.1, isPrimary: false },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-strong rounded-xl p-3 border border-border text-xs">
        <p className="text-foreground font-semibold mb-1">{label}</p>
        <p className="text-muted-foreground">
          Delay Rate: <span className="text-risk-medium font-bold">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function BottleneckSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="bottlenecks" className="py-20 lg:py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="max-w-2xl mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label block mb-3">Bottleneck Intelligence</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            Find what's slowing your{' '}
            <span className="text-gradient-primary">organization down.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            ForeSight doesn't just identify delayed requests. It identifies the operational bottlenecks causing them.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart — 2 cols */}
          <motion.div
            className="lg:col-span-2 glass-card rounded-2xl p-6 border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart size={14} className="text-primary" />
              Stage Delay Rates
            </h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bottlenecks} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="stage"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="delayRate" radius={[6, 6, 0, 0]}>
                  {bottlenecks.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPrimary ? 'var(--risk-high)' : 'var(--primary)'}
                      opacity={entry.isPrimary ? 1 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-risk-high" />
                <span className="text-xs text-muted-foreground">Primary Bottleneck</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary opacity-50" />
                <span className="text-xs text-muted-foreground">Other Stages</span>
              </div>
            </div>
          </motion.div>

          {/* Primary Bottleneck Highlight — 1 col */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Primary bottleneck card */}
            <div className="glass-card-strong rounded-2xl p-5 border border-risk-high/20 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={14} className="text-risk-high" />
                <span className="text-xs font-bold text-risk-high uppercase tracking-wider">Primary Bottleneck</span>
              </div>

              <p className="text-2xl font-extrabold text-foreground mb-1">Approval</p>
              <p className="text-xs text-muted-foreground mb-5">Most critical stage for SLA risk</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border">
                  <span className="text-xs text-muted-foreground">Historical Delay Rate</span>
                  <span className="text-sm font-bold text-risk-high">42%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border">
                  <span className="text-xs text-muted-foreground">Avg Processing Duration</span>
                  <span className="text-sm font-bold text-risk-medium">1.8×</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border">
                  <span className="text-xs text-muted-foreground">SLA Impact</span>
                  <span className="text-sm font-bold text-risk-high">Critical</span>
                </div>
              </div>
            </div>

            {/* Insight card */}
            <div className="glass-card rounded-2xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <TrendingUp size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-semibold">Approval stage</span> is responsible for{' '}
                  <span className="text-risk-high font-semibold">67% of all SLA breaches</span> in the last 90 days.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}