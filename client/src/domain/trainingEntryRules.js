/**
 * Responsibility:
 * Преобразование state -> draft записи
 * и синхронная валидация.
 */

export const TrainingEntryRules = Object.freeze({
    fromState(state) {
        return {
            muscleGroup: state.muscleGroup,
            workoutName: state.workoutName,
            weight: state.weight,
            reps: state.reps,
            bar: state.bar,
            side: state.side,
            note: state.note
        }
    },

    validate(draft) {
        const errors = []

        if (!draft.muscleGroup.trim()) errors.push('Muscle group обязателен')
        if (!draft.workoutName.trim()) errors.push('Workout name обязателен')
        if (!Number.isFinite(draft.weight) || draft.weight < 0) errors.push('Weight должен быть >= 0')
        if (!Number.isInteger(draft.reps) || draft.reps < 0) errors.push('Reps должен быть целым >= 0')

        return errors
    }
})
