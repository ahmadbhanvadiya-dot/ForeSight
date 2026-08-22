'use client';

import { useEffect, useMemo, useState } from 'react';
import EmployeeDetails from './components/EmployeeDetails';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Users,
  Zap,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

type Employee = {
  id: string;
  employee_code: string;
  name: string;
  department: string | null;
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
  created_at: string;
};

type Assignment = {
  id: string;
  request_id: string;
  employee_id: string;
  status: string | null;
};

export default function AdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
  useState<Employee | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        employeesResponse,
        capacityResponse,
        requestsResponse,
        assignmentsResponse,
      ] = await Promise.all([
        supabase
          .from('employees')
          .select(
            'id, employee_code, name, department'
          ),

        supabase
          .from('employee_capacity')
          .select(`
            employee_id,
            stress_score,
            stress_level,
            current_workload,
            max_workload,
            available_capacity
          `),

        supabase
          .from('work_requests')
          .select(`
            id,
            title,
            department,
            priority,
            risk_score,
            status,
            created_at
          `)
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('assignments')
          .select(`
            id,
            request_id,
            employee_id,
            status
          `),
      ]);

      if (employeesResponse.error) {
        throw employeesResponse.error;
      }

      if (capacityResponse.error) {
        throw capacityResponse.error;
      }

      if (requestsResponse.error) {
        throw requestsResponse.error;
      }

      if (assignmentsResponse.error) {
        throw assignmentsResponse.error;
      }

      setEmployees(
        employeesResponse.data ?? []
      );

      setCapacities(
        capacityResponse.data ?? []
      );

      setRequests(
        requestsResponse.data ?? []
      );

      setAssignments(
        assignmentsResponse.data ?? []
      );
    } catch (err: any) {
      console.error(
        'Admin dashboard error:',
        err
      );

      setError(
        err?.message ||
          'Failed to load admin dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const highCapacity =
      capacities.filter(
        (item) =>
          item.stress_level === 'LOW'
      ).length;

    const mediumCapacity =
      capacities.filter(
        (item) =>
          item.stress_level === 'MEDIUM'
      ).length;

    const lowCapacity =
      capacities.filter(
        (item) =>
          item.stress_level === 'HIGH'
      ).length;

    const highRiskRequests =
      requests.filter(
        (request) =>
          Number(request.risk_score ?? 0) >= 70
      ).length;

    const pendingRequests =
      requests.filter(
        (request) =>
          request.status === 'PENDING'
      ).length;

    const assignedRequests =
      requests.filter(
        (request) =>
          request.status === 'ASSIGNED'
      ).length;

    const totalWorkload =
      capacities.reduce(
        (total, item) =>
          total +
          Number(
            item.current_workload ?? 0
          ),
        0
      );

    return {
      totalEmployees: employees.length,
      highCapacity,
      mediumCapacity,
      lowCapacity,
      highRiskRequests,
      pendingRequests,
      assignedRequests,
      totalWorkload,
    };
  }, [
    employees,
    capacities,
    requests,
  ]);

  const getEmployeeName = (
    employeeId: string
  ) => {
    return (
      employees.find(
        (employee) =>
          employee.id === employeeId
      )?.name ?? 'Unknown employee'
    );
  };

  const getCapacityLabel = (
    stressLevel:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | null
  ) => {
    if (stressLevel === 'LOW') {
      return 'HIGH CAPACITY';
    }

    if (stressLevel === 'MEDIUM') {
      return 'MEDIUM CAPACITY';
    }

    if (stressLevel === 'HIGH') {
      return 'LOW CAPACITY';
    }

    return 'NOT ASSESSED';
  };

  const getCapacityClass = (
    stressLevel:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | null
  ) => {
    if (stressLevel === 'LOW') {
      return 'text-risk-low bg-risk-low/10';
    }

    if (stressLevel === 'MEDIUM') {
      return 'text-yellow-500 bg-yellow-500/10';
    }

    if (stressLevel === 'HIGH') {
      return 'text-risk-high bg-risk-high/10';
    }

    return 'text-muted-foreground bg-muted/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw
            size={16}
            className="animate-spin"
          />
          Loading Foresight Admin...
        </div>
      </div>
    );
  }
    if (selectedEmployee) {
  const selectedCapacity =
    capacities.find(
      (item) =>
        item.employee_id === selectedEmployee.id
    ) ?? null;

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <EmployeeDetails
        employee={selectedEmployee}
        capacity={selectedCapacity}
        requests={requests}
        assignments={assignments}
        onBack={() =>
          setSelectedEmployee(null)
        }
      />
    </main>
  );
}
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <span className="section-label">
            Foresight Intelligence
          </span>

          <h1 className="text-2xl md:text-3xl font-black text-foreground mt-1">
            Admin Dashboard
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            Workforce capacity, workload and
            intelligent request routing.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="self-start md:self-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted/20"
        >
          <RefreshCw size={13} />
          Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-risk-high/30 bg-risk-high/5 p-4 flex gap-3">

          <AlertTriangle
            size={16}
            className="text-risk-high shrink-0"
          />

          <div>
            <p className="text-xs font-bold text-risk-high">
              Dashboard error
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              {error}
            </p>
          </div>

        </div>
      )}


      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <StatCard
          icon={<Users size={17} />}
          label="Total Employees"
          value={stats.totalEmployees}
          description="Employees in workforce"
        />

        <StatCard
          icon={<CheckCircle2 size={17} />}
          label="High Capacity"
          value={stats.highCapacity}
          description="Available for work"
          positive
        />

        <StatCard
          icon={<AlertTriangle size={17} />}
          label="High Risk Requests"
          value={stats.highRiskRequests}
          description="Risk score ≥ 70"
          danger={stats.highRiskRequests > 0}
        />

        <StatCard
          icon={<Activity size={17} />}
          label="Active Workload"
          value={stats.totalWorkload}
          description="Total open workload"
        />

      </div>


      {/* CAPACITY OVERVIEW */}

      <section className="glass-card rounded-2xl border border-border p-5 mb-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <span className="section-label">
              Workforce Health
            </span>

            <h2 className="text-lg font-extrabold text-foreground mt-1">
              Capacity Overview
            </h2>
          </div>

          <ShieldCheck
            size={18}
            className="text-primary"
          />

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <CapacityCard
            label="High Capacity"
            value={stats.highCapacity}
            total={stats.totalEmployees}
            description="Ready for additional work"
            className="text-risk-low bg-risk-low/10"
          />

          <CapacityCard
            label="Medium Capacity"
            value={stats.mediumCapacity}
            total={stats.totalEmployees}
            description="Moderate workload"
            className="text-yellow-500 bg-yellow-500/10"
          />

          <CapacityCard
            label="Low Capacity"
            value={stats.lowCapacity}
            total={stats.totalEmployees}
            description="Avoid additional workload"
            className="text-risk-high bg-risk-high/10"
          />

        </div>

      </section>


      {/* REQUESTS + WORKFORCE */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* RECENT REQUESTS */}

        <section className="glass-card rounded-2xl border border-border p-5">

          <div className="flex items-center justify-between mb-5">

            <div>
              <span className="section-label">
                Work Management
              </span>

              <h2 className="text-lg font-extrabold text-foreground mt-1">
                Recent Requests
              </h2>
            </div>

            <Zap
              size={17}
              className="text-primary"
            />

          </div>


          {requests.length === 0 ? (

            <EmptyState
              icon={<Clock3 size={18} />}
              message="No work requests yet."
            />

          ) : (

            <div className="space-y-2">

              {requests
                .slice(0, 6)
                .map((request) => {

                  const assignment =
                    assignments.find(
                      (item) =>
                        item.request_id ===
                        request.id
                    );

                  return (
                    <div
                      key={request.id}
                      className="rounded-xl border border-border p-3"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="text-xs font-bold text-foreground truncate">
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
                            Number(
                              request.risk_score ??
                                0
                            ) >= 70
                              ? 'text-risk-high bg-risk-high/10'
                              : 'text-risk-low bg-risk-low/10'
                          }`}
                        >
                          {Number(
                            request.risk_score ??
                              0
                          ) >= 70
                            ? 'HIGH RISK'
                            : 'NORMAL'}
                        </span>

                      </div>


                      <div className="flex items-center justify-between mt-3">

                        <span className="text-[10px] text-muted-foreground">
                          {assignment
                            ? `Assigned → ${getEmployeeName(
                                assignment.employee_id
                              )}`
                            : request.status ??
                              'PENDING'}
                        </span>

                        <span className="text-[10px] font-semibold text-primary">
                          {request.status ??
                            'PENDING'}
                        </span>

                      </div>

                    </div>
                  );
                })}

            </div>

          )}

        </section>


        {/* WORKFORCE */}

        <section className="glass-card rounded-2xl border border-border p-5">

          <div className="flex items-center justify-between mb-5">

            <div>
              <span className="section-label">
                Workforce
              </span>

              <h2 className="text-lg font-extrabold text-foreground mt-1">
                Employee Capacity
              </h2>
            </div>

            <TrendingUp
              size={17}
              className="text-primary"
            />

          </div>


          {employees.length === 0 ? (

            <EmptyState
              icon={<Users size={18} />}
              message="No employees found."
            />

          ) : (

            <div className="space-y-2">

              {employees
                .slice(0, 8)
                .map((employee) => {

                  const capacity =
                    capacities.find(
                      (item) =>
                        item.employee_id ===
                        employee.id
                    );

                  return (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >

                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                        {employee.name
                          ?.slice(0, 2)
                          .toUpperCase()}
                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="text-xs font-bold text-foreground">
                          {employee.name}
                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          {employee.employee_code}
                          {' · '}
                          {employee.department ??
                            'No department'}
                        </p>

                      </div>


                      <div className="text-right">

                        <span
                          className={`inline-block text-[9px] font-bold px-2 py-1 rounded-full ${getCapacityClass(
                            capacity?.stress_level ??
                              null
                          )}`}
                        >
                          {getCapacityLabel(
                            capacity?.stress_level ??
                              null
                          )}
                        </span>

                        <p className="text-[9px] text-muted-foreground mt-1">
                          Workload:{' '}
                          {capacity?.current_workload ??
                            0}
                        </p>

                      </div>

                    </div>
                  );
                })}

            </div>

          )}

        </section>

      </div>


      {/* ROUTING SUMMARY */}

      <section className="glass-card rounded-2xl border border-border p-5 mt-6">

        <div className="flex items-center gap-2 mb-4">

          <Zap
            size={16}
            className="text-primary"
          />

          <h2 className="text-sm font-bold text-foreground">
            Foresight Routing Summary
          </h2>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <MiniStat
            label="Pending"
            value={stats.pendingRequests}
          />

          <MiniStat
            label="Assigned"
            value={stats.assignedRequests}
          />

          <MiniStat
            label="High Risk"
            value={stats.highRiskRequests}
          />

          <MiniStat
            label="Total Workload"
            value={stats.totalWorkload}
          />

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  positive,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  positive?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl border border-border p-5">

      <div className="flex items-center justify-between">

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            danger
              ? 'text-risk-high bg-risk-high/10'
              : positive
                ? 'text-risk-low bg-risk-low/10'
                : 'text-primary bg-primary/10'
          }`}
        >
          {icon}
        </div>

      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">
        {label}
      </p>

      <p className="text-3xl font-black text-foreground mt-1">
        {value}
      </p>

      <p className="text-[10px] text-muted-foreground mt-1">
        {description}
      </p>

    </div>
  );
}


function CapacityCard({
  label,
  value,
  total,
  description,
  className,
}: {
  label: string;
  value: number;
  total: number;
  description: string;
  className: string;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div className="rounded-xl border border-border p-4">

      <div className="flex items-center justify-between">

        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${className}`}
        >
          {label}
        </span>

        <span className="text-xl font-black text-foreground">
          {value}
        </span>

      </div>

      <div className="h-2 rounded-full bg-muted/30 mt-4 overflow-hidden">

        <div
          className="h-full bg-primary rounded-full"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="text-[10px] text-muted-foreground mt-2">
        {percentage}% of workforce · {description}
      </p>

    </div>
  );
}


function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border p-4">

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>

      <p className="text-2xl font-black text-foreground mt-1">
        {value}
      </p>

    </div>
  );
}


function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center">

      <div className="text-muted-foreground mb-2">
        {icon}
      </div>

      <p className="text-xs text-muted-foreground">
        {message}
      </p>

    </div>
  );
}