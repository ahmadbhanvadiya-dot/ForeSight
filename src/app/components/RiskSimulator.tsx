'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, Zap, BarChart2, Play } from 'lucide-react';
import {
  calculateRisk,
  type Department,
  type Stage,
  type RiskResult,
  type SimulatorInputs,
} from '../../lib/risk-engine';

const departments: Department[] = ['Revenue', 'Licensing', 'Finance', 'HR'];
const stages: Stage[] = ['Verification', 'Review', 'Approval', 'Document Processing'];

const actionColors: Record<string, string> = {
  ESCALATE: 'text-risk-high border-risk-high/40 bg-risk-high/10',
  REASSIGN: 'text-risk-medium border-risk-medium/40 bg-risk-medium/10',
  PRIORITIZE: 'text-primary border-primary/40 bg-primary/10',
  'ADD RESOURCES': 'text-accent border-accent/40 bg-accent/10',
  MONITOR: 'text-risk-low border-risk-low/40 bg-risk-low/10',
};

const severityColors = {
  high: 'text-risk-high',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
};

function AnimatedScore({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);

  React.useEffect(() => {
    setDisplayed(0);
    const duration = 1200;
    const steps = 50;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayed(score);
        clearInterval(interval);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score]);

  return <>{displayed}</>;
}

export default function RiskSimulator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [inputs, setInputs] = useState<SimulatorInputs>({
    department: 'Licensing',
    currentStage: 'Approval',
    slaHoursRemaining: 8,
    currentStageDurationHours: 14,
    historicalStageDelayRate: 42,
    departmentDelayRate: 31,
  });

  const [result, setResult] = useState<RiskResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      const r = calculateRisk(inputs);
      setResult(r);
      setAnalyzing(false);
    }, 600);
  };

  const riskColor =
    result?.level === 'HIGH' ?'text-risk-high'
      : result?.level === 'MEDIUM' ?'text-risk-medium' :'text-risk-low';

  const riskBadgeClass =
    result?.level === 'HIGH' ?'risk-high-badge'
      : result?.level === 'MEDIUM' ?'risk-medium-badge' :'risk-low-badge';

  return (
    <section id="simulator" className="py-20 lg:py-28 relative" ref={ref}>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label block mb-3">Interactive Demo</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            See the risk before it becomes{' '}
            <span className="text-risk-high">a breach.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Adjust the request conditions and see how ForeSight evaluates SLA risk in real time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs Panel */}
          <motion.div
            className="glass-card rounded-2xl p-6 border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" />
              Request Conditions
            </h3>

            <div className="space-y-5">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Department
                </label>
                <select
                  className="input-field"
                  value={inputs.department}
                  onChange={(e) => setInputs({ ...inputs, department: e.target.value as Department })}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Current Stage
                </label>
                <select
                  className="input-field"
                  value={inputs.currentStage}
                  onChange={(e) => setInputs({ ...inputs, currentStage: e.target.value as Stage })}
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* SLA Time Remaining */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    SLA Time Remaining
                  </label>
                  <span className="text-sm font-bold text-foreground">{inputs.slaHoursRemaining}h</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={48}
                  step={1}
                  value={inputs.slaHoursRemaining}
                  onChange={(e) => setInputs({ ...inputs, slaHoursRemaining: Number(e.target.value) })}
                  className="slider-input"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0h</span>
                  <span>48h</span>
                </div>
              </div>

              {/* Stage Duration */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Current Stage Duration
                  </label>
                  <span className="text-sm font-bold text-foreground">{inputs.currentStageDurationHours}h</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={inputs.currentStageDurationHours}
                  onChange={(e) => setInputs({ ...inputs, currentStageDurationHours: Number(e.target.value) })}
                  className="slider-input"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1h</span>
                  <span>24h</span>
                </div>
              </div>

              {/* Historical Stage Delay */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Historical Stage Delay Rate
                  </label>
                  <span className="text-sm font-bold text-foreground">{inputs.historicalStageDelayRate}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={inputs.historicalStageDelayRate}
                  onChange={(e) => setInputs({ ...inputs, historicalStageDelayRate: Number(e.target.value) })}
                  className="slider-input"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Department Delay Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Department Delay Rate
                  </label>
                  <span className="text-sm font-bold text-foreground">{inputs.departmentDelayRate}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={inputs.departmentDelayRate}
                  onChange={(e) => setInputs({ ...inputs, departmentDelayRate: Number(e.target.value) })}
                  className="slider-input"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-primary w-full justify-center mt-6 py-3 text-base"
            >
              {analyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  >
                    <BarChart2 size={16} />
                  </motion.div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Analyze Risk
                </>
              )}
            </button>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            className="glass-card-strong rounded-2xl p-6 border border-border min-h-[500px] flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
              <AlertTriangle size={16} className="text-primary" />
              Risk Assessment
            </h3>

            <AnimatePresence mode="wait">
              {!result && !analyzing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                    <BarChart2 size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Configure the request conditions and click{' '}
                    <span className="text-primary font-semibold">Analyze Risk</span>{' '}
                    to see ForeSight's assessment.
                  </p>
                </motion.div>
              )}

              {analyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center"
                  >
                    <BarChart2 size={28} className="text-primary" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Running risk analysis...</p>
                </motion.div>
              )}

              {result && !analyzing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 flex flex-col gap-5"
                >
                  {/* Score */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk Score</p>
                      <p className={`text-5xl font-extrabold leading-none ${riskColor}`}>
                        <AnimatedScore score={result.score} />
                        <span className="text-2xl">%</span>
                      </p>
                    </div>
                    <span className={`${riskBadgeClass} text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                      {result.level === 'HIGH' && <AlertTriangle size={11} />}
                      {result.level === 'MEDIUM' && <Info size={11} />}
                      {result.level === 'LOW' && <CheckCircle size={11} />}
                      {result.level} RISK
                    </span>
                  </div>

                  {/* Factors */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Info size={12} />
                      Why is this request at risk?
                    </p>
                    <div className="space-y-2">
                      {result.factors.map((factor) => (
                        <div
                          key={factor.label}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border border-border"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            factor.severity === 'high' ? 'bg-risk-high' :
                            factor.severity === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">{factor.label}</span>
                              <span className={`text-xs font-bold ${severityColors[factor.severity]} flex-shrink-0`}>
                                {factor.value}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap size={12} />
                      Recommended Action
                    </p>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border font-bold text-sm ${actionColors[result.recommendedAction]}`}>
                      <Zap size={14} className="flex-shrink-0" fill="currentColor" />
                      <span>{result.recommendedAction}</span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      {result.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}