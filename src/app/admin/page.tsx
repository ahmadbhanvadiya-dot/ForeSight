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
  UserRound,
} from 'lucide-react';
import AdminWorkforceOverview from './components/AdminWorkforceOverview';
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
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [capacities, setCapacities] =
    useState<Capacity[]>([]);

  const [requests, setRequests] =
    useState<WorkRequest[]>([]);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

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

    const criticalRequests =
      requests.filter(
        (request) =>
          Number(request.risk_score ?? 0) >= 90
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

    const overloadedEmployees =
      capacities.filter((item) => {
        const workload = Number(
          item.current_workload ?? 0
        );

        const max = Number(
          item.max_workload ?? 10
        );

        return (
          max > 0 &&
          workload / max >= 0.8
        );
      }).length;

    const assessedEmployeeIds =
      new Set(
        capacities.map(
          (item) => item.employee_id
        )
      );

    const unassessedEmployees =
      employees.filter(
        (employee) =>
          !assessedEmployeeIds.has(
            employee.id
          )
      ).length;

    return {
      totalEmployees:
        employees.length,

      highCapacity,

      mediumCapacity,

      lowCapacity,

      highRiskRequests,

      criticalRequests,

      pendingRequests,

      assignedRequests,

      totalWorkload,

      overloadedEmployees,

      unassessedEmployees,
    };
  }, [
    employees,
    capacities,
    requests,
  ]);
