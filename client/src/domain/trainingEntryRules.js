/**
 * Responsibility:
 * Преобразование `state` -> `draft` записи
 * и синхронная валидация.
 */

export const TrainingEntryRules = {
    fromState(state) {
        return {
            trainingNo: Number(state.trainingNo || 0),
            trainingDateIso: state.trainingDateIso || null,

            muscleGroup: state.muscleGroup || '',
            workoutName: state.workoutName || '',

            reps: Number(state.reps || 0),
            bar: Number(state.bar || 0),
            side: Number(state.side || 0),
            weight: Number(state.weight || 0),

            note: state.note || '',
        }
    },

    validate(draft) {
        const errors = []

        if (!Number.isFinite(draft.trainingNo) || draft.trainingNo < 1) {
            errors.push('Номер тренировки должен быть >= 1')
        }

        if (!draft.trainingDateIso) errors.push('Дата тренировки обязательна')
        if (!String(draft.muscleGroup).trim()) errors.push('Группа мышц обязательна')
        if (!String(draft.workoutName).trim()) errors.push('Упражнение обязательно')

        if (!Number.isFinite(draft.reps) || !Number.isInteger(draft.reps) || draft.reps < 1) {
            errors.push('Повторения должны быть целым числом >= 1')
        }

        return errors
    },
}
