/**
 * Responsibility:
 * Определяет шаги тренировочного флоу и фабрику состояния.
 * Никаких импортов, никаких побочных эффектов.
 */

export const TrainingFlowStep = Object.freeze({
  MuscleGroup: 'muscleGroup',
  WorkoutName: 'workoutName',
  Weight: 'weight',
  Reps: 'reps',
  Confirm: 'confirm',
  Done: 'done'
})

export const TrainingFlowState = {
  createEmpty() {
    return {
      step: TrainingFlowStep.MuscleGroup,
      muscleGroup: '',
      workoutName: '',
      weight: 0,
      reps: 0,
      bar: 0,
      side: 0,
      note: '',
      ui: {
        messageId: null,
        showHelp: false
      }
    }
  }
}


