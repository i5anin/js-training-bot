import { TrainingFlowStep, TrainingFlowState } from './training-log.flow.js'
import { Validators } from './training-log.validators.js'
import {
  MuscleGroupsKeyboard,
  CancelKeyboard,
  ConfirmKeyboard
} from './training-log.keyboard.js'
import { TrainingEntry } from '@/domain/training/training.entity.js'
import { parseSignedNumber } from './modifier.parser.js'

export class TrainingLogHandlers {
  constructor({ groupsDbPath, logDbPath, jsonDb }) {
    this.groupsDbPath = groupsDbPath
    this.logDbPath = logDbPath
    this.jsonDb = jsonDb
  }

  async start(ctx) {
    ctx.session.training = TrainingFlowState.createEmpty()
    const groups = await this.#loadGroups()

    await ctx.reply('Введи название группы мышц (текстом):', {
      reply_markup: MuscleGroupsKeyboard.fromGroups(groups)
    })
  }

  async stop(ctx) {
    delete ctx.session.training
    await ctx.reply('Операция остановлена.', {
      reply_markup: { remove_keyboard: true }
    })
  }

  async done(ctx) {
    const state = ctx.session.training
    if (!state) {
      await ctx.reply('Нет активной записи. /train', {
        reply_markup: { remove_keyboard: true }
      })
      return
    }

    if (this.#canCommit(state)) {
      const entry = this.#createEntry(ctx, state)
      await this.#appendLog(entry)

      await ctx.reply(this.#formatSaved(entry), {
        reply_markup: { remove_keyboard: true }
      })
    }

