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
    } = body;

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!title?.trim()) {
      return NextResponse.json(
        {
          error: 'Request title is required.',
        },
        { status: 400 }
      );
    }

    if (!department) {
      return NextResponse.json(
        {
          error: 'Department is required.',
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 1. CREATE WORK REQUEST
    // -----------------------------------------

    const { data: request, error: requestError } =
      await supabase
        .from('work_requests')
        .insert({
          title: title.trim(),
          description: description?.trim() || '',
          department,
          priority: priority || 'MEDIUM',
          risk_score: risk_score ?? 50,
          status: 'PENDING',
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

    // -----------------------------------------
    // 2. GET EMPLOYEES
    // -----------------------------------------

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

    // -----------------------------------------
    // 3. SCORE EMPLOYEES
    // -----------------------------------------

    const candidates = employees
      .map((employee: any) => {
        const capacity = Array.isArray(
          employee.employee_capacity
        )
          ? employee.employee_capacity[0]
          : employee.employee_capacity;

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

        const availableCapacity =
          Number(
            capacity.available_capacity ?? 0
          );

        // Don't assign HIGH stress employees
        if (
          capacity.stress_level === 'HIGH'
        ) {
          return null;
        }

        // Don't assign employees with no capacity
        if (availableCapacity <= 0) {
          return null;
        }

        // -------------------------------------
        // SCORING
        // -------------------------------------

        const departmentScore =
          employee.department === department
            ? 100
            : 40;

        const stressCapacityScore =
          Math.max(
            0,
            100 - stressScore
          );

        const availabilityScore =
          Math.min(
            100,
            availableCapacity * 10
          );

        const workloadScore =
          Math.max(
            0,
            100 -
              currentWorkload * 10
          );

        const finalScore =
          departmentScore * 0.40 +
          stressCapacityScore * 0.25 +
          availabilityScore * 0.20 +
          workloadScore * 0.15;

        return {
          employee,
          capacity,

          finalScore,

          departmentScore,
          stressCapacityScore,
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

    // -----------------------------------------
    // 4. NO SUITABLE EMPLOYEE
    // -----------------------------------------

    if (!candidates.length) {
      return NextResponse.json({
        success: true,
        assigned: false,
        request,

        message:
          'No employee currently has enough capacity for this request.',
      });
    }

    // -----------------------------------------
    // 5. BEST EMPLOYEE
    // -----------------------------------------

    const best = candidates[0] as any;

    const selectedEmployee =
      best.employee;

    const selectedCapacity =
      best.capacity;

    // -----------------------------------------
    // 6. CREATE ASSIGNMENT
    // -----------------------------------------

    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from('assignments')
      .insert({
        request_id: request.id,
        employee_id:
          selectedEmployee.id,
        status: 'ASSIGNED',
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

    // -----------------------------------------
    // 7. UPDATE REQUEST
    // -----------------------------------------

    const { error: requestUpdateError } =
      await supabase
        .from('work_requests')
        .update({
          status: 'ASSIGNED',
        })
        .eq('id', request.id);

    if (requestUpdateError) {
      throw new Error(
        requestUpdateError.message
      );
    }

    // -----------------------------------------
    // 8. UPDATE EMPLOYEE WORKLOAD
    // -----------------------------------------

    const newWorkload =
      Number(
        selectedCapacity.current_workload ?? 0
      ) + 1;

    const { error: capacityUpdateError } =
      await supabase
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

    if (capacityUpdateError) {
      throw new Error(
        capacityUpdateError.message
      );
    }

    // -----------------------------------------
    // 9. RETURN RESULT
    // -----------------------------------------

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

        role:
          selectedEmployee.role,
      },

      foresightScore: Math.round(
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