/**
 * Responsibility:
 * Создание полноценной записи таблицы из draft.
 */

import { IdGenerator } from './idGenerator'


export const TrainingEntryFactory = {
    create(draft) {
        return {
            id: globalThis.crypto.randomUUID(),
            createdAtIso: draft.trainingDateIso || new Date().toISOString(),
            trainingNo: Number(draft.trainingNo || 0),

            muscleGroup: (draft.muscleGroup || '').trim(),
            workoutName: (draft.workoutName || '').trim(),

            weight: Number(draft.weight || 0),
            reps: Number(draft.reps || 0),
            bar: Number(draft.bar || 0),
            side: Number(draft.side || 0),

            note: (draft.note || '').trim(),
        }
    },
}


