'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,  } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const trajectoryData = [
  { time: 'Yesterday', score: 54, label: '−24h' },
  { time: '18h ago', score: 58, label: '−18h' },
  { time: '12h ago', score: 63, label: '−12h' },
  { time: '6h ago', score: 74, label: '−6h' },
  { time: '3h ago', score: 83, label: '−3h' },
  { time: 'Now', score: 92, label: 'Now' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const level = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
    const color = score >= 70 ? 'text-risk-high' : score >= 40 ? 'text-risk-medium' : 'text-risk-low';
    return (
      <div className="glass-card-strong rounded-xl p-3 border border-border text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className={`font-bold text-lg ${color}`}>{score}</p>
        <p className={`${color} font-semibold`}>{level} RISK</p>
      </div>
    );
  }
  return null;
};

export default function RiskTrajectory() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 lg:py-28 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left — 1 col */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label block">Early Warning System</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Watch risk rise before the{' '}
              <span className="text-risk-high">deadline arrives.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ForeSight detects worsening conditions early enough for teams to intervene — hours before the breach.
            </p>

            {/* Current state */}
            <div className="glass-card-strong rounded-2xl p-4 border border-risk-high/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-risk-high" />
                <span className="text-xs font-bold text-risk-high uppercase tracking-wider">Risk increasing rapidly</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-xl bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">Yesterday</p>
                  <p className="text-lg font-bold text-risk-low">54</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-risk-high/10 border border-risk-high/20">
                  <p className="text-xs text-muted-foreground mb-0.5">Now</p>
                  <p className="text-lg font-bold text-risk-high">92</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <TrendingUp size={12} className="text-risk-high" />
                <span className="text-xs text-risk-high font-semibold">+38 points in 24 hours</span>
              </div>
            </div>
          </motion.div>

          {/* Right — 2 cols — Chart */}
          <motion.div
            className="lg:col-span-2 glass-card rounded-2xl p-6 border border-border"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={14} className="text-risk-high" />
                Risk Score Trajectory — Request #1042
              </h3>
              <span className="risk-high-badge text-xs font-bold px-2.5 py-1 rounded-full">
                HIGH RISK
              </span>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trajectoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--risk-high)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--risk-high)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[40, 100]}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={70}
                  stroke="var(--risk-medium)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: 'HIGH threshold', fill: 'var(--risk-medium)', fontSize: 10, position: 'right' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--risk-high)"
                  strokeWidth={2.5}
                  fill="url(#riskGradient)"
                  dot={{ fill: 'var(--risk-high)', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'var(--risk-high)', strokeWidth: 2, stroke: 'var(--background)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}