'use client';

import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock3,
  UserRound,
  Zap,
} from 'lucide-react';

type Employee = {
  id: string;
  employee_code: string;
  name: string;
  department: string | null;
  role?: string | null;
};

type Capacity = {
  employee_id: string;
  stress_score: number | null;
  stress_level: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  current_workload: number | null;
  max_workload: number | null;
  available_capacity: number | null;
};

type WorkRequest = {
  id: string;
  title: string;
  department: string | null;
  priority: string | null;
  risk_score: number | null;
  status: string | null;
};

type Assignment = {
  request_id: string;
  employee_id: string;
  status: string | null;
};

type Props = {
  employee: Employee;
  capacity: Capacity | null;
  requests: WorkRequest[];
  assignments: Assignment[];
  onBack: () => void;
};

export default function EmployeeDetails({
  employee,
  capacity,
  requests,
  assignments,
  onBack,
}: Props) {
  const stressLevel =
    capacity?.stress_level ?? null;

  const capacityLabel =
    stressLevel === 'LOW'
      ? 'HIGH CAPACITY'
      : stressLevel === 'MEDIUM'
        ? 'MEDIUM CAPACITY'
        : stressLevel === 'HIGH'
          ? 'LOW CAPACITY'
          : 'NOT ASSESSED';

  const capacityClass =
    stressLevel === 'LOW'
      ? 'text-risk-low bg-risk-low/10 border-risk-low/20'
      : stressLevel === 'MEDIUM'
        ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        : stressLevel === 'HIGH'
          ? 'text-risk-high bg-risk-high/10 border-risk-high/20'
          : 'text-muted-foreground bg-muted/20 border-border';

  const employeeAssignments =
    assignments.filter(
      (assignment) =>
        assignment.employee_id === employee.id
    );

  const employeeRequests =
    employeeAssignments
      .map((assignment) =>
        requests.find(
          (request) =>
            request.id === assignment.request_id
        )
      )
      .filter(Boolean) as WorkRequest[];

  const workload =
    Number(
      capacity?.current_workload ?? 0
    );

  const maxWorkload =
    Number(
      capacity?.max_workload ?? 10
    );

  const available =
    Number(
      capacity?.available_capacity ?? 0
    );

  const workloadPercentage =
    maxWorkload > 0
      ? Math.min(
          100,
          Math.round(
            (workload / maxWorkload) * 100
          )
        )
      : 0;

  return (
    <div className="space-y-6">

      {/* BACK */}

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Back to workforce
      </button>


      {/* HEADER */}

      <div className="glass-card rounded-2xl border border-border p-6">

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <UserRound size={25} />
            </div>

            <div>
              <span className="section-label">
                Employee Profile
              </span>

              <h1 className="text-2xl font-black text-foreground mt-1">
                {employee.name}
              </h1>

              <p className="text-xs text-muted-foreground mt-1">
                {employee.employee_code}
                {' · '}
                {employee.department ??
                  'No department'}
                {employee.role
                  ? ` · ${employee.role}`
                  : ''}
              </p>
            </div>

          </div>


          <span
            className={`self-start text-[10px] font-bold px-3 py-2 rounded-full border ${capacityClass}`}
          >
            {capacityLabel}
          </span>

        </div>

      </div>


      {/* CAPACITY STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <MetricCard
          icon={<Zap size={16} />}
          label="Capacity"
          value={
            stressLevel === 'LOW'
              ? 'High'
              : stressLevel === 'MEDIUM'
                ? 'Medium'
                : stressLevel === 'HIGH'
                  ? 'Low'
                  : 'Unknown'
          }
        />

        <MetricCard
          icon={<Briefcase size={16} />}
          label="Current Workload"
          value={`${workload} / ${maxWorkload}`}
        />

        <MetricCard
          icon={<Clock3 size={16} />}
          label="Available Capacity"
          value={`${available}`}
        />

      </div>


      {/* WORKLOAD */}

      <section className="glass-card rounded-2xl border border-border p-5">

        <div className="flex items-center justify-between mb-4">

          <div>
            <span className="section-label">
              Workload
            </span>

            <h2 className="text-lg font-extrabold text-foreground mt-1">
              Current workload
            </h2>
          </div>

          <span className="text-xs font-bold text-primary">
            {workloadPercentage}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-muted/30 overflow-hidden">

          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${workloadPercentage}%`,
            }}
          />

        </div>

        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>
            {workload} active tasks
          </span>

          <span>
            {available} capacity remaining
          </span>
        </div>

      </section>


      {/* FORESIGHT RECOMMENDATION */}

      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">

        <div className="flex items-center gap-2 mb-3">

          <Zap
            size={16}
            className="text-primary"
          />

          <h2 className="text-sm font-bold text-foreground">
            Foresight Recommendation
          </h2>

        </div>

        <p className="text-xs leading-6 text-muted-foreground">

          {stressLevel === 'LOW'
            ? `${employee.name} currently has strong capacity and can be considered for additional or high-priority work when their skills match the request.`
            : stressLevel === 'MEDIUM'
              ? `${employee.name} has moderate capacity. Foresight should balance new requests with their existing workload.`
              : stressLevel === 'HIGH'
                ? `${employee.name} currently has low capacity. Foresight should avoid assigning additional high-risk work unless necessary.`
                : `No recent capacity assessment is available for ${employee.name}.`}

        </p>

      </section>


      {/* REQUEST HISTORY */}

      <section className="glass-card rounded-2xl border border-border p-5">

        <div className="flex items-center justify-between mb-5">

          <div>
            <span className="section-label">
              Work History
            </span>

            <h2 className="text-lg font-extrabold text-foreground mt-1">
              Assigned Requests
            </h2>
          </div>

          <span className="text-[10px] text-muted-foreground">
            {employeeRequests.length} requests
          </span>

        </div>


        {employeeRequests.length === 0 ? (

          <div className="rounded-xl border border-dashed border-border p-8 text-center">

            <CheckCircle2
              size={20}
              className="mx-auto text-muted-foreground mb-2"
            />

            <p className="text-xs text-muted-foreground">
              No assigned requests yet.
            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {employeeRequests.map(
              (request) => {

                const highRisk =
                  Number(
                    request.risk_score ?? 0
                  ) >= 70;

                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-border p-3"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-xs font-bold text-foreground">
                          {request.title}
                        </p>

                        <p className="text-[10px] text-muted-foreground mt-1">
                          {request.department ??
                            'No department'}
                          {' · '}
                          {request.priority ??
                            'MEDIUM'}
                        </p>

                      </div>

                      <span
                        className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-full ${
                          highRisk
                            ? 'text-risk-high bg-risk-high/10'
                            : 'text-risk-low bg-risk-low/10'
                        }`}
                      >
                        {highRisk
                          ? 'HIGH RISK'
                          : 'NORMAL'}
                      </span>

                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <CheckCircle2 size={12} />
                      {request.status ??
                        'ASSIGNED'}
                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}


function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5">

      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">
        {label}
      </p>

      <p className="text-2xl font-black text-foreground mt-1">
        {value}
      </p>

    </div>
  );
}