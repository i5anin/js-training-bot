/**
 * Responsibility:
 * Определяет неизменяемые идентификаторы шагов тренировочного флоу
 * и предоставляет фабрику для создания начального (пустого) состояния флоу.
 *
 * Модуль не содержит UI-логики, правил переходов, валидации или побочных эффектов —
 * только константы шагов и инициализацию состояния.
 */


export const TrainingFlowStep = Object.freeze({
    MuscleGroup: "muscleGroup",
    WorkoutName: "workoutName",
    Weight: "weight",
    Reps: "reps",
    Done: "done",
});

export const TrainingFlowState = {
    createEmpty() {
        return {
            step: TrainingFlowStep.MuscleGroup,
            muscleGroup: "",
            workoutName: "",
            weight: 0,
            reps: 0,
        };
    },
};
