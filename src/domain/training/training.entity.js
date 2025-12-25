export class TrainingEntry {
    constructor({ userId, muscleGroup, workoutName, weight, reps, createdAt }) {
        this.userId = userId;
        this.muscleGroup = muscleGroup;
        this.workoutName = workoutName;
        this.weight = weight;
        this.reps = reps;
        this.createdAt = createdAt;
        Object.freeze(this);
    }

    static create({ userId, muscleGroup, workoutName, weight, reps }) {
        return new TrainingEntry({
            userId,
            muscleGroup: muscleGroup.trim().toLowerCase(),
            workoutName: workoutName.trim(),
            weight,
            reps,
            createdAt: new Date().toISOString(),
        });
    }
}
