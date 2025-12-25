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
