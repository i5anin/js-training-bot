export const Validators = {
    muscleGroup: (value) => value.trim().length > 0,
    workoutName: (value) => value.trim().length > 0,
    weight: (value) => Number.isFinite(Number(value)) && Number(value) > 0,
    reps: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
};
