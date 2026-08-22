'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  X,
  Users,
  ChevronRight,
  CircleCheck,
  UserRoundCog,
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

import {
  calculateRisk,
  type Department,
  type Stage,
  type RiskLevel,
  type RecommendedAction,
} from '../../../lib/risk-engine';

import EmployeeCapacityCheck from './EmployeeCapacityCheck';
import WorkRequestCreator from './WorkRequestCreator';


// ============================================================
// TYPES
// ============================================================

type Request = {
  id: string;
  title: string;
  department: Department;
  stage: Stage;
  slaHoursRemaining: number;
  currentStageDurationHours: number;
  historicalStageDelayRate: number;
  departmentDelayRate: number;
};


// ============================================================
// DEMO REQUEST DATA
// ============================================================

const initialRequests: Request[] = [
  {
    id: '#1042',
    title: 'License Renewal',
    department: 'Licensing',
    stage: 'Approval',
    slaHoursRemaining: 6.2,
    currentStageDurationHours: 18,
    historicalStageDelayRate: 46,
    departmentDelayRate: 34,
  },
  {
    id: '#1038',
    title: 'Revenue Audit',
    department: 'Finance',
    stage: 'Review',
    slaHoursRemaining: 14.5,
    currentStageDurationHours: 9,
    historicalStageDelayRate: 31,
    departmentDelayRate: 21,
  },
  {
    id: '#1035',
    title: 'Employee Onboarding',
    department: 'HR',
    stage: 'Verification',
    slaHoursRemaining: 28,
    currentStageDurationHours: 4,
    historicalStageDelayRate: 12,
    departmentDelayRate: 9,
  },
  {
    id: '#1031',
    title: 'Contract Processing',
    department: 'Revenue',
    stage: 'Document Processing',
    slaHoursRemaining: 4.75,
    currentStageDurationHours: 21,
    historicalStageDelayRate: 43,
    departmentDelayRate: 36,
  },
  {
    id: '#1029',
    title: 'Compliance Review',
    department: 'Finance',
    stage: 'Approval',
    slaHoursRemaining: 22,
    currentStageDurationHours: 11,
    historicalStageDelayRate: 27,
    departmentDelayRate: 18,
  },
  {
    id: '#1024',
    title: 'Vendor Registration',
    department: 'Revenue',
    stage: 'Verification',
    slaHoursRemaining: 31,
    currentStageDurationHours: 5,
    historicalStageDelayRate: 15,
    departmentDelayRate: 22,
  },
  {
    id: '#1018',
    title: 'Permit Amendment',
    department: 'Licensing',
    stage: 'Review',
    slaHoursRemaining: 9,
    currentStageDurationHours: 13,
    historicalStageDelayRate: 38,
    departmentDelayRate: 34,
  },
  {
    id: '#1012',
    title: 'Payroll Exception',
    department: 'HR',
    stage: 'Approval',
    slaHoursRemaining: 19,
    currentStageDurationHours: 7,
    historicalStageDelayRate: 23,
    departmentDelayRate: 12,
  },
];


// ============================================================
// CHART DATA
// ============================================================

const chartData = [
  { time: '−24h', high: 3, medium: 5, low: 8 },
  { time: '−18h', high: 4, medium: 6, low: 7 },
  { time: '−12h', high: 5, medium: 5, low: 6 },
  { time: '−6h', high: 6, medium: 7, low: 5 },
  { time: 'Now', high: 8, medium: 6, low: 4 },
];


// ============================================================
// RISK COLORS
// ============================================================

const levelColors = {
  HIGH: {
    text: 'text-risk-high',
    badge: 'risk-high-badge',
    bg: 'bg-risk-high/10',
  },

  MEDIUM: {
    text: 'text-risk-medium',
    badge: 'risk-medium-badge',
    bg: 'bg-risk-medium/10',
  },

  LOW: {
    text: 'text-risk-low',
    badge: 'risk-low-badge',
    bg: 'bg-risk-low/10',
  },
};


const severityColors = {
  high: 'text-risk-high',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
};


const actionStyles: Record<RecommendedAction, string> = {
  ESCALATE:
    'border-risk-high/40 text-risk-high bg-risk-high/10',

  REASSIGN:
    'border-risk-medium/40 text-risk-medium bg-risk-medium/10',

  PRIORITIZE:
    'border-primary/40 text-primary bg-primary/10',

  'ADD RESOURCES':
    'border-accent/40 text-accent bg-accent/10',

  MONITOR:
    'border-risk-low/40 text-risk-low bg-risk-low/10',
};


