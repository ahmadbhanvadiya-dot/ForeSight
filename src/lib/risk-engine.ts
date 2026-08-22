export type Department = 'Revenue' | 'Licensing' | 'Finance' | 'HR';
export type Stage = 'Verification' | 'Review' | 'Approval' | 'Document Processing';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RecommendedAction = 'ESCALATE' | 'REASSIGN' | 'PRIORITIZE' | 'ADD RESOURCES' | 'MONITOR';

export interface SimulatorInputs {
  department: Department;
  currentStage: Stage;
  slaHoursRemaining: number;
  currentStageDurationHours: number;
  historicalStageDelayRate: number;
  departmentDelayRate: number;
}

export interface RiskFactor {
  label: string;
  value: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  recommendedAction: RecommendedAction;
  explanation: string;
}

const MAX_SLA_HOURS = 48;
const MAX_STAGE_HOURS = 24;

function normalizeSlaPressure(hoursRemaining: number): number {
  const consumed = 1 - hoursRemaining / MAX_SLA_HOURS;
  return Math.min(Math.max(consumed * 100, 0), 100);
}

function normalizeStageDelay(stageDurationHours: number): number {
  const ratio = stageDurationHours / MAX_STAGE_HOURS;
  return Math.min(ratio * 100, 100);
}

export function calculateRisk(inputs: SimulatorInputs): RiskResult {
  const {
    slaHoursRemaining,
    currentStageDurationHours,
    historicalStageDelayRate,
    departmentDelayRate,
  } = inputs;

  const slaPressure = normalizeSlaPressure(slaHoursRemaining);
  const stageDelay = normalizeStageDelay(currentStageDurationHours);

  const score = Math.min(
    Math.round(
      0.35 * slaPressure +
      0.30 * stageDelay +
      0.20 * historicalStageDelayRate +
      0.15 * departmentDelayRate
    ),
    100
  );

  const level: RiskLevel =
    score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

  const slaConsumedPct = Math.round(slaPressure);

  const factors: RiskFactor[] = [];

  if (slaPressure >= 70) {
    factors.push({
      label: 'SLA Time Pressure',
      value: `${slaConsumedPct}% consumed`,
      description: 'Most of the SLA time has already been consumed.',
      severity: 'high',
    });
  } else if (slaPressure >= 40) {
    factors.push({
      label: 'SLA Time Pressure',
      value: `${slaConsumedPct}% consumed`,
      description: 'A significant portion of the SLA window has been used.',
      severity: 'medium',
    });
  } else {
    factors.push({
      label: 'SLA Time Pressure',
      value: `${slaConsumedPct}% consumed`,
      description: 'Sufficient SLA time remains for this request.',
      severity: 'low',
    });
  }

  if (currentStageDurationHours >= 12) {
    factors.push({
      label: 'Current Stage Duration',
      value: `${currentStageDurationHours}h in stage`,
      description: 'The current stage is taking significantly longer than normal.',
      severity: 'high',
    });
  } else if (currentStageDurationHours >= 6) {
    factors.push({
      label: 'Current Stage Duration',
      value: `${currentStageDurationHours}h in stage`,
      description: 'The current stage duration is above average.',
      severity: 'medium',
    });
  }

  if (historicalStageDelayRate >= 40) {
    factors.push({
      label: 'Historical Stage Delay',
      value: `${historicalStageDelayRate}% delay rate`,
      description: 'This stage has historically experienced frequent delays.',
      severity: 'high',
    });
  } else if (historicalStageDelayRate >= 20) {
    factors.push({
      label: 'Historical Stage Delay',
      value: `${historicalStageDelayRate}% delay rate`,
      description: 'This stage has a moderate historical delay rate.',
      severity: 'medium',
    });
  }

  if (departmentDelayRate >= 30) {
    factors.push({
      label: 'Department Delay Rate',
      value: `${departmentDelayRate}% delay rate`,
      description: 'The selected department has a high historical delay rate.',
      severity: 'high',
    });
  } else if (departmentDelayRate >= 15) {
    factors.push({
      label: 'Department Delay Rate',
      value: `${departmentDelayRate}% delay rate`,
      description: 'The department shows a moderate tendency for delays.',
      severity: 'medium',
    });
  }

  let recommendedAction: RecommendedAction;
  const slaRemainingPct = (slaHoursRemaining / MAX_SLA_HOURS) * 100;

  if (score > 80 && slaRemainingPct < 20) {
    recommendedAction = 'ESCALATE';
  } else if (score > 70 && departmentDelayRate > 30) {
    recommendedAction = 'REASSIGN';
  } else if (historicalStageDelayRate > 40) {
    recommendedAction = 'PRIORITIZE';
  } else if (score > 60) {
    recommendedAction = 'ADD RESOURCES';
  } else {
    recommendedAction = 'MONITOR';
  }

  const explanation = buildExplanation(inputs, score, level, factors, recommendedAction);

  return { score, level, factors, recommendedAction, explanation };
}

function buildExplanation(
  inputs: SimulatorInputs,
  score: number,
  level: RiskLevel,
  factors: RiskFactor[],
  action: RecommendedAction
): string {
  const { department, currentStage, slaHoursRemaining, historicalStageDelayRate, departmentDelayRate } = inputs;

  const highFactors = factors.filter(f => f.severity === 'high');
  const factorTexts: string[] = [];

  if (highFactors.some(f => f.label === 'SLA Time Pressure')) {
    factorTexts.push(`This request has already consumed most of its allocated SLA window with only ${slaHoursRemaining}h remaining`);
  }
  if (highFactors.some(f => f.label === 'Current Stage Duration')) {
    factorTexts.push(`the ${currentStage} stage is taking significantly longer than the historical average`);
  }
  if (highFactors.some(f => f.label === 'Historical Stage Delay')) {
    factorTexts.push(`${currentStage} requests historically experience delays ${historicalStageDelayRate}% of the time`);
  }
  if (highFactors.some(f => f.label === 'Department Delay Rate')) {
    factorTexts.push(`the ${department} department has a ${departmentDelayRate}% historical delay rate`);
  }

  if (factorTexts.length === 0) {
    return `This request currently shows a ${level} risk level with a score of ${score}/100. Conditions are within normal parameters. Continue monitoring to ensure timely completion.`;
  }

  const joined = factorTexts.length === 1
    ? factorTexts[0]
    : factorTexts.slice(0, -1).join(', ') + ', and ' + factorTexts[factorTexts.length - 1];

  return `This request has a ${level} risk score of ${score}/100 because ${joined}. ForeSight recommends immediate action to prevent an SLA breach.`;
}