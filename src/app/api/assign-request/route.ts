import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      department,
      priority,
      risk_score,
      required_skills,
    } = body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!title?.trim()) {
      return NextResponse.json(
        {
          error:
            'Request title is required.',
        },
        { status: 400 }
      );
    }

    if (!department) {
      return NextResponse.json(
        {
          error:
            'Department is required.',
        },
        { status: 400 }
      );
    }

    const requestRisk = Math.min(
      100,
      Math.max(
        0,
        Number(risk_score ?? 50)
      )
    );

    const requestPriority =
      priority || 'MEDIUM';

    // =====================================================
    // 1. CREATE WORK REQUEST
    // =====================================================

    const {
      data: request,
      error: requestError,
    } = await supabase
      .from('work_requests')
      .insert({
        title: title.trim(),

        description:
          description?.trim() || '',

        department,

        priority:
          requestPriority,

        risk_score:
          requestRisk,

        status:
          'PENDING',
      })
      .select()
      .single();

    if (requestError) {
      console.error(
        'Work request error:',
        requestError
      );

      throw new Error(
        requestError.message
      );
    }

    // =====================================================
    // 2. GET EMPLOYEES + CAPACITY
    // =====================================================

    const {
      data: employees,
      error: employeeError,
    } = await supabase
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
          max_workload,
          available_capacity
        )
      `);

    if (employeeError) {
      console.error(
        'Employee query error:',
        employeeError
      );

      throw new Error(
        employeeError.message
      );
    }

    if (!employees?.length) {
      return NextResponse.json({
        success: true,

        assigned: false,

        request,

        message:
          'Request created, but no employees were found.',
      });
    }

    // =====================================================
    // 3. NORMALIZE REQUIRED SKILLS
    // =====================================================

    const normalizedRequiredSkills =
      Array.isArray(required_skills)
        ? required_skills.map(
            (skill: string) =>
              skill
                .toLowerCase()
                .trim()
          )
        : [];

    // =====================================================
    // 4. SCORE EMPLOYEES
    // =====================================================

    const candidates = employees
      .map((employee: any) => {
        const capacity =
          Array.isArray(
            employee.employee_capacity
          )
            ? employee
                .employee_capacity[0]
            : employee.employee_capacity;

        // ---------------------------------------------
        // Employee has no capacity profile
        // ---------------------------------------------

        if (!capacity) {
          return null;
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
            capacity.available_capacity ?? 0
          );

        // =================================================
        // HARD SAFETY FILTERS
        // =================================================

        // High stress employees should not receive
        // additional work.

        if (
          capacity.stress_level ===
          'HIGH'
        ) {
          return null;
        }

        // No remaining capacity.

        if (
          availableCapacity <= 0
        ) {
          return null;
        }

        // Workload already at maximum.

        if (
          maxWorkload > 0 &&
          currentWorkload >=
            maxWorkload
        ) {
          return null;
        }

        // =================================================
        // A. DEPARTMENT FIT
        // =================================================

        const departmentScore =
          employee.department
            ?.toLowerCase()
            .trim() ===
          department
            ?.toLowerCase()
            .trim()
            ? 100
            : 40;

        // =================================================
        // B. STRESS / CAPACITY
        // =================================================

        const stressCapacityScore =
          Math.max(
            0,
            Math.min(
              100,
              100 - stressScore
            )
          );

        // =================================================
        // C. AVAILABLE CAPACITY
        // =================================================

        const availabilityScore =
          Math.max(
            0,
            Math.min(
              100,
              availableCapacity * 10
            )
          );

        // =================================================
        // D. CURRENT WORKLOAD
        // =================================================

        let workloadScore = 100;

        if (
          maxWorkload > 0
        ) {
          const workloadPercentage =
            (currentWorkload /
              maxWorkload) *
            100;

          workloadScore =
            Math.max(
              0,
              Math.min(
                100,
                100 -
                  workloadPercentage
              )
            );
        }

        // =================================================
        // E. RISK SUITABILITY
        // =================================================

        let riskSuitabilityScore =
          stressCapacityScore;

        /*
         * For low-risk work, normal capacity is enough.
         *
         * For high-risk work, we want employees with
         * significantly better capacity.
         */

        if (requestRisk >= 90) {
          riskSuitabilityScore =
            stressCapacityScore >= 80
              ? 100
              : stressCapacityScore >= 60
                ? 75
                : 40;
        } else if (
          requestRisk >= 70
        ) {
          riskSuitabilityScore =
            stressCapacityScore >= 70
              ? 100
              : stressCapacityScore >= 50
                ? 75
                : 50;
        }

        // =================================================
        // F. SKILL MATCH
        // =================================================

        /*
         * Current employee table may not contain a skills
         * column. Therefore this remains optional.
         */

        const employeeSkills =
          Array.isArray(
            employee.skills
          )
            ? employee.skills.map(
                (skill: string) =>
                  skill
                    .toLowerCase()
                    .trim()
              )
            : [];

        let skillScore = 50;

        if (
          normalizedRequiredSkills
            .length > 0 &&
          employeeSkills.length > 0
        ) {
          const matchedSkills =
            normalizedRequiredSkills.filter(
              (required: string) =>
                employeeSkills.includes(
                  required
                )
            ).length;

          skillScore =
            Math.round(
              (matchedSkills /
                normalizedRequiredSkills.length) *
                100
            );
        } else if (
          normalizedRequiredSkills
            .length === 0
        ) {
          skillScore = 70;
        }

        // =================================================
        // 5. FORESIGHT SCORE
        // =================================================

        /*
         * Weighting:
         *
         * Department       30%
         * Capacity         25%
         * Availability     20%
         * Workload         15%
         * Risk suitability 10%
         *
         * Skill matching is used as a small bonus.
         */

        const baseScore =
          departmentScore * 0.30 +
          stressCapacityScore * 0.25 +
          availabilityScore * 0.20 +
          workloadScore * 0.15 +
          riskSuitabilityScore * 0.10;

        const skillBonus =
          skillScore * 0.05;

        const finalScore =
          Math.min(
            100,
            baseScore * 0.95 +
              skillBonus
          );

        // =================================================
        // RETURN CANDIDATE
        // =================================================

        return {
          employee,

          capacity,

          finalScore,

          departmentScore,

          stressCapacityScore,

          availabilityScore,

          workloadScore,

          riskSuitabilityScore,

          skillScore,
        };
      })
      .filter(Boolean)
      .sort(
        (a: any, b: any) =>
          b.finalScore -
          a.finalScore
      );

    // =====================================================
    // 6. NO SUITABLE EMPLOYEE
    // =====================================================

    if (
      !candidates.length
    ) {
      return NextResponse.json({
        success: true,

        assigned: false,

        request,

        message:
          'No employee currently has enough capacity for this request.',

        foresight: {
          riskScore:
            requestRisk,

          priority:
            requestPriority,

          candidatesEvaluated:
            employees.length,

          candidatesEligible:
            0,
        },
      });
    }

    // =====================================================
    // 7. SELECT BEST EMPLOYEE
    // =====================================================

    const best =
      candidates[0] as any;

    const selectedEmployee =
      best.employee;

    const selectedCapacity =
      best.capacity;

    // =====================================================
    // 8. CREATE ASSIGNMENT
    // =====================================================

    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from('assignments')
      .insert({
        request_id:
          request.id,

        employee_id:
          selectedEmployee.id,

        status:
          'ASSIGNED',
      })
      .select()
      .single();

    if (assignmentError) {
      console.error(
        'Assignment error:',
        assignmentError
      );

      throw new Error(
        assignmentError.message
      );
    }

    // =====================================================
    // 9. UPDATE REQUEST
    // =====================================================

    const {
      error:
        requestUpdateError,
    } = await supabase
      .from('work_requests')
      .update({
        status:
          'ASSIGNED',
      })
      .eq(
        'id',
        request.id
      );

    if (
      requestUpdateError
    ) {
      throw new Error(
        requestUpdateError.message
      );
    }

    // =====================================================
    // 10. UPDATE EMPLOYEE WORKLOAD
    // =====================================================

    const newWorkload =
      Number(
        selectedCapacity.current_workload ??
          0
      ) + 1;

    const {
      error:
        capacityUpdateError,
    } = await supabase
      .from('employee_capacity')
      .update({
        current_workload:
          newWorkload,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'employee_id',
        selectedEmployee.id
      );

    if (
      capacityUpdateError
    ) {
      throw new Error(
        capacityUpdateError.message
      );
    }

    // =====================================================
    // 11. ROUTING EXPLANATION
    // =====================================================

    const explanation = [];

    if (
      best.departmentScore >= 80
    ) {
      explanation.push(
        'Department match'
      );
    }

    if (
      best.stressCapacityScore >= 70
    ) {
      explanation.push(
        'Strong capacity'
      );
    }

    if (
      best.availabilityScore >= 70
    ) {
      explanation.push(
        'Good availability'
      );
    }

    if (
      best.workloadScore >= 70
    ) {
      explanation.push(
        'Low current workload'
      );
    }

    if (
      best.riskSuitabilityScore >= 80
    ) {
      explanation.push(
        'Suitable for request risk'
      );
    }

    if (
      best.skillScore >= 80
    ) {
      explanation.push(
        'Strong skill match'
      );
    }

    // =====================================================
    // 12. RETURN RESULT
    // =====================================================

    return NextResponse.json({
      success: true,

      assigned: true,

      request,

      assignment,

      employee: {
        id:
          selectedEmployee.id,

        employee_code:
          selectedEmployee.employee_code,

        name:
          selectedEmployee.name,

        department:
          selectedEmployee.department,

        role:
          selectedEmployee.role,
      },

      foresightScore:
        Math.round(
          best.finalScore
        ),

      reasoning: {
        department:
          Math.round(
            best.departmentScore
          ),

        capacity:
          Math.round(
            best.stressCapacityScore
          ),

        availability:
          Math.round(
            best.availabilityScore
          ),

        workload:
          Math.round(
            best.workloadScore
          ),

        riskSuitability:
          Math.round(
            best.riskSuitabilityScore
          ),

        skillMatch:
          Math.round(
            best.skillScore
          ),
      },

      routing: {
        requestRisk:
          requestRisk,

        priority:
          requestPriority,

        explanation,

        candidatesEvaluated:
          employees.length,

        candidatesEligible:
          candidates.length,

        selectedEmployee:
          selectedEmployee.name,

        selectedEmployeeCapacity:
          selectedCapacity
            .available_capacity,

        selectedEmployeeWorkload:
          newWorkload,
      },
    });

  } catch (error: any) {
    console.error(
      'Foresight routing error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Foresight routing failed.',
      },
      { status: 500 }
    );
  }
}