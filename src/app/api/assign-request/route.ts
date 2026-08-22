import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

type EmployeeCapacity = {
  employee_id: string;
  stress_score: number;
  stress_level: 'LOW' | 'MEDIUM' | 'HIGH';
  current_workload: number;
  max_workload: number;
  available_capacity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      department,
      priority,
      risk_score,
    } = body;

    if (!title || !department) {
      return NextResponse.json(
        {
          error:
            'Title and department are required.',
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------------
    // 1. CREATE WORK REQUEST
    // --------------------------------------------------------

    const {
      data: request,
      error: requestError,
    } = await supabase
      .from('work_requests')
      .insert({
        title,
        description,
        department,
        priority: priority || 'MEDIUM',
        risk_score: risk_score ?? 50,
        status: 'PENDING',
      })
      .select()
      .single();

    if (requestError) {
      throw requestError;
    }

    // --------------------------------------------------------
    // 2. GET EMPLOYEES + CAPACITY
    // --------------------------------------------------------

    const {
      data: employees,
      error: employeeError,
    } = await supabase
      .from('employees')
      .select(`
        id,
        employee_code,
        name,
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
      throw employeeError;
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: true,
        request,
        assigned: false,
        message:
          'Request created, but no employees are available.',
      });
    }

    // --------------------------------------------------------
    // 3. SCORE EMPLOYEES
    // --------------------------------------------------------

    const scoredEmployees = employees
      .map((employee: any) => {
        const capacity:
          | EmployeeCapacity
          | undefined =
          Array.isArray(
            employee.employee_capacity
          )
            ? employee.employee_capacity[0]
            : employee.employee_capacity;

        if (!capacity) {
          return null;
        }

        // Don't assign overloaded employees
        if (
          capacity.stress_level === 'HIGH'
        ) {
          return null;
        }

        if (
          capacity.available_capacity <= 0
        ) {
          return null;
        }

        // Department match
        const departmentMatch =
          employee.department ===
          department
            ? 100
            : 0;

        // Lower stress = better
        const stressScore =
          100 - capacity.stress_score;

        // More available capacity = better
        const availabilityScore =
          Math.min(
            capacity.available_capacity * 10,
            100
          );

        // Lower workload = better
        const workloadScore =
          Math.max(
            100 -
              capacity.current_workload *
                10,
            0
          );

        // ----------------------------------------------------
        // FINAL FORESIGHT SCORE
        // ----------------------------------------------------

        const finalScore =
          departmentMatch * 0.4 +
          stressScore * 0.25 +
          availabilityScore * 0.2 +
          workloadScore * 0.15;

        return {
          employee,
          capacity,
          finalScore,
          departmentMatch,
          stressScore,
          availabilityScore,
          workloadScore,
        };
      })
      .filter(Boolean)
      .sort(
        (a: any, b: any) =>
          b.finalScore -
          a.finalScore
      );

    // --------------------------------------------------------
    // 4. NO EMPLOYEE AVAILABLE
    // --------------------------------------------------------

    if (
      scoredEmployees.length === 0
    ) {
      return NextResponse.json({
        success: true,
        request,
        assigned: false,
        message:
          'No suitable employee currently has enough capacity.',
      });
    }

    // --------------------------------------------------------
    // 5. SELECT BEST EMPLOYEE
    // --------------------------------------------------------

    const best =
      scoredEmployees[0] as any;

    const selectedEmployee =
      best.employee;

    const selectedCapacity =
      best.capacity;

    // --------------------------------------------------------
    // 6. CREATE ASSIGNMENT
    // --------------------------------------------------------

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

        status: 'ASSIGNED',
      })
      .select()
      .single();

    if (assignmentError) {
      throw assignmentError;
    }

    // --------------------------------------------------------
    // 7. UPDATE REQUEST STATUS
    // --------------------------------------------------------

    const {
      error: updateRequestError,
    } = await supabase
      .from('work_requests')
      .update({
        status: 'ASSIGNED',
      })
      .eq('id', request.id);

    if (updateRequestError) {
      throw updateRequestError;
    }

    // --------------------------------------------------------
    // 8. INCREASE EMPLOYEE WORKLOAD
    // --------------------------------------------------------

    const newWorkload =
      selectedCapacity.current_workload +
      1;

    const {
      error: workloadError,
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

    if (workloadError) {
      throw workloadError;
    }

    // --------------------------------------------------------
    // 9. RETURN FORESIGHT DECISION
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,

      assigned: true,

      request,

      assignment,

      employee: {
        id: selectedEmployee.id,

        employee_code:
          selectedEmployee.employee_code,

        name:
          selectedEmployee.name,

        department:
          selectedEmployee.department,
      },

      foresightScore:
        Math.round(
          best.finalScore
        ),

      reasoning: {
        departmentMatch:
          best.departmentMatch,

        stressScore:
          Math.round(
            best.stressScore
          ),

        availabilityScore:
          Math.round(
            best.availabilityScore
          ),

        workloadScore:
          Math.round(
            best.workloadScore
          ),
      },
    });

  } catch (error: any) {
    console.error(
      'Assignment engine error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Assignment engine failed.',
      },
      { status: 500 }
    );
  }
}