<AdminWorkforceOverview />
  const getEmployeeName = (
    employeeId: string
  ) => {
    return (
      employees.find(
        (employee) =>
          employee.id === employeeId
      )?.name ??
      'Unknown employee'
    );
  };

  const getEmployee = (
    employeeId: string
  ) => {
    return employees.find(
      (employee) =>
        employee.id === employeeId
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

  const getWorkloadPercentage = (
    capacity: Capacity | undefined
  ) => {
    const workload = Number(
      capacity?.current_workload ?? 0
    );

    const max = Number(
      capacity?.max_workload ?? 10
    );

    if (max <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (workload / max) * 100
      )
    );
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
          item.employee_id ===
          selectedEmployee.id
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
            Workforce capacity, workload,
            risk and intelligent request routing.
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


      {/* TOP STATS */}

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
          description="Available for additional work"
          positive
        />

        <StatCard
          icon={<AlertTriangle size={17} />}
          label="High Risk Requests"
          value={stats.highRiskRequests}
          description="Risk score ≥ 70"
          danger={
            stats.highRiskRequests > 0
          }
        />

        <StatCard
          icon={<Activity size={17} />}
          label="Active Workload"
          value={stats.totalWorkload}
          description="Total current workload"
        />

      </div>


      {/* WORKFORCE HEALTH */}

      <section className="glass-card rounded-2xl border border-border p-5 mb-6">

        <div className="flex items-center justify-between mb-5">

          <div>

            <span className="section-label">
              Workforce Health
            </span>

            <h2 className="text-lg font-extrabold text-foreground mt-1">
              Capacity Overview
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Current employee capacity based on
              the latest Foresight check-ins.
            </p>

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


        {/* HEALTH ALERTS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">

          <HealthAlert
            label="Overloaded Employees"
            value={
              stats.overloadedEmployees
            }
            description="≥ 80% workload"
            danger={
              stats.overloadedEmployees > 0
            }
          />

          <HealthAlert
            label="Unassessed Employees"
            value={
              stats.unassessedEmployees
            }
            description="No capacity profile"
          />

          <HealthAlert
            label="Critical Requests"
            value={
              stats.criticalRequests
            }
            description="Risk score ≥ 90"
            danger={
              stats.criticalRequests > 0
            }
          />

        </div>

      </section>


      {/* WORKLOAD BALANCE */}

      <section className="glass-card rounded-2xl border border-border p-5 mb-6">

        <div className="flex items-center justify-between mb-5">

          <div>

            <span className="section-label">
              Workforce Balance
            </span>

            <h2 className="text-lg font-extrabold text-foreground mt-1">
              Employee Workload
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Foresight monitors workload before
              routing additional work.
            </p>

          </div>

          <Activity
            size={18}
            className="text-primary"
          />

        </div>


        {employees.length === 0 ? (

          <EmptyState
            icon={<Users size={18} />}
            message="No employees found."
          />

        ) : (

          <div className="space-y-3">

            {employees.map((employee) => {

              const capacity =
                capacities.find(
                  (item) =>
                    item.employee_id ===
                    employee.id
                );

              const workload =
                Number(
                  capacity?.current_workload ??
                    0
                );

              const maxWorkload =
                Number(
                  capacity?.max_workload ??
                    10
                );

              const percentage =
                getWorkloadPercentage(
                  capacity
                );

              const overloaded =
                percentage >= 80;

              return (
                <button
                  key={employee.id}
                  onClick={() =>
                    setSelectedEmployee(
                      employee
                    )
                  }
                  className="w-full text-left rounded-xl border border-border p-4 hover:bg-muted/20 transition-colors"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {employee.name
                          ?.slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-bold text-foreground">
                          {employee.name}
                        </p>

                        <p className="text-[10px] text-muted-foreground mt-1">
                          {employee.employee_code}
                          {' · '}
                          {employee.department ??
                            'No department'}
                        </p>

                      </div>

                    </div>


                    <div className="text-right">

                      <p
                        className={`text-xs font-black ${
                          overloaded
                            ? 'text-risk-high'
                            : 'text-foreground'
                        }`}
                      >
                        {workload}/
                        {maxWorkload}
                      </p>

                      <p className="text-[9px] text-muted-foreground">
                        {percentage}% workload
                      </p>

                    </div>

                  </div>


                  <div className="h-2 rounded-full bg-muted/30 mt-3 overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all ${
                        overloaded
                          ? 'bg-risk-high'
                          : 'bg-primary'
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>


                  <div className="flex justify-between mt-2">

                    <span className="text-[9px] text-muted-foreground">

                      {capacity?.available_capacity ??
                        0}

                      {' '}
                      available capacity

                    </span>


                    {overloaded && (

                      <span className="text-[9px] font-bold text-risk-high">
                        HIGH WORKLOAD
                      </span>

                    )}

                  </div>

                </button>
              );
            })}

          </div>

        )}

      </section>


      {/* RISK MONITOR */}

      <section className="glass-card rounded-2xl border border-border p-5 mb-6">

        <div className="flex items-center justify-between mb-5">

          <div>

            <span className="section-label">
              Risk Intelligence
            </span>

            <h2 className="text-lg font-extrabold text-foreground mt-1">
              High-Risk Requests
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Requests requiring careful workforce
              routing.
            </p>

          </div>

          <AlertTriangle
            size={18}
            className="text-risk-high"
          />

        </div>


        {requests.filter(
          (request) =>
            Number(
              request.risk_score ?? 0
            ) >= 70
        ).length === 0 ? (

          <EmptyState
            icon={<CheckCircle2 size={18} />}
            message="No high-risk requests currently."
          />

        ) : (

          <div className="space-y-3">

            {requests
              .filter(
                (request) =>
                  Number(
                    request.risk_score ?? 0
                  ) >= 70
              )
              .slice(0, 8)
              .map((request) => {

                const assignment =
                  assignments.find(
                    (item) =>
                      item.request_id ===
                      request.id
                  );

                const employee =
                  assignment
                    ? getEmployee(
                        assignment.employee_id
                      )
                    : null;

                const risk =
                  Number(
                    request.risk_score ?? 0
                  );

                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-risk-high/20 bg-risk-high/5 p-4"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <p className="text-xs font-bold text-foreground">
                          {request.title}
                        </p>

                        <p className="text-[10px] text-muted-foreground mt-1">
                          {request.department ??
                            'No department'}
                          {' · '}
                          {request.priority ??
                            'HIGH'}
                        </p>

                      </div>


                      <span className="shrink-0 text-[10px] font-black text-risk-high">
                        RISK {risk}
                      </span>

                    </div>


                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">

                      <span className="text-[10px] text-muted-foreground">

                        {employee
                          ? `Assigned → ${employee.name}`
                          : 'Not assigned'}

                      </span>


                      <span className="text-[9px] font-bold text-primary">
                        {request.status ??
                          'PENDING'}
                      </span>

                    </div>


                    {/* ROUTING EXPLANATION */}

                    {employee && (
                      <div className="mt-3 rounded-lg bg-background/40 border border-primary/10 p-3">

                        <div className="flex items-center gap-2">

                          <Zap
                            size={12}
                            className="text-primary"
                          />

                          <p className="text-[9px] uppercase tracking-widest text-primary font-bold">
                            Foresight Routing
                          </p>

                        </div>

                        <p className="text-[10px] text-muted-foreground mt-2">

                          Assigned to{' '}

                          <span className="font-bold text-foreground">
                            {employee.name}
                          </span>

                          {' '}because the employee
                          is currently eligible for
                          this request based on
                          workforce capacity and
                          routing criteria.

                        </p>

                      </div>
                    )}

                  </div>
                );
              })}

          </div>

        )}

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
                .slice(0, 8)
                .map((request) => {

                  const assignment =
                    assignments.find(
                      (item) =>
                        item.request_id ===
                        request.id
                    );

                  const employee =
                    assignment
                      ? getEmployee(
                          assignment.employee_id
                        )
                      : null;

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


                      <div className="flex items-center justify-between mt-3">

                        <span className="text-[10px] text-muted-foreground">

                          {assignment
                            ? `Assigned → ${
                                employee?.name ??
                                'Unknown'
                              }`
                            : request.status ??
                              'PENDING'}

                        </span>


                        <span className="text-[10px] font-semibold text-primary">
                          {request.status ??
                            'PENDING'}
                        </span>

                      </div>


                      {assignment && (
                        <div className="mt-3 rounded-lg bg-primary/5 border border-primary/10 p-3">

                          <div className="flex items-center gap-2">

                            <ShieldCheck
                              size={12}
                              className="text-primary"
                            />

                            <p className="text-[9px] uppercase tracking-widest text-primary font-bold">
                              Foresight Routing
                            </p>

                          </div>

                          <p className="text-[10px] text-muted-foreground mt-1">

                            Routed to{' '}

                            <span className="font-bold text-foreground">
                              {employee?.name ??
                                'Unknown employee'}
                            </span>

                            {' '}using workforce
                            availability, capacity
                            and request routing
                            criteria.

                          </p>

                        </div>
                      )}

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
                .slice(0, 10)
                .map((employee) => {

                  const capacity =
                    capacities.find(
                      (item) =>
                        item.employee_id ===
                        employee.id
                    );

                  return (
                    <button
                      key={employee.id}
                      onClick={() =>
                        setSelectedEmployee(
                          employee
                        )
                      }
                      className="w-full text-left flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/20 transition-colors"
                    >

                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">

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

                    </button>
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


      {/* FOOTER STATUS */}

      <div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-4">

        <div className="flex items-start gap-3">

          <ShieldCheck
            size={16}
            className="text-primary shrink-0 mt-0.5"
          />

          <div>

            <p className="text-xs font-bold text-foreground">
              Foresight Workforce Protection
            </p>

            <p className="text-[10px] leading-5 text-muted-foreground mt-1">

              Capacity signals are intended to
              support workload balancing and
              should not be treated as medical
              diagnoses or employee performance
              scores.

            </p>

          </div>

        </div>

      </div>

    </main>
  );
}


/* =========================================================
   STAT CARD
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


/* =========================================================
   CAPACITY CARD
========================================================= */

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


/* =========================================================
   HEALTH ALERT
========================================================= */

function HealthAlert({
  label,
  value,
  description,
  danger,
}: {
  label: string;
  value: number;
  description: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? 'border-risk-high/20 bg-risk-high/5'
          : 'border-border'
      }`}
    >

      <div className="flex items-center justify-between">

        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>

        {danger && (
          <AlertTriangle
            size={13}
            className="text-risk-high"
          />
        )}

      </div>


      <p
        className={`text-2xl font-black mt-1 ${
          danger
            ? 'text-risk-high'
            : 'text-foreground'
        }`}
      >
        {value}
      </p>


      <p className="text-[9px] text-muted-foreground mt-1">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   MINI STAT
========================================================= */

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


/* =========================================================
   EMPTY STATE
========================================================= */

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