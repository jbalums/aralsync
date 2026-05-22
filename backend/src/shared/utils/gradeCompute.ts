import { transmute } from '../constants/transmutation';

export interface ScoreEntry {
  score: number;
  max: number;
}

export interface GradeWeights {
  ww: number;
  pt: number;
  qa: number;
}

export interface QuarterlyGradeResult {
  wwWeighted: number;
  ptWeighted: number;
  qaWeighted: number;
  initialGrade: number;
  transmutedGrade: number;
}

export function computeWWWeighted(scores: ScoreEntry[], weight: number): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  const max = scores.reduce((sum, s) => sum + s.max, 0);
  if (max === 0) return 0;
  return (total / max) * weight * 100;
}

export function computePTWeighted(scores: ScoreEntry[], weight: number): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  const max = scores.reduce((sum, s) => sum + s.max, 0);
  if (max === 0) return 0;
  return (total / max) * weight * 100;
}

export function computeQAWeighted(score: ScoreEntry, weight: number): number {
  if (score.max === 0) return 0;
  return (score.score / score.max) * weight * 100;
}

export function computeInitialGrade(
  wwWeighted: number,
  ptWeighted: number,
  qaWeighted: number,
): number {
  return wwWeighted + ptWeighted + qaWeighted;
}

export function computeQuarterlyGrade(
  wwScores: ScoreEntry[],
  ptScores: ScoreEntry[],
  qa: ScoreEntry,
  weights: GradeWeights,
): QuarterlyGradeResult {
  const wwWeighted = computeWWWeighted(wwScores, weights.ww);
  const ptWeighted = computePTWeighted(ptScores, weights.pt);
  const qaWeighted = computeQAWeighted(qa, weights.qa);
  const initialGrade = computeInitialGrade(wwWeighted, ptWeighted, qaWeighted);
  const transmutedGrade = transmute(initialGrade);
  return { wwWeighted, ptWeighted, qaWeighted, initialGrade, transmutedGrade };
}

export function computeFinalGrade(quarterlyGrades: number[]): number {
  if (quarterlyGrades.length === 0) return 0;
  const sum = quarterlyGrades.reduce((a, b) => a + b, 0);
  return Math.round((sum / quarterlyGrades.length) * 100) / 100;
}
