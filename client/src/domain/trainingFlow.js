// src/domain/trainingFlow.js

export class TrainingFlowState {
  /**
   * @param {Readonly<{
   *   reps: (number|null),
   *   weight: number,
   *   bar: number,
   *   side: number,
   *   note: string,
   *   ui: Readonly<{ showHelp: boolean }>
   * }>} snapshot
   */
  constructor(snapshot) {
    this._snapshot = Object.freeze({
      reps: snapshot.reps,
      weight: snapshot.weight,
      bar: snapshot.bar,
      side: snapshot.side,
      note: snapshot.note,
      ui: Object.freeze({
        showHelp: snapshot.ui?.showHelp ?? true,
      }),
    })

    Object.freeze(this)
  }

  static createEmpty() {
    return {
      reps: null,
      weight: 0,
      bar: 0,
      side: 0,
      note: '',
      ui: { showHelp: true },
    }
  }

  static from(snapshot) {
    return new TrainingFlowState(snapshot)
  }

  toSnapshot() {
    return this._snapshot
  }

  /**
   * @param {Partial<{
   *   reps: (number|null),
   *   weight: number,
   *   bar: number,
   *   side: number,
   *   note: string,
   *   ui: Partial<{ showHelp: boolean }>
   * }>} changes
   */
  withChanges(changes) {
    const nextUi = Object.freeze({
      ...this._snapshot.ui,
      ...(changes.ui ?? {}),
    })

    return new TrainingFlowState({
      ...this._snapshot,
      ...changes,
      ui: nextUi,
    })
  }
}
