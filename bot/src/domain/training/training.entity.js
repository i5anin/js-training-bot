export class TrainingEntry {
  constructor({
    userId,
    muscleGroup,
    workoutName,
    weight,
    reps,
    bar,
    side,
    note,
    totalWeight,
    createdAt
  }) {
    this.userId = userId
    this.muscleGroup = muscleGroup
    this.workoutName = workoutName
    this.weight = weight
    this.reps = reps

    this.bar = bar
    this.side = side
    this.note = note
    this.totalWeight = totalWeight

    this.createdAt = createdAt

    Object.freeze(this)
  }

  static create({
    userId,
    muscleGroup,
    workoutName,
    weight,
    reps,
    bar = 0,
    side = 0,
    note = ''
  }) {
    const totalWeight = TrainingEntry.#calcTotalWeight(weight, bar, side)

    return new TrainingEntry({
      userId,
      muscleGroup: muscleGroup.trim().toLowerCase(),
      workoutName: workoutName.trim(),
      weight,
      reps,
      bar,
      side,
      note: String(note ?? '').trim(),
      totalWeight,
      createdAt: new Date().toISOString()
    })
  }

  static #calcTotalWeight(weight, bar, side) {
    return Number(weight) + Number(bar) + Number(side) * 2
  }
}
