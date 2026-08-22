'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Database,
  Loader2,
} from 'lucide-react';

import { supabase } from '../../../lib/supabase';


// ============================================================
// TYPES
// ============================================================

type CapacityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

type Employee = {
  id: string;
  employee_code: string;
  name: string;
  email: string;
  department: string | null;
  role: string | null;
  capacity: CapacityLevel;
  availableHours: number;
  currentWorkload: number;
  skills: string[];
};


// ============================================================
// QUESTIONS
// ============================================================

const questions = [
  'How manageable is your current workload?',
  'How much capacity do you have for one more urgent task?',
  'How often are you currently interrupted by competing priorities?',
  'How confident are you that you can complete an urgent request on time?',
];


// ============================================================
// DEMO SKILLS
// ============================================================

const departmentSkills: Record<string, string[]> = {
  Licensing: ['Approval', 'Licensing', 'Verification'],
  Finance: ['Review', 'Audit', 'Approval'],
  Revenue: ['Document Processing', 'Review'],
  HR: ['Verification', 'Onboarding'],
};


// ============================================================
// COMPONENT
// ============================================================

export default function EmployeeCapacityCheck() {
  const [employeeId, setEmployeeId] = useState('');

  const [answers, setAnswers] =
    useState<number[]>([]);

  const [submitted, setSubmitted] =
    useState(false);

  const [showEmployees, setShowEmployees] =
    useState(false);

  const [employee, setEmployee] =
    useState<Employee | null>(null);

  const [bestMatches, setBestMatches] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // ==========================================================
  // CAPACITY SCORE
  // ==========================================================

  const capacityScore = useMemo(() => {
    if (!answers.length) return 0;

    return Math.round(
      (
        answers.reduce(
          (a, b) => a + b,
          0
        ) /
        (answers.length * 5)
      ) * 100
    );
  }, [answers]);


  const capacity: CapacityLevel =
    capacityScore >= 70
      ? 'HIGH'
      : capacityScore >= 45
        ? 'MEDIUM'
        : 'LOW';


  // ==========================================================
  // RESET
  // ==========================================================

  const reset = () => {
    setAnswers([]);
    setSubmitted(false);
    setShowEmployees(false);
    setEmployee(null);
    setBestMatches([]);
    setError(null);
  };


  // ==========================================================
  // FIND EMPLOYEE
  // ==========================================================

  const findEmployee = async () => {
  if (!employeeId.trim()) {
    setError('Please enter your employee ID.');
    return null;
  }

  const code = employeeId.trim().toUpperCase();

  const { data, error } = await supabase
    .from('employees')
    .select(`
      id,
      employee_code,
      name,
      email,
      department,
      role
    `)
    .eq('employee_code', code)
    .maybeSingle();

  if (error) {
    console.error('Employee lookup error:', error);
    setError(`Database error: ${error.message}`);
    return null;
  }

  if (!data) {
    setError(
      'Employee not found. Please check the employee ID.'
    );
    return null;
  }

  return data;
};


  // ==========================================================
  // LOAD ROUTING POOL
  // ==========================================================

  const loadEmployees = async () => {
    const { data, error } =
  await supabase
    .from('employees')
    .select(`
      id,
      employee_code,
      name,
      email,
      department,
      role,
      employee_capacity (
        stress_score,
        stress_level,
        current_workload,
        available_capacity
      )
    `);

    if (error) {
      console.error(error);

      return;
    }

    if (!data) return;


   const mapped: Employee[] = data.map(
  (item: any) => {
    const capacityData =
      Array.isArray(item.employee_capacity)
        ? item.employee_capacity[0]
        : item.employee_capacity;

    const currentWorkload =
      capacityData?.current_workload ?? 0;

    const availableCapacity =
      capacityData?.available_capacity ?? 0;

    const skills =
      departmentSkills[item.department ?? ''] ?? [];

    // Convert stress level into available work capacity
    const employeeCapacity: CapacityLevel =
      capacityData?.stress_level === 'HIGH'
        ? 'LOW'
        : capacityData?.stress_level === 'MEDIUM'
          ? 'MEDIUM'
          : 'HIGH';

    return {
      id: item.id,
      employee_code: item.employee_code,
      name: item.name,
      email: item.email,
      department: item.department,
      role: item.role,
      capacity: employeeCapacity,
      availableHours: availableCapacity,
      currentWorkload,
      skills,
    };
  }
);
      


    const matches = mapped
      .filter(
        (e) =>
          e.capacity !== 'LOW'
      )
      .sort(
        (a, b) =>
          b.availableHours -
            a.availableHours ||
          a.currentWorkload -
            b.currentWorkload
      )
      .slice(0, 3);


    setBestMatches(matches);
  };


  // ==========================================================
  // SUBMIT TEST
  // ==========================================================

  const submitAssessment = async () => {
    setError(null);
    setLoading(true);


    try {

      // -------------------------------------------------------
      // FIND EMPLOYEE
      // -------------------------------------------------------

const currentEmployee = await findEmployee();
if (!currentEmployee) {
  return;
}


      setEmployee({
        ...currentEmployee,
        capacity,
        availableHours: 0,
        currentWorkload: 0,
        skills:
          departmentSkills[
            currentEmployee.department ?? ''
          ] ?? [],
      });


      // -------------------------------------------------------
      // SAVE STRESS ASSESSMENT
      // -------------------------------------------------------

      const stressLevel =
        capacity === 'HIGH'
          ? 'LOW'
          : capacity === 'MEDIUM'
            ? 'MEDIUM'
            : 'HIGH';


      const {
        error: assessmentError,
      } = await supabase
        .from('stress_assessments')
        .insert({
          employee_id:
            currentEmployee.id,

          stress_score:
            100 - capacityScore,

          stress_level:
            stressLevel,

          answers: questions.map(
            (question, index) => ({
              question,
              answer:
                answers[index],
            })
          ),
        });


      if (assessmentError) {
        throw assessmentError;
      }


      // -------------------------------------------------------
      // CHECK EXISTING CAPACITY
      // -------------------------------------------------------

      const {
        data: existingCapacity,
        error: capacityFetchError,
      } = await supabase
        .from('employee_capacity')
        .select('*')
        .eq(
          'employee_id',
          currentEmployee.id
        )
        .maybeSingle();


      if (capacityFetchError) {
        throw capacityFetchError;
      }


      const currentWorkload =
        existingCapacity?.current_workload ??
        0;


      const maxWorkload =
        existingCapacity?.max_workload ??
        10;


      const availableCapacity =
        Math.max(
          maxWorkload -
            currentWorkload,
          0
        );


      // -------------------------------------------------------
      // SAVE / UPDATE CAPACITY
      // -------------------------------------------------------

      if (existingCapacity) {

        const {
          error: updateError,
        } = await supabase
          .from('employee_capacity')
          .update({
            stress_score:
              100 - capacityScore,

            stress_level:
              stressLevel,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'employee_id',
            currentEmployee.id
          );


        if (updateError) {
          throw updateError;
        }

      } else {

        const {
          error: insertError,
        } = await supabase
          .from('employee_capacity')
          .insert({
            employee_id:
              currentEmployee.id,

            stress_score:
              100 - capacityScore,

            stress_level:
              stressLevel,

            current_workload:
              currentWorkload,

            max_workload:
              maxWorkload,
          });


        if (insertError) {
          throw insertError;
        }

      }


      // -------------------------------------------------------
      // UPDATE LOCAL EMPLOYEE
      // -------------------------------------------------------

      setEmployee({
        ...currentEmployee,
        capacity,
        availableHours:
          availableCapacity,
        currentWorkload,
        skills:
          departmentSkills[
            currentEmployee.department ?? ''
          ] ?? [],
      });


      // -------------------------------------------------------
      // LOAD ROUTING POOL
      // -------------------------------------------------------

      await loadEmployees();


      setSubmitted(true);

    } catch (err: any) {

      console.error(
        'Assessment error:',
        err
      );

      setError(
        err?.message ||
          'Something went wrong while saving the assessment.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="glass-card rounded-2xl border border-border p-5">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-start justify-between gap-4 mb-5">

        <div>

          <span className="section-label">
            Workforce Balance
          </span>

          <h2 className="text-lg font-extrabold text-foreground mt-1 flex items-center gap-2">

            <Sparkles
              size={16}
              className="text-primary"
            />

            Foresight Capacity Assistant

          </h2>

          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">

            A voluntary check-in estimates current
            work capacity. It is not a medical or
            psychological diagnosis and should not
            be used as an employment or performance
            score.

          </p>

        </div>

        <ShieldCheck
          size={18}
          className="text-primary shrink-0"
        />

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mb-4 rounded-xl border border-risk-high/30 bg-risk-high/5 p-3">

          <p className="text-xs text-risk-high font-semibold">
            {error}
          </p>

        </div>

      )}


      {/* ======================================================
          TEST
      ====================================================== */}

      {!submitted ? (

        <div className="space-y-4">

          {/* EMPLOYEE ID */}

          <div className="rounded-xl border border-border p-4">

            <label className="text-xs font-semibold text-foreground block mb-2">

              Employee ID

            </label>

            <input
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(
                  e.target.value
                )
              }
              placeholder="Enter your employee ID"
              className="input-field w-full text-xs"
            />

            <p className="text-[10px] text-muted-foreground mt-2">

              Example: EMP-01

            </p>

          </div>


          {/* QUESTIONS */}

          {questions.map(
            (question, index) => (

              <div
                key={question}
                className="rounded-xl border border-border p-4"
              >

                <p className="text-xs font-semibold text-foreground mb-3">

                  {index + 1}. {question}

                </p>


                <div className="grid grid-cols-5 gap-2">

                  {[1, 2, 3, 4, 5].map(
                    (value) => (

                      <button
                        key={value}
                        onClick={() =>
                          setAnswers(
                            (prev) => {

                              const next = [
                                ...prev,
                              ];

                              next[index] =
                                value;

                              return next;

                            }
                          )
                        }
                        className={`py-2 rounded-lg border text-xs font-semibold transition-colors ${
                          answers[index] === value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/20'
                        }`}
                      >

                        {value}

                      </button>

                    )
                  )}

                </div>


                <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">

                  <span>
                    Low capacity
                  </span>

                  <span>
                    High capacity
                  </span>

                </div>

              </div>

            )
          )}


          {/* SUBMIT */}

          <button
            disabled={
              answers.length !==
                questions.length ||
              loading ||
              !employeeId.trim()
            }
            onClick={
              submitAssessment
            }
            className="btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >

            {loading ? (

              <>

                <Loader2
                  size={13}
                  className="animate-spin"
                />

                Saving to Foresight...

              </>

            ) : (

              <>

                <Activity size={13} />

                Generate capacity profile

              </>

            )}

          </button>

        </div>

      ) : (

        /* ====================================================
           RESULTS
        ==================================================== */

        <div className="space-y-5">

          {/* RESULT */}

          <div className="grid sm:grid-cols-[150px_1fr] gap-4">

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">

              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">

                Current capacity

              </p>

              <p className="text-4xl font-black text-primary mt-2">

                {capacityScore}%

              </p>

              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">

                {capacity}

              </span>

            </div>


            <div>

              <h3 className="text-sm font-bold text-foreground">

                Foresight recommendation

              </h3>

              <p className="text-xs leading-6 text-muted-foreground mt-2">

                Use this self-reported capacity
                signal together with skills,
                existing workload and availability.
                High-risk requests should be routed
                to employees who have suitable skills
                and enough current capacity — not
                simply to whoever reports the lowest
                stress.

              </p>


              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-risk-low font-semibold">

                <CheckCircle2
                  size={13}
                />

                Assessment saved to Supabase

                <Database
                  size={12}
                />

              </div>

            </div>

          </div>


          {/* EMPLOYEE INFO */}

          {employee && (

            <div className="rounded-xl border border-border p-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold text-foreground">

                    {employee.name}

                  </p>

                  <p className="text-[10px] text-muted-foreground">
                      {employee.employee_code} · {employee.department}

                  </p>

                </div>


                <span className="text-[10px] font-bold text-primary">

                  {employee.capacity}{' '}
                  CAPACITY

                </span>

              </div>

            </div>

          )}


          {/* ROUTING */}

          <div className="rounded-2xl border border-border p-4">

            <div className="flex items-center justify-between mb-3">

              <div>

                <h3 className="text-sm font-bold text-foreground">

                  Suggested routing pool

                </h3>

                <p className="text-[11px] text-muted-foreground">

                  Ranked by capacity, availability
                  and skill fit.

                </p>

              </div>

              <UserRoundCheck
                size={15}
                className="text-primary"
              />

            </div>


            <div className="space-y-2">

              {bestMatches.length > 0 ? (

                bestMatches.map(
                  (employee, index) => (

                    <div
                      key={employee.id}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >

                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">

                        {index + 1}

                      </span>


                      <div className="min-w-0 flex-1">

                        <p className="text-xs font-semibold text-foreground">

                          {employee.name} ·{' '}
                          {employee.department}

                        </p>

                        <p className="text-[10px] text-muted-foreground">

                          {employee.currentWorkload}{' '}
                          open tasks ·{' '}

                          {employee.availableHours}
                          h available ·{' '}

                          {employee.skills.join(
                            ' · '
                          )}

                        </p>

                      </div>


                      <span className="text-[10px] font-bold text-risk-low">

                        {employee.capacity}{' '}
                        CAPACITY

                      </span>

                    </div>

                  )
                )

              ) : (

                <div className="rounded-xl bg-muted/10 border border-border p-4">

                  <p className="text-xs text-muted-foreground">

                    No suitable employees found
                    in the current routing pool.

                  </p>

                </div>

              )}

            </div>

          </div>


          {/* BUTTONS */}

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                setShowEmployees(
                  (v) => !v
                )
              }
              className="text-xs px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted/30"
            >

              {showEmployees
                ? 'Hide routing preview'
                : 'Preview high-risk routing'}

            </button>


            <button
              onClick={reset}
              className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground"
            >

              Retake check-in

            </button>

          </div>


          {/* ROUTING PREVIEW */}

          {showEmployees && (

            <div className="rounded-xl bg-muted/10 border border-border p-4 text-xs text-muted-foreground">

              {bestMatches.length > 0 ? (

                <>
                  Example: a high-risk request
                  would be offered to{' '}

                  <span className="font-bold text-foreground">

                    {bestMatches[0].name}

                  </span>{' '}

                  first because they have strong
                  current capacity and are available
                  for additional work.

                  Employees with low capacity are
                  excluded from the routing pool.
                </>

              ) : (

                <>
                  Foresight currently has no
                  employee with sufficient capacity
                  for additional high-risk work.
                </>

              )}

            </div>

          )}

        </div>

      )}

    </div>
  );
}