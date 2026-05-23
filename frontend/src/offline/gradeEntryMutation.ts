import { db } from '../db';
import { enqueue } from './syncQueue';
import { queryClient } from '../app/queryClient';
import { GRADE_KEYS } from '../modules/gradebook/useGradebook';
import type { GradeComponent, Quarter } from '../shared/types';

export interface GradeEntryMutationInput {
  classLoadId: string;
  studentId:   string;
  quarter:     Quarter;
  component:   GradeComponent;
  columnLabel: string;
  maxScore:    number;
  score:       number;
}

export async function gradeEntryMutation(inputs: GradeEntryMutationInput[]): Promise<void> {
  const now = new Date().toISOString();

  for (const input of inputs) {
    const existing = await db.gradeEntries
      .where('classLoadId').equals(input.classLoadId)
      .filter(
        (r) => r.studentId    === input.studentId  &&
               r.quarter      === input.quarter    &&
               r.component    === input.component  &&
               r.columnLabel  === input.columnLabel,
      )
      .first();

    if (existing) {
      await db.gradeEntries.update(existing.id, {
        score:      input.score,
        maxScore:   input.maxScore,
        syncStatus: 'pending',
        updatedAt:  now,
      });
      await enqueue({
        tableName: 'gradeEntries',
        recordId:  existing.id,
        operation: 'update',
        payload:   { ...existing, score: input.score, maxScore: input.maxScore, updatedAt: now },
      });
    } else {
      const id = crypto.randomUUID();
      await db.gradeEntries.add({
        id,
        classLoadId: input.classLoadId,
        studentId:   input.studentId,
        quarter:     input.quarter,
        component:   input.component,
        columnLabel: input.columnLabel,
        score:       input.score,
        maxScore:    input.maxScore,
        syncStatus:  'pending',
        updatedAt:   now,
      });
      await enqueue({
        tableName: 'gradeEntries',
        recordId:  id,
        operation: 'create',
        payload:   { id, ...input, syncStatus: 'pending', updatedAt: now },
      });
    }
  }

  void queryClient.invalidateQueries({ queryKey: GRADE_KEYS.all });
}
