/**
 * Responsibility:
 * Создание полноценной записи таблицы из draft.
 */

export const TrainingEntryFactory = {
  create(draft) {
    const nowIso = new Date().toISOString()

    return {
      id: globalThis.crypto.randomUUID(),

      trainingAtIso: draft.trainingDateIso ?? nowIso,
      createdAtIso: nowIso,

      trainingNo: Number(draft.trainingNo || 0),
      muscleGroup: String(draft.muscleGroup || '').trim(),
      workoutName: String(draft.workoutName || '').trim(),

      weight: Number(draft.weight || 0),
      reps: Number(draft.reps || 0),
      bar: Number(draft.bar || 0),
      side: Number(draft.side || 0),

      note: String(draft.note || '').trim(),
    }
  },
}
