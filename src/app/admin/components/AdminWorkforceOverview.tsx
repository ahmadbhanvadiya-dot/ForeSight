'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Users,
  Building2,
  RefreshCw,
} from 'lucide-react';

import { supabase } from '../../../lib/supabase';

type Employee = {
  id: string;
  employee_code: string;
  name: string;
  department: string;
  employee_capacity?: {
    stress_score?: number;
    stress_level?: string;
    current_workload?: number;
    max_workload?: number;
    available_capacity?: number;
  } | null;
};

type WorkRequest = {
  id: string;
  title: string;
  department: string;
  priority: string;
  risk_score: number;
  status: string;
};

type Stats = {
  totalEmployees: number;
  highCapacity: number;
  mediumCapacity: number;
  lowCapacity: number;

  highStress: number;
  mediumStress: number;
  lowStress: number;

  totalRequests: number;
  pendingRequests: number;
  assignedRequests: number;
  highRiskRequests: number;
  criticalRequests: number;

  averageCapacity: number;

  departmentWorkload: {
    department: string;
    employees: number;
    workload: number;
    maxWorkload: number;
    percentage: number;
  }[];

  alerts: string[];
};

export default function AdminWorkforceOverview() {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [requests, setRequests] =
    useState<WorkRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // =========================================
      // EMPLOYEES + CAPACITY
      // =========================================

      const {
        data: employeeData,
        error: employeeError,
      } = await supabase
        .from('employees')
        .select(`
          id,
          employee_code,
          name,
          department,
          employee_capacity (
            stress_score,
            stress_level,
            current_workload,
            max_workload,
            available_capacity
          )
        `);

      if (employeeError) {
        throw employeeError;
      }

      // =========================================
      // WORK REQUESTS
      // =========================================

      const {
        data: requestData,
        error: requestError,
      } = await supabase
        .from('work_requests')
        .select(`
          id,
          title,
          department,
          priority,
          risk_score,
          status
        `);

      if (requestError) {
        throw requestError;
      }

      setEmployees(
        (employeeData || []) as Employee[]
      );

      setRequests(
        (requestData || []) as WorkRequest[]
      );

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(
        'Admin workforce error:',
        err
      );

      setError(
        err?.message ||
          'Unable to load workforce data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===========================================
  // CALCULATE STATS
  // ===========================================

  const stats = useMemo<Stats>(() => {
    let highCapacity = 0;
    let mediumCapacity = 0;
    let lowCapacity = 0;

    let highStress = 0;
    let mediumStress = 0;
    let lowStress = 0;

    let totalCapacity = 0;
    let capacityEmployees = 0;

    const departmentMap: Record<
      string,
      {
        employees: number;
        workload: number;
        maxWorkload: number;
      }
    > = {};

    employees.forEach((employee) => {
      const rawCapacity =
        employee.employee_capacity;

      const capacity = Array.isArray(
        rawCapacity
      )
        ? rawCapacity[0]
        : rawCapacity;

      if (!capacity) {
        return;
      }

      const stressScore =
        Number(
          capacity.stress_score ?? 50
        );

      const currentWorkload =
        Number(
          capacity.current_workload ?? 0
        );

      const maxWorkload =
        Number(
          capacity.max_workload ?? 10
        );

      const availableCapacity =
        Number(
          capacity.available_capacity ??
            Math.max(
              0,
              maxWorkload -
                currentWorkload
            )
        );

      // ---------------------------------------
      // CAPACITY
      // ---------------------------------------

      const capacityPercentage =
        maxWorkload > 0
          ? Math.round(
              (availableCapacity /
                maxWorkload) *
                100
            )
          : 0;

      totalCapacity +=
        capacityPercentage;

      capacityEmployees++;

      if (capacityPercentage >= 70) {
        highCapacity++;
      } else if (
        capacityPercentage >= 40
      ) {
        mediumCapacity++;
      } else {
        lowCapacity++;
      }

      // ---------------------------------------
      // STRESS
      // ---------------------------------------

      const stressLevel =
        String(
          capacity.stress_level ||
            ''
        ).toUpperCase();

      if (
        stressLevel === 'HIGH' ||
        stressScore >= 70
      ) {
        highStress++;
      } else if (
        stressLevel === 'MEDIUM' ||
        stressScore >= 40
      ) {
        mediumStress++;
      } else {
        lowStress++;
      }

      // ---------------------------------------
      // DEPARTMENT
      // ---------------------------------------

      const department =
        employee.department ||
        'Unknown';

      if (!departmentMap[department]) {
        departmentMap[department] = {
          employees: 0,
          workload: 0,
          maxWorkload: 0,
        };
      }

      departmentMap[
        department
      ].employees += 1;

      departmentMap[
        department
      ].workload +=
        currentWorkload;

      departmentMap[
        department
      ].maxWorkload +=
        maxWorkload;
    });

    // =========================================
    // REQUEST STATS
    // =========================================

    const pendingRequests =
      requests.filter(
        (request) =>
          String(
            request.status
          ).toUpperCase() ===
          'PENDING'
      ).length;

    const assignedRequests =
      requests.filter(
        (request) =>
          String(
            request.status
          ).toUpperCase() ===
          'ASSIGNED'
      ).length;

    const highRiskRequests =
      requests.filter(
        (request) =>
          Number(
            request.risk_score ?? 0
          ) >= 70
      ).length;

    const criticalRequests =
      requests.filter(
        (request) =>
          String(
            request.priority
          ).toUpperCase() ===
            'CRITICAL' ||
          Number(
            request.risk_score ?? 0
          ) >= 90
      ).length;

    // =========================================
    // DEPARTMENT WORKLOAD
    // =========================================

    const departmentWorkload =
      Object.entries(
        departmentMap
      )
        .map(
          ([
            department,
            value,
          ]) => ({
            department,
            employees:
              value.employees,
            workload:
              value.workload,
            maxWorkload:
              value.maxWorkload,
            percentage:
              value.maxWorkload > 0
                ? Math.round(
                    (value.workload /
                      value.maxWorkload) *
                      100
                  )
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.percentage -
            a.percentage
        );

    // =========================================
    // FORESIGHT ALERTS
    // =========================================

    const alerts: string[] = [];

    if (highStress > 0) {
      alerts.push(
        `${highStress} employee${
          highStress === 1
            ? ''
            : 's'
        } currently show high stress.`
      );
    }

    if (lowCapacity > 0) {
      alerts.push(
        `${lowCapacity} employee${
          lowCapacity === 1
            ? ''
            : 's'
        } have low available capacity.`
      );
    }

    const overloadedDepartments =
      departmentWorkload.filter(
        (department) =>
          department.percentage >= 80
      );

    overloadedDepartments.forEach(
      (department) => {
        alerts.push(
          `${department.department} is operating at ${department.percentage}% workload.`
        );
      }
    );

    if (criticalRequests > 0) {
      alerts.push(
        `${criticalRequests} critical request${
          criticalRequests === 1
            ? ''
            : 's'
        } require attention.`
      );
    }

    if (
      pendingRequests > 0
    ) {
      alerts.push(
        `${pendingRequests} request${
          pendingRequests === 1
            ? ''
            : 's'
        } are waiting for assignment.`
      );
    }

    if (!alerts.length) {
      alerts.push(
        'Workforce currently appears balanced.'
      );
    }

    return {
      totalEmployees:
        employees.length,

      highCapacity,
      mediumCapacity,
      lowCapacity,

      highStress,
      mediumStress,
      lowStress,

      totalRequests:
        requests.length,

      pendingRequests,
      assignedRequests,
      highRiskRequests,
      criticalRequests,

      averageCapacity:
        capacityEmployees > 0
          ? Math.round(
              totalCapacity /
                capacityEmployees
            )
          : 0,

      departmentWorkload,
      alerts,
    };
  }, [employees, requests]);

  // ===========================================
  // LOADING
  // ===========================================

  if (loading) {
    return (
      <div className="glass-card rounded-2xl border border-border p-6">

        <div className="flex items-center gap-2">

          <Loader2
            size={16}
            className="animate-spin text-primary"
          />

          <p className="text-xs text-muted-foreground">
            Loading workforce intelligence...
          </p>

        </div>

      </div>
    );
  }

  // ===========================================
  // ERROR
  // ===========================================

  if (error) {
    return (
      <div className="glass-card rounded-2xl border border-risk-high/30 p-5">

        <div className="flex items-start gap-3">

          <AlertTriangle
            size={17}
            className="text-risk-high mt-0.5"
          />

          <div className="flex-1">

            <h3 className="text-sm font-bold text-foreground">
              Workforce data unavailable
            </h3>

            <p className="text-xs text-muted-foreground mt-1">
              {error}
            </p>

            <button
              onClick={loadData}
              className="mt-3 text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted/30 flex items-center gap-2"
            >
              <RefreshCw size={12} />
              Retry
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ===========================================
  // UI
  // ===========================================

  return (
    <div className="space-y-5">

      {/* ======================================= */}
      {/* HEADER */}
      {/* ======================================= */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <span className="section-label">
            Workforce Intelligence
          </span>

          <h2 className="text-xl font-extrabold text-foreground mt-1">
            Foresight Command Center
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Live workforce capacity,
            workload and routing intelligence.
          </p>

          {lastUpdated && (
            <p className="text-[9px] text-muted-foreground mt-2">
              Updated{' '}
              {lastUpdated.toLocaleTimeString()}
            </p>
          )}

        </div>

        <button
          onClick={loadData}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted/30"
          title="Refresh workforce data"
        >
          <RefreshCw size={13} />
        </button>

      </div>


      {/* ======================================= */}
      {/* OVERVIEW CARDS */}
      {/* ======================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <StatCard
          icon={
            <Users size={16} />
          }
          label="Total employees"
          value={
            stats.totalEmployees
          }
          description={`${stats.highCapacity} high capacity`}
        />

        <StatCard
          icon={
            <Activity size={16} />
          }
          label="Avg. capacity"
          value={`${stats.averageCapacity}%`}
          description={`${stats.lowCapacity} low capacity`}
        />

        <StatCard
          icon={
            <ClipboardList size={16} />
          }
          label="Work requests"
          value={
            stats.totalRequests
          }
          description={`${stats.pendingRequests} pending`}
        />

        <StatCard
          icon={
            <AlertTriangle
              size={16}
            />
          }
          label="High-risk requests"
          value={
            stats.highRiskRequests
          }
          description={`${stats.criticalRequests} critical`}
        />

      </div>


      {/* ======================================= */}
      {/* CAPACITY + STRESS */}
      {/* ======================================= */}

      <div className="grid lg:grid-cols-2 gap-4">

        {/* CAPACITY */}

        <div className="glass-card rounded-2xl border border-border p-5">

          <div className="flex items-center gap-2 mb-4">

            <Activity
              size={15}
              className="text-primary"
            />

            <div>

              <h3 className="text-sm font-bold text-foreground">
                Workforce capacity
              </h3>

              <p className="text-[10px] text-muted-foreground">
                Current available capacity
              </p>

            </div>

          </div>

          <div className="space-y-4">

            <DistributionRow
              label="High capacity"
              count={
                stats.highCapacity
              }
              total={
                stats.totalEmployees
              }
            />

            <DistributionRow
              label="Medium capacity"
              count={
                stats.mediumCapacity
              }
              total={
                stats.totalEmployees
              }
            />

            <DistributionRow
              label="Low capacity"
              count={
                stats.lowCapacity
              }
              total={
                stats.totalEmployees
              }
            />

          </div>

        </div>


        {/* STRESS */}

        <div className="glass-card rounded-2xl border border-border p-5">

          <div className="flex items-center gap-2 mb-4">

            <AlertTriangle
              size={15}
              className="text-risk-high"
            />

            <div>

              <h3 className="text-sm font-bold text-foreground">
                Stress distribution
              </h3>

              <p className="text-[10px] text-muted-foreground">
                Employee self-reported stress
              </p>

            </div>

          </div>

          <div className="space-y-4">

            <DistributionRow
              label="Low stress"
              count={
                stats.lowStress
              }
              total={
                stats.totalEmployees
              }
            />

            <DistributionRow
              label="Medium stress"
              count={
                stats.mediumStress
              }
              total={
                stats.totalEmployees
              }
            />

            <DistributionRow
              label="High stress"
              count={
                stats.highStress
              }
              total={
                stats.totalEmployees
              }
            />

          </div>

        </div>

      </div>


      {/* ======================================= */}
      {/* REQUEST OVERVIEW */}
      {/* ======================================= */}

      <div className="glass-card rounded-2xl border border-border p-5">

        <div className="flex items-center gap-2 mb-4">

          <ClipboardList
            size={15}
            className="text-primary"
          />

          <div>

            <h3 className="text-sm font-bold text-foreground">
              Work request intelligence
            </h3>

            <p className="text-[10px] text-muted-foreground">
              Current workload entering the workforce.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          <MiniStat
            label="Pending"
            value={
              stats.pendingRequests
            }
          />

          <MiniStat
            label="Assigned"
            value={
              stats.assignedRequests
            }
          />

          <MiniStat
            label="High risk"
            value={
              stats.highRiskRequests
            }
          />

          <MiniStat
            label="Critical"
            value={
              stats.criticalRequests
            }
          />

        </div>

      </div>


      {/* ======================================= */}
      {/* DEPARTMENT WORKLOAD */}
      {/* ======================================= */}

      <div className="glass-card rounded-2xl border border-border p-5">

        <div className="flex items-center gap-2 mb-4">

          <Building2
            size={15}
            className="text-primary"
          />

          <div>

            <h3 className="text-sm font-bold text-foreground">
              Department workload
            </h3>

            <p className="text-[10px] text-muted-foreground">
              Workload concentration across teams.
            </p>

          </div>

        </div>

        {stats.departmentWorkload.length === 0 ? (

          <p className="text-xs text-muted-foreground">
            No department capacity data available.
          </p>

        ) : (

          <div className="space-y-4">

            {stats.departmentWorkload.map(
              (department) => (

                <div
                  key={
                    department.department
                  }
                >

                  <div className="flex items-center justify-between mb-1.5">

                    <div>

                      <span className="text-xs font-semibold text-foreground">
                        {
                          department.department
                        }
                      </span>

                      <span className="text-[9px] text-muted-foreground ml-2">
                        {
                          department.employees
                        }{' '}
                        employees
                      </span>

                    </div>

                    <span
                      className={`text-xs font-bold ${
                        department.percentage >=
                        80
                          ? 'text-risk-high'
                          : department.percentage >=
                              60
                            ? 'text-yellow-500'
                            : 'text-risk-low'
                      }`}
                    >
                      {
                        department.percentage
                      }%
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-muted overflow-hidden">

                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          department.percentage
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* ======================================= */}
      {/* FORESIGHT ALERTS */}
      {/* ======================================= */}

      <div className="glass-card rounded-2xl border border-border p-5">

        <div className="flex items-center gap-2 mb-4">

          <AlertTriangle
            size={15}
            className="text-primary"
          />

          <div>

            <h3 className="text-sm font-bold text-foreground">
              Foresight alerts
            </h3>

            <p className="text-[10px] text-muted-foreground">
              Signals requiring administrator attention.
            </p>

          </div>

        </div>

        <div className="space-y-2">

          {stats.alerts.map(
            (alert, index) => {

              const isPositive =
                alert.includes(
                  'balanced'
                );

              return (
                <div
                  key={`${alert}-${index}`}
                  className="flex items-start gap-3 rounded-xl border border-border p-3"
                >

                  {isPositive ? (
                    <CheckCircle2
                      size={14}
                      className="text-risk-low mt-0.5"
                    />
                  ) : (
                    <AlertTriangle
                      size={14}
                      className="text-yellow-500 mt-0.5"
                    />
                  )}

                  <p className="text-xs text-muted-foreground">
                    {alert}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}


/* ================================================= */
/* STAT CARD */
/* ================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl border border-border p-4">

      <div className="flex items-center justify-between">

        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>

      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        {label}
      </p>

      <p className="text-2xl font-black text-foreground mt-1">
        {value}
      </p>

      <p className="text-[9px] text-muted-foreground mt-1">
        {description}
      </p>

    </div>
  );
}


/* ================================================= */
/* MINI STAT */
/* ================================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border p-3">

      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="text-xl font-black text-foreground mt-1">
        {value}
      </p>

    </div>
  );
}


/* ================================================= */
/* DISTRIBUTION ROW */
/* ================================================= */

function DistributionRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (count / total) * 100
        )
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between mb-1.5">

        <span className="text-xs text-foreground">
          {label}
        </span>

        <span className="text-[10px] font-bold text-muted-foreground">
          {count} · {percentage}%
        </span>

      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden">

        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}