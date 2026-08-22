'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowLeft,
  Zap,
  BarChart2,
  Info,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockRequests = [
  {
    id: '#1042',
    title: 'License Renewal',
    department: 'Licensing',
    stage: 'Approval',
    slaRemaining: '6h 12m',
    riskScore: 92,
    level: 'HIGH' as const,
    action: 'ESCALATE',
    stageMultiplier: '1.75×',
  },
  {
    id: '#1038',
    title: 'Revenue Audit',
    department: 'Finance',
    stage: 'Review',
    slaRemaining: '14h 30m',
    riskScore: 67,
    level: 'MEDIUM' as const,
    action: 'PRIORITIZE',
    stageMultiplier: '1.3×',
  },
  {
    id: '#1035',
    title: 'Employee Onboarding',
    department: 'HR',
    stage: 'Verification',
    slaRemaining: '28h 00m',
    riskScore: 28,
    level: 'LOW' as const,
    action: 'MONITOR',
    stageMultiplier: '0.9×',
  },
  {
    id: '#1031',
    title: 'Contract Processing',
    department: 'Revenue',
    stage: 'Document Processing',
    slaRemaining: '4h 45m',
    riskScore: 88,
    level: 'HIGH' as const,
    action: 'REASSIGN',
    stageMultiplier: '2.1×',
  },
  {
    id: '#1029',
    title: 'Compliance Review',
    department: 'Finance',
    stage: 'Approval',
    slaRemaining: '22h 00m',
    riskScore: 44,
    level: 'MEDIUM' as const,
    action: 'ADD RESOURCES',
    stageMultiplier: '1.4×',
  },
];

const chartData = [
  { time: '−24h', high: 3, medium: 5, low: 8 },
  { time: '−18h', high: 4, medium: 6, low: 7 },
  { time: '−12h', high: 5, medium: 5, low: 6 },
  { time: '−6h', high: 6, medium: 7, low: 5 },
  { time: 'Now', high: 8, medium: 6, low: 4 },
];

const levelColors = {
  HIGH: { text: 'text-risk-high', badge: 'risk-high-badge', bg: 'bg-risk-high/10' },
  MEDIUM: { text: 'text-risk-medium', badge: 'risk-medium-badge', bg: 'bg-risk-medium/10' },
  LOW: { text: 'text-risk-low', badge: 'risk-low-badge', bg: 'bg-risk-low/10' },
};

export default function DashboardClient() {
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [lastRefreshed] = useState('Aug 22, 2026 13:51');

  const filtered = filter === 'ALL' ? mockRequests : mockRequests.filter(r => r.level === filter);

  const stats = {
    high: mockRequests.filter(r => r.level === 'HIGH').length,
    medium: mockRequests.filter(r => r.level === 'MEDIUM').length,
    low: mockRequests.filter(r => r.level === 'LOW').length,
    total: mockRequests.length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border glass-card-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft size={14} />
              Back
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 border border-primary/30">
                <ShieldAlert size={12} className="text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground">ForeSight</span>
              <span className="text-muted-foreground text-sm">/ Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw size={11} />
            <span>Updated {lastRefreshed}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-extrabold text-foreground mb-1">SLA Risk Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time monitoring of at-risk operational requests.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {[
            { label: 'Total Active', value: stats.total, icon: BarChart2, color: 'text-primary', border: 'border-primary/20' },
            { label: 'High Risk', value: stats.high, icon: AlertTriangle, color: 'text-risk-high', border: 'border-risk-high/20' },
            { label: 'Medium Risk', value: stats.medium, icon: Info, color: 'text-risk-medium', border: 'border-risk-medium/20' },
            { label: 'Low Risk', value: stats.low, icon: CheckCircle, color: 'text-risk-low', border: 'border-risk-low/20' },
          ].map((stat) => (
            <div key={stat.label} className={`glass-card rounded-2xl p-4 border ${stat.border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                <stat.icon size={14} className={stat.color} />
              </div>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Chart + Filter row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <motion.div
            className="lg:col-span-2 glass-card rounded-2xl p-5 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp size={13} className="text-primary" />
              Risk Distribution Over Time
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--risk-high)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--risk-high)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--risk-medium)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--risk-medium)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="high" stroke="var(--risk-high)" fill="url(#highGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="medium" stroke="var(--risk-medium)" fill="url(#medGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="low" stroke="var(--risk-low)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            className="glass-card rounded-2xl p-5 border border-border flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap size={13} className="text-primary" />
              Urgent Actions
            </h3>
            {mockRequests
              .filter(r => r.level === 'HIGH')
              .map(r => (
                <div key={r.id} className="p-3 rounded-xl bg-risk-high/5 border border-risk-high/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{r.id} {r.title}</span>
                    <span className="text-xs font-bold text-risk-high">{r.riskScore}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={10} className="text-risk-high" />
                    <span className="text-xs text-risk-high font-semibold">{r.action}</span>
                  </div>
                </div>
              ))}
          </motion.div>
        </div>

        {/* Request Table */}
        <motion.div
          className="glass-card rounded-2xl border border-border overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {/* Table header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Active Requests</h3>
            <div className="flex items-center gap-2">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Request', 'Department', 'Stage', 'SLA Remaining', 'Risk Score', 'Level', 'Action'].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => {
                  const colors = levelColors[req.level];
                  return (
                    <motion.tr
                      key={req.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-foreground text-xs">{req.id}</p>
                          <p className="text-xs text-muted-foreground">{req.title}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">{req.department}</td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-xs text-foreground">{req.stage}</p>
                          <p className="text-xs text-risk-medium">{req.stageMultiplier} normal</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className={req.level === 'HIGH' ? 'text-risk-high' : 'text-muted-foreground'} />
                          <span className={`text-xs font-semibold ${req.level === 'HIGH' ? 'text-risk-high' : 'text-foreground'}`}>
                            {req.slaRemaining}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-base font-extrabold ${colors.text}`}>{req.riskScore}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`${colors.badge} text-xs font-bold px-2 py-1 rounded-full`}>
                          {req.level}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold w-fit ${
                          req.action === 'ESCALATE' ? 'border-risk-high/40 text-risk-high bg-risk-high/10' :
                          req.action === 'REASSIGN' ? 'border-risk-medium/40 text-risk-medium bg-risk-medium/10' :
                          req.action === 'PRIORITIZE' ? 'border-primary/40 text-primary bg-primary/10' :
                          req.action === 'ADD RESOURCES'? 'border-accent/40 text-accent bg-accent/10' : 'border-risk-low/40 text-risk-low bg-risk-low/10'
                        }`}>
                          <Zap size={10} />
                          {req.action}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}