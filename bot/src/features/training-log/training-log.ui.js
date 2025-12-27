import { TrainingLogPresenter } from './training-log.presenter.js'
import { CancelKeyboard } from './training-log.keyboard.js'

export const TrainingLogUi = {
  async createFormMessage(ctx, state) {
    const msg = await ctx.reply(TrainingLogPresenter.form(state), {
      reply_markup: CancelKeyboard.create()
    })

    return msg.message_id
  },

  async updateFormMessage(ctx, state) {
    const messageId = state?.ui?.messageId
    if (!messageId) return

    await ctx.api.editMessageText(
      ctx.chat.id,
      messageId,
      TrainingLogPresenter.form(state),
      {
        reply_markup: CancelKeyboard.create()
      }
    )
  },

  async closeFormMessage(ctx, state, text = 'Операция завершена.') {
    const messageId = state?.ui?.messageId
    if (!messageId) return

    await ctx.api.editMessageText(ctx.chat.id, messageId, text, {
      reply_markup: { remove_keyboard: true }
    })
  }
}