    delete ctx.session.training
    await ctx.reply('Завершено.', { reply_markup: { remove_keyboard: true } })
  }

  async bar(ctx) {
    await this.#applyModifier(ctx, 'bar')
  }

  async side(ctx) {
    await this.#applyModifier(ctx, 'side')
  }

  async note(ctx) {
    const state = ctx.session.training
    if (!state) {
      await ctx.reply('Нет активной записи. /train')
      return
    }

    const text = this.#getCommandArgs(ctx.message?.text)
    if (!Validators.note(text)) {
      await ctx.reply('Нужно указать текст. Пример: /note без пояса')
      return
    }

    state.note = text.trim()
    await ctx.reply('Пояснение сохранено.')
  }

  async onText(ctx) {
    const text = (ctx.message?.text ?? '').trim()
    if (!text) return

    if (text.toLowerCase() === 'отмена') {
      delete ctx.session.training
      await ctx.reply('Операция отменена.', {
        reply_markup: { remove_keyboard: true }
      })
      return
    }

    const state = ctx.session.training
    if (!state) return

    switch (state.step) {
      case TrainingFlowStep.MuscleGroup:
        await this.#handleMuscleGroup(ctx, text)
        return

      case TrainingFlowStep.WorkoutName:
        await this.#handleWorkoutName(ctx, text)
        return

      case TrainingFlowStep.Weight:
        await this.#handleWeight(ctx, text)
        return

      case TrainingFlowStep.Reps:
        await this.#handleReps(ctx, text)
        return

      case TrainingFlowStep.Confirm:
        await this.#handleConfirm(ctx, text)
        return

      default:
        return
    }
  }

  async #applyModifier(ctx, field) {
    const state = ctx.session.training
    if (!state) {
      await ctx.reply('Нет активной записи. /train')
      return
    }

    const arg = this.#getCommandArgs(ctx.message?.text)
    const value = parseSignedNumber(arg)

    if (value === null) {
      await ctx.reply(`Неверный формат. Пример: /${field} +10`)
      return
    }

    state[field] += value

    if (field === 'bar') {
      await ctx.reply(`Модификатор штанги: ${state.bar} кг`)
      return
    }

    await ctx.reply(
      `Модификатор на одну сторону: ${state.side} кг (итого +${state.side * 2} кг)`
    )
  }

  async #handleMuscleGroup(ctx, input) {
    if (!Validators.muscleGroup(input)) {
      await ctx.reply('Некорректно. Введи название группы мышц (текстом):')
      return
    }

    const groups = await this.#loadGroups()
    const normalized = input.trim().toLowerCase()

    if (!groups.includes(normalized)) {
      await ctx.reply(
        'Такой группы нет в базе. Выбери из списка или введи корректное название:',
        { reply_markup: MuscleGroupsKeyboard.fromGroups(groups) }
      )
      return
    }

    ctx.session.training.muscleGroup = normalized
    ctx.session.training.step = TrainingFlowStep.WorkoutName

    await ctx.reply('Ок. Теперь введи название тренировки:', {
      reply_markup: CancelKeyboard.create()
    })
  }

  async #handleWorkoutName(ctx, input) {
    if (!Validators.workoutName(input)) {
      await ctx.reply('Некорректно. Введи название тренировки:')
      return
    }

    ctx.session.training.workoutName = input.trim()
    ctx.session.training.step = TrainingFlowStep.Weight

    await ctx.reply(
      'Теперь введи вес (число, например 45):\n\nДополнительно: /bar +20, /side +10, /note текст',
      { reply_markup: CancelKeyboard.create() }
    )
  }

  async #handleWeight(ctx, input) {
    if (!Validators.weight(input)) {
      await ctx.reply('Некорректно. Введи вес (число, больше 0):')
      return
    }

    ctx.session.training.weight = Number(input)
    ctx.session.training.step = TrainingFlowStep.Reps

    await ctx.reply('Теперь введи количество повторов (целое число):', {
      reply_markup: CancelKeyboard.create()
    })
  }

  async #handleReps(ctx, input) {
    if (!Validators.reps(input)) {
      await ctx.reply(
        'Некорректно. Введи количество повторов (целое число, больше 0):'
      )
      return
    }

    ctx.session.training.reps = Number(input)
    ctx.session.training.step = TrainingFlowStep.Confirm

    await this.#replyConfirm(ctx)
  }

  async #handleConfirm(ctx, input) {
    const normalized = input.trim().toLowerCase()
    const state = ctx.session.training

    if (normalized === 'да') {
      const entry = this.#createEntry(ctx, state)
      await this.#appendLog(entry)

      this.#resetForNextSet(state)

      await ctx.reply(
        `${this.#formatSaved(entry)}\n\nВведи вес для следующего подхода:`,
        { reply_markup: CancelKeyboard.create() }
      )
      return
    }

    if (normalized === 'нет') {
      this.#resetForNextSet(state)

      await ctx.reply('Ок. Введи вес заново:', {
        reply_markup: CancelKeyboard.create()
      })
      return
    }

    await ctx.reply('Ответь "Да" или "Нет". Или используй /done /stop.', {
      reply_markup: ConfirmKeyboard.create()
    })
  }

  async #replyConfirm(ctx) {
    const state = ctx.session.training
    const entry = this.#createEntry(ctx, state)

    await ctx.reply(
      [
        'Подход:',
        `Группа: ${entry.muscleGroup}`,
        `Тренировка: ${entry.workoutName}`,
        `Вес: ${entry.weight}`,
        `Штанга: ${entry.bar}`,
        `Одна сторона: ${entry.side} (итого +${entry.side * 2})`,
        `Итоговый вес: ${entry.totalWeight}`,
        `Повторы: ${entry.reps}`,
        entry.note ? `Пояснение: ${entry.note}` : null,
        '',
        'Как сейчас?'
      ]
        .filter(Boolean)
        .join('\n'),
      { reply_markup: ConfirmKeyboard.create() }
    )
  }

  #createEntry(ctx, state) {
    return TrainingEntry.create({
      userId: String(ctx.from.id),
      muscleGroup: state.muscleGroup,
      workoutName: state.workoutName,
      weight: state.weight,
      reps: state.reps,
      bar: state.bar,
      side: state.side,
      note: state.note
    })
  }

  #formatSaved(entry) {
    return [
      'Запись сохранена ✅',
      `Группа: ${entry.muscleGroup}`,
      `Тренировка: ${entry.workoutName}`,
      `Вес: ${entry.weight}`,
      `Штанга: ${entry.bar}`,
      `Одна сторона: ${entry.side} (итого +${entry.side * 2})`,
      `Итоговый вес: ${entry.totalWeight}`,
      `Повторы: ${entry.reps}`,
      entry.note ? `Пояснение: ${entry.note}` : null
    ]
      .filter(Boolean)
      .join('\n')
  }

  #resetForNextSet(state) {
    state.weight = 0
    state.reps = 0
    state.bar = 0
    state.side = 0
    state.note = ''
    state.step = TrainingFlowStep.Weight
  }

  #canCommit(state) {
    return (
      Boolean(state.muscleGroup) &&
      Boolean(state.workoutName) &&
      Number.isFinite(Number(state.weight)) &&
      Number(state.weight) > 0 &&
      Number.isInteger(Number(state.reps)) &&
      Number(state.reps) > 0
    )
  }

  #getCommandArgs(messageText) {
    if (!messageText) return ''
    const parts = messageText.trim().split(' ')
    parts.shift()
    return parts.join(' ').trim()
  }

  async #loadGroups() {
    const data = await this.jsonDb.read(this.groupsDbPath)
    const groups = Array.isArray(data.groups) ? data.groups : []
    return groups.map((g) => String(g).trim().toLowerCase()).filter(Boolean)
  }

  async #appendLog(entry) {
    const data = await this.jsonDb.read(this.logDbPath)
    const items = Array.isArray(data.items) ? data.items : []
    items.push(entry)
    await this.jsonDb.write(this.logDbPath, { items })
  }
}
