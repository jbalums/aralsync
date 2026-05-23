import { TRANSMUTATION_TABLE } from '../constants/transmutation';
import { DEFAULT_WEIGHTS } from '../constants/grading';

interface ScoreEntry { score: number; max: number; }
interface Weights { ww: number; pt: number; qa: number; }

export interface QuarterlyGradeResult {
  wwWeighted: number;
  ptWeighted: number;
  qaWeighted: number;
  initialGrade: number;
  transmutedGrade: number;
}

export function computeQuarterlyGrade(
  wwScores: ScoreEntry[],
  ptScores: ScoreEntry[],
  qa: ScoreEntry,
  weights: Weights = DEFAULT_WEIGHTS,
): QuarterlyGradeResult {
  const sum = (arr: ScoreEntry[]) =>
    arr.reduce((acc, e) => ({ score: acc.score + e.score, max: acc.max + e.max }), { score: 0, max: 0 });

  const wwTotals = sum(wwScores);
  const ptTotals = sum(ptScores);

  const wwPct  = wwTotals.max  > 0 ? (wwTotals.score  / wwTotals.max)  * 100 : 0;
  const ptPct  = ptTotals.max  > 0 ? (ptTotals.score  / ptTotals.max)  * 100 : 0;
  const qaPct  = qa.max        > 0 ? (qa.score         / qa.max)        * 100 : 0;

  const wwWeighted = wwPct * weights.ww;
  const ptWeighted = ptPct * weights.pt;
  const qaWeighted = qaPct * weights.qa;

  const initialGrade = wwWeighted + ptWeighted + qaWeighted;
  const transmutedGrade = transmute(initialGrade);

  return { wwWeighted, ptWeighted, qaWeighted, initialGrade, transmutedGrade };
}

export function transmute(initialGrade: number): number {
  const raw = Math.round(initialGrade);
  const entry = TRANSMUTATION_TABLE.find(([r]) => r <= raw);
  return entry ? entry[1] : 10;
}
