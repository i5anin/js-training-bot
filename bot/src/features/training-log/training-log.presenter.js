import { TrainingFlowStep } from './training-log.flow.js'
import { calcTotalWeight } from './modifier.calculator.js'

const weightHelp = (state) => {
  if (!state.ui?.showHelp) return null
  if (state.step !== TrainingFlowStep.Weight) return null

  return [
    '',
    'Теперь введи вес (число, например 45):',
    '',
    'Дополнительно: /bar +20, /side +10, /note текст'
  ].join('\n')
}

const stepLabel = (step) => {
  switch (step) {
    case TrainingFlowStep.MuscleGroup:
      return 'ввод группы мышц'
    case TrainingFlowStep.WorkoutName:
      return 'ввод тренировки'
    case TrainingFlowStep.Weight:
      return 'ввод веса'
    case TrainingFlowStep.Reps:
      return 'ввод повторов'
    case TrainingFlowStep.Confirm:
      return 'подтверждение'
    case TrainingFlowStep.Done:
      return 'завершено'
    default:
      return 'ожидание начала'
  }
}

const field = (label, value) => `${label}: ${value ?? '—'}`

export const TrainingLogPresenter = {
  form(state) {
    if (!state) return 'Нет активной записи. /train'

    const muscleGroup = state.muscleGroup || '—'
    const workoutName = state.workoutName || '—'
    const weight = state.weight > 0 ? state.weight : '—'
    const reps = state.reps > 0 ? state.reps : '—'

    const bar = Number(state.bar || 0)
    const side = Number(state.side || 0)

    const totalWeight =
      typeof weight === 'number' ? calcTotalWeight(weight, bar, side) : '—'

    const note = state.note || '—'

    return [
      '«ЗАПИСЬ ТРЕНИРОВКИ»',
      '',
      field('Группа', muscleGroup),
      field('Тренировка', workoutName),
      field('Вес', weight),
      field('Штанга', bar),
      field('Одна сторона', `${side} (итого +${side * 2})`),
      field('Итоговый вес', totalWeight),
      field('Повторы', reps),
      field('Пояснение', note),
      '',
      `Текущий шаг: ${stepLabel(state.step)}`,
      weightHelp(state),
      '',
      'в любой момент вы можете отменить заполнение.'
    ]
      .filter(Boolean)
      .join('\n')
  }
}
