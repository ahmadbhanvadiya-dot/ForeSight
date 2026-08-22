'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  Brain,
  ShieldCheck,
  Activity,
  Users,
  BriefcaseBusiness,
  Gauge,
} from 'lucide-react';

const departments = [
  'Licensing',
  'Finance',
  'Revenue',
  'HR',
];

export default function WorkRequestCreator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      const response = await fetch(
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

  const getScoreLabel = (
    score: number
  ) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  const getScoreClass = (
    score: number
  ) => {
    if (score >= 80)
      return 'text-risk-low';

    if (score >= 60)
      return 'text-primary';

    if (score >= 40)
      return 'text-yellow-500';

    return 'text-risk-high';
  };

  return (
    <div className="glass-card rounded-2xl border border-border p-5">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-5">

        <span className="section-label">
          Intelligent Routing
        </span>

        <h2 className="text-lg font-extrabold text-foreground mt-1 flex items-center gap-2">
          <Brain
            size={17}
            className="text-primary"
          />

          Create Work Request
        </h2>

        <p className="text-xs text-muted-foreground mt-1">
          Foresight evaluates workload,
          employee capacity, risk and
          department fit before assigning
          the request.
        </p>

      </div>


      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

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


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

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


        {/* ================================================= */}
        {/* CREATE BUTTON */}
        {/* ================================================= */}

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


      {/* ================================================= */}
      {/* RESULT */}
      {/* ================================================= */}

      {result && (

        <div className="mt-5">

          {result.assigned ? (

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">

              {/* ========================================= */}
              {/* SUCCESS HEADER */}
              {/* ========================================= */}

              <div className="flex items-center gap-2 mb-4">

                <div className="w-7 h-7 rounded-full bg-risk-low/10 flex items-center justify-center">

                  <CheckCircle2
                    size={16}
                    className="text-risk-low"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-foreground">
                    Request assigned
                  </h3>

                  <p className="text-[10px] text-muted-foreground">
                    Foresight successfully
                    routed the request.
                  </p>

                </div>

              </div>


              {/* ========================================= */}
              {/* EMPLOYEE */}
              {/* ========================================= */}

              <div className="rounded-xl border border-border bg-background/40 p-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">

                    <Users
                      size={18}
                      className="text-primary"
                    />

                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-bold text-foreground">

                      {result.employee?.name}

                    </p>

                    <p className="text-[10px] text-muted-foreground">

                      {result.employee?.employee_code}
                      {' · '}
                      {result.employee?.department}

                      {result.employee?.role
                        ? ` · ${result.employee.role}`
                        : ''}

                    </p>

                  </div>

                </div>

              </div>


              {/* ========================================= */}
              {/* FORESIGHT SCORE */}
              {/* ========================================= */}

              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">

                <div className="flex items-center justify-between mb-2">

                  <div className="flex items-center gap-2">

                    <Gauge
                      size={15}
                      className="text-primary"
                    />

                    <span className="text-xs font-bold text-foreground">
                      Foresight Routing Score
                    </span>

                  </div>

                  <span className="text-lg font-black text-primary">

                    {result.foresightScore ?? 0}
                    /100

                  </span>

                </div>


                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">

                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        result.foresightScore ??
                          0
                      )}%`,
                    }}
                  />

                </div>

              </div>


              {/* ========================================= */}
              {/* WHY WAS THIS EMPLOYEE SELECTED? */}
              {/* ========================================= */}

              {result.reasoning && (

                <div className="mt-4">

                  <div className="flex items-center gap-2 mb-3">

                    <ShieldCheck
                      size={15}
                      className="text-primary"
                    />

                    <h3 className="text-xs font-bold text-foreground">
                      Why Foresight chose this employee
                    </h3>

                  </div>


                  <div className="grid sm:grid-cols-2 gap-2">

                    {/* DEPARTMENT */}

                    <ScoreCard
                      icon={
                        <BriefcaseBusiness
                          size={14}
                        />
                      }
                      label="Department fit"
                      score={
                        result.reasoning
                          .department
                      }
                    />


                    {/* CAPACITY */}

                    <ScoreCard
                      icon={
                        <Activity
                          size={14}
                        />
                      }
                      label="Capacity"
                      score={
                        result.reasoning
                          .capacity
                      }
                    />


                    {/* AVAILABILITY */}

                    <ScoreCard
                      icon={
                        <Users
                          size={14}
                        />
                      }
                      label="Availability"
                      score={
                        result.reasoning
                          .availability
                      }
                    />


                    {/* WORKLOAD */}

                    <ScoreCard
                      icon={
                        <Gauge
                          size={14}
                        />
                      }
                      label="Current workload"
                      score={
                        result.reasoning
                          .workload
                      }
                    />


                    {/* RISK */}

                    <ScoreCard
                      icon={
                        <ShieldCheck
                          size={14}
                        />
                      }
                      label="Risk suitability"
                      score={
                        result.reasoning
                          .riskSuitability
                      }
                    />


                    {/* SKILL */}

                    <ScoreCard
                      icon={
                        <Brain
                          size={14}
                        />
                      }
                      label="Skill match"
                      score={
                        result.reasoning
                          .skillMatch
                      }
                    />

                  </div>

                </div>

              )}


              {/* ========================================= */}
              {/* AI EXPLANATION */}
              {/* ========================================= */}

              <div className="mt-4 rounded-xl border border-border p-4">

                <div className="flex items-center gap-2 mb-2">

                  <Brain
                    size={14}
                    className="text-primary"
                  />

                  <span className="text-xs font-bold text-foreground">
                    Foresight decision
                  </span>

                </div>

                <p className="text-[11px] leading-5 text-muted-foreground">

                  {result.routing?.explanation?.length
                    ? `Foresight selected ${
                        result.employee?.name
                      } because the employee has ${result.routing.explanation
                        .join(
                          ', '
                        )
                        .toLowerCase()}.`
                    : `Foresight selected ${
                        result.employee?.name
                      } based on current capacity,
                      workload and department fit.`}

                </p>

              </div>


              {/* ========================================= */}
              {/* REQUEST INFORMATION */}
              {/* ========================================= */}

              <div className="mt-4 pt-4 border-t border-border">

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                  <InfoItem
                    label="Priority"
                    value={
                      result.request
                        ?.priority ||
                      priority
                    }
                  />

                  <InfoItem
                    label="Risk score"
                    value={`${result.request?.risk_score ?? 0}/100`}
                  />

                  <InfoItem
                    label="Candidates"
                    value={
                      result.routing
                        ?.candidatesEvaluated ??
                      '-'
                    }
                  />

                  <InfoItem
                    label="Eligible"
                    value={
                      result.routing
                        ?.candidatesEligible ??
                      '-'
                    }
                  />

                </div>

              </div>

            </div>

          ) : (

            /* ============================================= */
            /* NOT ASSIGNED */
            /* ============================================= */

            <div className="rounded-2xl border border-risk-high/30 bg-risk-high/5 p-4">

              <div className="flex items-center gap-2">

                <AlertTriangle
                  size={16}
                  className="text-risk-high"
                />

                <p className="text-xs font-bold text-foreground">
                  Request created but not assigned
                </p>

              </div>

              <p className="text-[10px] text-muted-foreground mt-2">

                {result.message}

              </p>

              {result.foresight && (

                <div className="mt-3 text-[10px] text-muted-foreground">

                  Foresight evaluated{' '}
                  <span className="font-bold text-foreground">
                    {
                      result.foresight
                        .candidatesEvaluated
                    }
                  </span>{' '}
                  employees but found no
                  eligible employee with
                  enough capacity.

                </div>

              )}

            </div>

          )}

        </div>

      )}

    </div>
  );
}


/* ===================================================== */
/* SCORE CARD */
/* ===================================================== */

function ScoreCard({
  icon,
  label,
  score,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
}) {
  const safeScore =
    Number.isFinite(score)
      ? score
      : 0;

  const scoreClass =
    safeScore >= 80
      ? 'text-risk-low'
      : safeScore >= 60
        ? 'text-primary'
        : safeScore >= 40
          ? 'text-yellow-500'
          : 'text-risk-high';

  return (
    <div className="rounded-xl border border-border p-3">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="text-muted-foreground">
            {icon}
          </span>

          <span className="text-[10px] font-semibold text-muted-foreground">
            {label}
          </span>

        </div>

        <span
          className={`text-xs font-black ${scoreClass}`}
        >
          {safeScore}
        </span>

      </div>


      <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">

        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                safeScore
              )
            )}%`,
          }}
        />

      </div>


      <p
        className={`text-[9px] mt-1 font-semibold ${scoreClass}`}
      >
        {getScoreLabelStatic(
          safeScore
        )}

      </p>

    </div>
  );
}


/* ===================================================== */
/* INFO ITEM */
/* ===================================================== */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>

      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="text-xs font-bold text-foreground mt-1">
        {value}
      </p>

    </div>
  );
}


/* ===================================================== */
/* SCORE LABEL */
/* ===================================================== */

function getScoreLabelStatic(
  score: number
) {
  if (score >= 80)
    return 'Strong';

  if (score >= 60)
    return 'Good';

  if (score >= 40)
    return 'Moderate';

  return 'Low';
}