// ============================================================
// HELPERS
// ============================================================

function formatRemaining(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  return `${h}h ${String(m).padStart(2, '0')}m`;
}


function riskFor(req: Request) {
  return calculateRisk({
    department: req.department,
    currentStage: req.stage,
    slaHoursRemaining: req.slaHoursRemaining,
    currentStageDurationHours: req.currentStageDurationHours,
    historicalStageDelayRate: req.historicalStageDelayRate,
    departmentDelayRate: req.departmentDelayRate,
  });
}


// ============================================================
// DASHBOARD
// ============================================================

export default function DashboardClient() {
  const [requests, setRequests] = useState(initialRequests);

  const [filter, setFilter] =
    useState<'ALL' | RiskLevel>('ALL');

  const [query, setQuery] = useState('');

  const [selected, setSelected] =
    useState<Request | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);


  // ==========================================================
  // CALCULATE RISK
  // ==========================================================

  const enriched = useMemo(() => {
    return requests.map((req) => ({
      ...req,
      risk: riskFor(req),
    }));
  }, [requests]);


  // ==========================================================
  // SEARCH + FILTER
  // ==========================================================

  const filtered = enriched.filter((r) => {
    const matchesFilter =
      filter === 'ALL' || r.risk.level === filter;

    const q = query.toLowerCase();

    const matchesSearch =
      !q ||
      `${r.id} ${r.title} ${r.department} ${r.stage}`
        .toLowerCase()
        .includes(q);

    return matchesFilter && matchesSearch;
  });


  // ==========================================================
  // STATS
  // ==========================================================

  const stats = {
    high: enriched.filter(
      (r) => r.risk.level === 'HIGH'
    ).length,

    medium: enriched.filter(
      (r) => r.risk.level === 'MEDIUM'
    ).length,

    low: enriched.filter(
      (r) => r.risk.level === 'LOW'
    ).length,

    total: enriched.length,
  };


  // ==========================================================
  // STAT CARDS
  // ==========================================================

  const statsCards = [
    {
      label: 'Total Active',
      value: stats.total,
      Icon: BarChart2,
      color: 'text-primary',
      border: 'border-primary/20',
    },

    {
      label: 'High Risk',
      value: stats.high,
      Icon: AlertTriangle,
      color: 'text-risk-high',
      border: 'border-risk-high/20',
    },

    {
      label: 'Medium Risk',
      value: stats.medium,
      Icon: Info,
      color: 'text-risk-medium',
      border: 'border-risk-medium/20',
    },

    {
      label: 'Low Risk',
      value: stats.low,
      Icon: CheckCircle,
      color: 'text-risk-low',
      border: 'border-risk-low/20',
    },
  ];


  // ==========================================================
  // URGENT REQUESTS
  // ==========================================================

  const urgent = enriched
    .filter((r) => r.risk.level === 'HIGH')
    .sort((a, b) => b.risk.score - a.risk.score)
    .slice(0, 3);


  // ==========================================================
  // ACTION
  // ==========================================================

  const takeAction = (
    req: Request,
    action: RecommendedAction
  ) => {
    setNotice(
      `${action} queued for ${req.id} — ${req.title}`
    );

    setSelected(null);

    setTimeout(() => {
      setNotice(null);
    }, 3500);
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-border glass-card-strong sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Back
            </Link>

            <span className="text-border">|</span>

            <div className="flex items-center gap-2">

              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 border border-primary/30">

                <ShieldAlert
                  size={12}
                  className="text-primary"
                />

              </div>

              <span className="font-bold text-sm text-foreground">
                Foresight
              </span>

              <span className="text-muted-foreground text-sm">
                / Command Center
              </span>

            </div>

          </div>


          <div className="flex items-center gap-2 text-xs text-muted-foreground">

            <RefreshCw size={11} />

            <span>
              Live demo data · Aug 22, 2026
            </span>

          </div>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">


        {/* ====================================================
            TITLE
        ==================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

            <div>

              <span className="section-label">
                Operational Intelligence
              </span>

              <h1 className="text-2xl font-extrabold text-foreground mt-2 mb-1">
                SLA Risk Command Center
              </h1>

              <p className="text-sm text-muted-foreground">
                Predict the delay. Understand the cause. Take action before the breach.
              </p>

            </div>


            <Link
              href="/#simulator"
              className="btn-primary text-xs"
            >

              <Zap size={13} />

              Run Risk Simulation

            </Link>

          </div>

        </motion.div>


        {/* ====================================================
            STATS
        ==================================================== */}

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >

          {statsCards.map(
            ({
              label,
              value,
              Icon,
              color,
              border,
            }) => (

              <div
                key={label}
                className={`glass-card rounded-2xl p-4 border ${border}`}
              >

                <div className="flex items-center justify-between mb-2">

                  <span className="text-xs text-muted-foreground font-medium">
                    {label}
                  </span>

                  <Icon
                    size={14}
                    className={color}
                  />

                </div>


                <p
                  className={`text-3xl font-extrabold ${color}`}
                >
                  {value}
                </p>

              </div>

            )
          )}

        </motion.div>


        {/* ====================================================
            CHART + ATTENTION
        ==================================================== */}

        <div className="grid lg:grid-cols-3 gap-6">


          {/* RISK CHART */}

          <motion.div
            className="lg:col-span-2 glass-card rounded-2xl p-5 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >

            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">

              <TrendingUp
                size={13}
                className="text-primary"
              />

              Risk Distribution Over Time

            </h3>


            <ResponsiveContainer
              width="100%"
              height={190}
            >

              <AreaChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: -25,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="highGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="var(--risk-high)"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="var(--risk-high)"
                      stopOpacity={0.02}
                    />

                  </linearGradient>


                  <linearGradient
                    id="medGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="var(--risk-medium)"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="95%"
                      stopColor="var(--risk-medium)"
                      stopOpacity={0.02}
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />


                <XAxis
                  dataKey="time"
                  tick={{
                    fill: 'var(--muted-foreground)',
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />


                <YAxis
                  tick={{
                    fill: 'var(--muted-foreground)',
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />


                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />


                <Area
                  type="monotone"
                  dataKey="high"
                  stroke="var(--risk-high)"
                  fill="url(#highGrad)"
                  strokeWidth={2}
                />


                <Area
                  type="monotone"
                  dataKey="medium"
                  stroke="var(--risk-medium)"
                  fill="url(#medGrad)"
                  strokeWidth={2}
                />


                <Area
                  type="monotone"
                  dataKey="low"
                  stroke="var(--risk-low)"
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />

              </AreaChart>

            </ResponsiveContainer>

          </motion.div>


          {/* REQUIRES ATTENTION */}

          <motion.div
            className="glass-card rounded-2xl p-5 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">

                <Zap
                  size={13}
                  className="text-primary"
                />

                Requires Attention

              </h3>

              <span className="text-[10px] text-muted-foreground">
                Top 3
              </span>

            </div>


            <div className="space-y-3">

                  <WorkRequestCreator />


              {urgent.length > 0 ? (

                urgent.map((r) => (

                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="w-full text-left p-3 rounded-xl bg-risk-high/5 border border-risk-high/20 hover:bg-risk-high/10 transition-colors"
                  >

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-xs font-bold text-foreground">
                        {r.id} · {r.title}
                      </span>

                      <span className="text-xs font-bold text-risk-high">
                        {r.risk.score}%
                      </span>

                    </div>


                    <p className="text-[11px] text-muted-foreground mb-2">
                      {r.stage} · {formatRemaining(r.slaHoursRemaining)} remaining
                    </p>


                    <div className="flex items-center gap-1.5 text-xs text-risk-high font-semibold">

                      <Zap size={10} />

                      {r.risk.recommendedAction}

                      <ChevronRight
                        size={11}
                        className="ml-auto"
                      />

                    </div>

                  </button>

                ))

              ) : (

                <div className="py-8 text-center">

                  <CheckCircle
                    size={20}
                    className="text-risk-low mx-auto mb-2"
                  />

                  <p className="text-xs text-muted-foreground">
                    No high-risk requests.
                  </p>

                </div>

              )}

            </div>

          </motion.div>

        </div>


        {/* ====================================================
            BOTTLENECKS
        ==================================================== */}

        <motion.div
          className="grid md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >

          {[
            {
              stage: 'Approval',
              multiplier: '2.1×',
              desc: 'Primary bottleneck',
              color: 'text-risk-high',
              Icon: Users,
            },

            {
              stage: 'Review',
              multiplier: '1.4×',
              desc: 'Above normal',
              color: 'text-risk-medium',
              Icon: TrendingUp,
            },

            {
              stage: 'Verification',
              multiplier: '0.9×',
              desc: 'Within target',
              color: 'text-risk-low',
              Icon: CircleCheck,
            },
          ].map(
            ({
              stage,
              multiplier,
              desc,
              color,
              Icon,
            }) => (

              <div
                key={stage}
                className="glass-card rounded-2xl p-4 border border-border"
              >

                <div className="flex items-center gap-2 mb-3">

                  <Icon
                    size={14}
                    className={color}
                  />

                  <span className="text-xs font-semibold text-muted-foreground">
                    {stage}
                  </span>

                </div>


                <div className="flex items-end justify-between">

                  <div>

                    <span
                      className={`text-2xl font-extrabold ${color}`}
                    >
                      {multiplier}
                    </span>

                    <p className="text-[11px] text-muted-foreground mt-1">
                      {desc}
                    </p>

                  </div>


                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    vs normal
                  </span>

                </div>

              </div>

            )
          )}

        </motion.div>


        {/* ====================================================
            EMPLOYEE CAPACITY
        ==================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >

          <EmployeeCapacityCheck />

        </motion.div>


        {/* ====================================================
            REQUEST TABLE
        ==================================================== */}

        <motion.div
          className="glass-card rounded-2xl border border-border overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >

          {/* TABLE HEADER */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 border-b border-border">

            <div>

              <h3 className="text-sm font-bold text-foreground">
                Active Requests
              </h3>

              <p className="text-xs text-muted-foreground mt-1">
                Select a request to inspect the prediction and recommended action.
              </p>

            </div>


            <div className="flex items-center gap-2 flex-wrap">

              {/* SEARCH */}

              <div className="relative">

                <Search
                  size={13}
                  className="absolute left-3 top-2.5 text-muted-foreground"
                />

                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search requests..."
                  className="input-field pl-8 py-2 text-xs w-48"
                />

              </div>


              {/* FILTERS */}

              {(
                ['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const
              ).map((f) => (

                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
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


          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-border">

                  {[
                    'Request',
                    'Department',
                    'Stage',
                    'SLA Remaining',
                    'Risk',
                    'Action',
                  ].map((col) => (

                    <th
                      key={col}
                      className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {col}
                    </th>

                  ))}

                </tr>

              </thead>


              <tbody>

                {filtered.length > 0 ? (

                  filtered.map((req, i) => {

                    const colors =
                      levelColors[req.risk.level];

                    return (

                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: i * 0.03,
                        }}
                        onClick={() =>
                          setSelected(req)
                        }
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                      >

                        <td className="px-5 py-3.5">

                          <p className="font-semibold text-foreground text-xs">
                            {req.id}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {req.title}
                          </p>

                        </td>


                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                          {req.department}
                        </td>


                        <td className="px-5 py-3.5">

                          <p className="text-xs text-foreground">
                            {req.stage}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            {req.currentStageDurationHours}h in stage
                          </p>

                        </td>


                        <td className="px-5 py-3.5">

                          <div className="flex items-center gap-1.5">

                            <Clock
                              size={11}
                              className={
                                req.risk.level === 'HIGH'
                                  ? 'text-risk-high'
                                  : 'text-muted-foreground'
                              }
                            />

                            <span
                              className={`text-xs font-semibold ${
                                req.risk.level === 'HIGH'
                                  ? 'text-risk-high'
                                  : 'text-foreground'
                              }`}
                            >

                              {formatRemaining(
                                req.slaHoursRemaining
                              )}

                            </span>

                          </div>

                        </td>


                        <td className="px-5 py-3.5">

                          <span
                            className={`text-base font-extrabold ${colors.text}`}
                          >
                            {req.risk.score}%
                          </span>

                          <span
                            className={`ml-2 ${colors.badge} text-[10px] font-bold px-2 py-1 rounded-full`}
                          >
                            {req.risk.level}
                          </span>

                        </td>


                        <td className="px-5 py-3.5">

                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold w-fit ${actionStyles[req.risk.recommendedAction]}`}
                          >

                            <Zap size={9} />

                            {req.risk.recommendedAction}

                          </div>

                        </td>

                      </motion.tr>

                    );

                  })

                ) : (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                    >

                      <Search
                        size={20}
                        className="mx-auto mb-2 text-muted-foreground"
                      />

                      <p className="text-sm font-semibold text-foreground">
                        No requests found
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Try changing your search or risk filter.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </motion.div>

      </main>


      {/* ======================================================
          TOAST
      ====================================================== */}

      <AnimatePresence>

        {notice && (

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            className="fixed bottom-5 right-5 z-[70] glass-card-strong border border-primary/30 rounded-xl px-4 py-3 text-xs font-semibold text-foreground shadow-2xl"
          >

            <div className="flex items-center gap-2">

              <CircleCheck
                size={15}
                className="text-risk-low"
              />

              {notice}

            </div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* ======================================================
          REQUEST DETAILS MODAL
      ====================================================== */}

      <AnimatePresence>

        {selected && (

          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >

            <motion.div
              onClick={(e) =>
                e.stopPropagation()
              }
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
              }}
              className="glass-card-strong border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >

              {/* MODAL HEADER */}

              <div className="flex items-start justify-between mb-6">

                <div>

                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                    Request Intelligence
                  </span>

                  <h2 className="text-xl font-extrabold text-foreground mt-1">
                    {selected.id} · {selected.title}
                  </h2>

                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.department} · {selected.stage}
                  </p>

                </div>


                <button
                  onClick={() =>
                    setSelected(null)
                  }
                  className="p-2 rounded-lg border border-border hover:bg-muted/30"
                  aria-label="Close"
                >

                  <X size={15} />

                </button>

              </div>


              {(() => {

                const r = riskFor(selected);

                const c =
                  levelColors[r.level];

                return (

                  <>

                    {/* RISK SCORE */}

                    <div className="grid sm:grid-cols-[150px_1fr] gap-5 mb-6">

                      <div
                        className={`rounded-2xl ${c.bg} border border-current/10 p-5 text-center`}
                      >

                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Risk Score
                        </p>

                        <p
                          className={`text-5xl font-black ${c.text} mt-2`}
                        >
                          {r.score}
                        </p>

                        <span
                          className={`${c.badge} text-[10px] font-bold px-2 py-1 rounded-full`}
                        >
                          {r.level} RISK
                        </span>

                      </div>


                      <div>

                        <h3 className="text-sm font-bold text-foreground mb-2">
                          Why is this request at risk?
                        </h3>

                        <p className="text-xs leading-6 text-muted-foreground">
                          {r.explanation}
                        </p>


                        <div className="flex flex-wrap gap-2 mt-4">

                          <span className="text-[10px] border border-border rounded-lg px-2 py-1 text-muted-foreground">
                            {formatRemaining(
                              selected.slaHoursRemaining
                            )}{' '}
                            SLA left
                          </span>

                          <span className="text-[10px] border border-border rounded-lg px-2 py-1 text-muted-foreground">
                            {selected.currentStageDurationHours}h in stage
                          </span>

                          <span className="text-[10px] border border-border rounded-lg px-2 py-1 text-muted-foreground">
                            {selected.department} delay{' '}
                            {selected.departmentDelayRate}%
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* RISK FACTORS */}

                    <div className="mb-6">

                      <h3 className="text-sm font-bold text-foreground mb-3">
                        Risk factors
                      </h3>


                      <div className="grid sm:grid-cols-2 gap-2">

                        {r.factors.map((factor) => (

                          <div
                            key={factor.label}
                            className="rounded-xl border border-border p-3"
                          >

                            <div className="flex justify-between gap-2">

                              <span className="text-xs font-semibold text-foreground">
                                {factor.label}
                              </span>

                              <span
                                className={`text-[10px] uppercase font-bold ${
                                  severityColors[
                                    factor.severity
                                  ]
                                }`}
                              >
                                {factor.severity}
                              </span>

                            </div>

                            <p className="text-xs text-muted-foreground mt-1">
                              {factor.value}
                            </p>

                          </div>

                        ))}

                      </div>

                    </div>


                    {/* RECOMMENDATION */}

                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6">

                      <div className="flex items-center gap-2 mb-1">

                        <UserRoundCog
                          size={14}
                          className="text-primary"
                        />

                        <span className="text-xs font-bold text-foreground">
                          Foresight recommends
                        </span>

                      </div>

                      <p className="text-sm font-extrabold text-primary">
                        {r.recommendedAction}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Take preventive action before this request crosses its SLA threshold.
                      </p>

                    </div>


                    {/* ACTIONS */}

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          takeAction(
                            selected,
                            r.recommendedAction
                          )
                        }
                        className="btn-primary text-xs"
                      >

                        <Zap size={13} />

                        Take recommended action

                      </button>


                      <button
                        onClick={() =>
                          takeAction(
                            selected,
                            'PRIORITIZE'
                          )
                        }
                        className="text-xs px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted/30"
                      >
                        Prioritize
                      </button>


                      <button
                        onClick={() =>
                          takeAction(
                            selected,
                            'REASSIGN'
                          )
                        }
                        className="text-xs px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted/30"
                      >
                        Reassign
                      </button>

                    </div>

                  </>

                );

              })()}

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}