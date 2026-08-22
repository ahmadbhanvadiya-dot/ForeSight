'use client';

import { useMemo, useState } from 'react';
import { Activity, CheckCircle2, ShieldCheck, Sparkles, UserRoundCheck } from 'lucide-react';

type Employee = {
  id: string;
  name: string;
  team: string;
  skills: string[];
  openWork: number;
  capacity: 'LOW' | 'MEDIUM' | 'HIGH';
  availableHours: number;
};

const employees: Employee[] = [
  { id: 'EMP-01', name: 'Aarav', team: 'Licensing', skills: ['Approval', 'Licensing'], openWork: 2, capacity: 'HIGH', availableHours: 5 },
  { id: 'EMP-02', name: 'Meera', team: 'Finance', skills: ['Review', 'Audit'], openWork: 5, capacity: 'LOW', availableHours: 1 },
  { id: 'EMP-03', name: 'Kabir', team: 'Licensing', skills: ['Approval', 'Verification'], openWork: 1, capacity: 'HIGH', availableHours: 6 },
  { id: 'EMP-04', name: 'Diya', team: 'Revenue', skills: ['Document Processing', 'Review'], openWork: 3, capacity: 'MEDIUM', availableHours: 3 },
];

const questions = [
  'How manageable is your current workload?',
  'How much capacity do you have for one more urgent task?',
  'How often are you currently interrupted by competing priorities?',
  'How confident are you that you can complete an urgent request on time?',
];

export default function EmployeeCapacityCheck() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);

  const capacityScore = useMemo(() => {
    if (!answers.length) return 0;
    return Math.round((answers.reduce((a, b) => a + b, 0) / (answers.length * 5)) * 100);
  }, [answers]);

  const capacity = capacityScore >= 70 ? 'HIGH' : capacityScore >= 45 ? 'MEDIUM' : 'LOW';
  const bestMatches = employees
    .filter(e => e.capacity !== 'LOW')
    .sort((a, b) => b.availableHours - a.availableHours || a.openWork - b.openWork)
    .slice(0, 3);

  const reset = () => {
    setAnswers([]);
    setSubmitted(false);
    setShowEmployees(false);
  };

  return (
    <div className="glass-card rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <span className="section-label">Workforce Balance</span>
          <h2 className="text-lg font-extrabold text-foreground mt-1 flex items-center gap-2"><Sparkles size={16} className="text-primary" /> Foresight Capacity Assistant</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">A voluntary check-in estimates current work capacity. It is not a medical or psychological diagnosis and should not be used as an employment or performance score.</p>
        </div>
        <ShieldCheck size={18} className="text-primary shrink-0" />
      </div>

      {!submitted ? (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question} className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-foreground mb-3">{index + 1}. {question}</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <button key={value} onClick={() => setAnswers(prev => { const next = [...prev]; next[index] = value; return next; })} className={`py-2 rounded-lg border text-xs font-semibold transition-colors ${answers[index] === value ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/20'}`}>
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-muted-foreground"><span>Low capacity</span><span>High capacity</span></div>
            </div>
          ))}
          <button disabled={answers.length !== questions.length} onClick={() => setSubmitted(true)} className="btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"><Activity size={13} /> Generate capacity profile</button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-[150px_1fr] gap-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Current capacity</p>
              <p className="text-4xl font-black text-primary mt-2">{capacityScore}%</p>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{capacity}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Foresight recommendation</h3>
              <p className="text-xs leading-6 text-muted-foreground mt-2">Use this self-reported capacity signal together with skills, existing workload and availability. High-risk requests should be routed to employees who have suitable skills and enough current capacity — not simply to whoever reports the lowest stress.</p>
              <div className="flex items-center gap-2 mt-3 text-[11px] text-risk-low font-semibold"><CheckCircle2 size={13} /> Capacity profile generated locally for this MVP</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3"><div><h3 className="text-sm font-bold text-foreground">Suggested routing pool</h3><p className="text-[11px] text-muted-foreground">Ranked by capacity, availability and skill fit.</p></div><UserRoundCheck size={15} className="text-primary" /></div>
            <div className="space-y-2">
              {bestMatches.map((employee, index) => (
                <div key={employee.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                  <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">{employee.name} · {employee.team}</p><p className="text-[10px] text-muted-foreground">{employee.openWork} open tasks · {employee.availableHours}h available · {employee.skills.join(' · ')}</p></div>
                  <span className="text-[10px] font-bold text-risk-low">{employee.capacity} CAPACITY</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowEmployees(v => !v)} className="text-xs px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted/30">{showEmployees ? 'Hide routing preview' : 'Preview high-risk routing'}</button>
            <button onClick={reset} className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground">Retake check-in</button>
          </div>
          {showEmployees && <div className="rounded-xl bg-muted/10 border border-border p-4 text-xs text-muted-foreground">Example: a high-risk Approval request would be offered to <span className="font-bold text-foreground">{bestMatches[0]?.name}</span> first because they have the strongest current capacity and a matching Approval skill. A low-capacity employee is not selected.</div>}
        </div>
      )}
    </div>
  );
}
