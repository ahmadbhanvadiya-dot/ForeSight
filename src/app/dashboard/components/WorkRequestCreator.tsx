'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
} from 'lucide-react';

const departments = [
  'Licensing',
  'Finance',
  'Revenue',
  'HR',
];

export default function WorkRequestCreator() {
  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [department, setDepartment] =
    useState('Licensing');

  const [priority, setPriority] =
    useState('HIGH');

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  const [error, setError] =
    useState('');


  const createRequest = async () => {
    setError('');
    setResult(null);

    if (!title.trim()) {
      setError(
        'Please enter a request title.'
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          '/api/assign-request',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              title,
              description,
              department,
              priority,

              risk_score:
                priority === 'CRITICAL'
                  ? 95
                  : priority === 'HIGH'
                    ? 80
                    : priority === 'MEDIUM'
                      ? 50
                      : 20,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to create request.'
        );
      }

      setResult(data);

      setTitle('');
      setDescription('');

    } catch (err: any) {
      setError(
        err.message ||
          'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="glass-card rounded-2xl border border-border p-5">

      {/* HEADER */}

      <div className="mb-5">

        <span className="section-label">
          Intelligent Routing
        </span>

        <h2 className="text-lg font-extrabold text-foreground mt-1">
          Create Work Request
        </h2>

        <p className="text-xs text-muted-foreground mt-1">
          Foresight evaluates workload,
          capacity and department fit before
          assigning the request.
        </p>

      </div>


      {/* FORM */}

      <div className="space-y-4">

        {/* TITLE */}

        <div>

          <label className="text-xs font-semibold text-foreground block mb-2">
            Request title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="e.g. Urgent vendor approval"
            className="input-field w-full text-xs"
          />

        </div>


        {/* DESCRIPTION */}

        <div>

          <label className="text-xs font-semibold text-foreground block mb-2">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Describe the work request..."
            rows={4}
            className="input-field w-full text-xs resize-none"
          />

        </div>


        {/* DEPARTMENT */}

        <div>

          <label className="text-xs font-semibold text-foreground block mb-2">
            Department
          </label>

          <select
            value={department}
            onChange={(e) =>
              setDepartment(
                e.target.value
              )
            }
            className="input-field w-full text-xs"
          >

            {departments.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

          </select>

        </div>


        {/* PRIORITY */}

        <div>

          <label className="text-xs font-semibold text-foreground block mb-2">
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value
              )
            }
            className="input-field w-full text-xs"
          >

            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="CRITICAL">
              Critical
            </option>

          </select>

        </div>


        {/* ERROR */}

        {error && (

          <div className="rounded-xl border border-risk-high/30 bg-risk-high/5 p-3 flex gap-2">

            <AlertTriangle
              size={14}
              className="text-risk-high shrink-0"
            />

            <p className="text-xs text-risk-high">
              {error}
            </p>

          </div>

        )}


        {/* CREATE */}

        <button
          onClick={createRequest}
          disabled={
            loading ||
            !title.trim()
          }
          className="btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >

          {loading ? (

            <>
              <Loader2
                size={13}
                className="animate-spin"
              />

              Foresight is routing...

            </>

          ) : (

            <>
              <Send size={13} />

              Create & Route Request

            </>

          )}

        </button>

      </div>


      {/* RESULT */}

      {result && (

        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">

          {result.assigned ? (

            <>

              <div className="flex items-center gap-2 mb-3">

                <CheckCircle2
                  size={16}
                  className="text-risk-low"
                />

                <h3 className="text-sm font-bold text-foreground">
                  Request assigned
                </h3>

              </div>


              <div className="space-y-2">

                <p className="text-xs text-muted-foreground">

                  Foresight assigned this request
                  to:

                </p>

                <div className="rounded-xl border border-border p-3">

                  <p className="text-sm font-bold text-foreground">

                    {result.employee.name}

                  </p>

                  <p className="text-[10px] text-muted-foreground">

                    {result.employee.employee_code}
                    {' · '}
                    {result.employee.department}

                  </p>

                </div>


                <div className="flex justify-between text-[10px] mt-3">

                  <span className="text-muted-foreground">
                    Foresight routing score
                  </span>

                  <span className="font-bold text-primary">

                    {result.foresightScore}/100

                  </span>

                </div>

              </div>

            </>

          ) : (

            <>

              <div className="flex items-center gap-2">

                <AlertTriangle
                  size={15}
                  className="text-risk-high"
                />

                <p className="text-xs font-semibold text-foreground">

                  Request created but not
                  assigned.

                </p>

              </div>

              <p className="text-[10px] text-muted-foreground mt-2">

                {result.message}

              </p>

            </>

          )}

        </div>

      )}

    </div>
  );
}