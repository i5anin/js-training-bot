import 'dotenv/config'
import { Bot, session } from 'grammy'
import { JsonDbRepository } from '@/infrastructure/json-db/json-db.repository.js'
import { TrainingLogHandlers } from '@/features/training-log/training-log.handlers.js'

const token = process.env.BOT_TOKEN
if (!token) throw new Error('BOT_TOKEN is missing in environment variables')

const bot = new Bot(token)
bot.use(session({ initial: () => ({}) }))

const jsonDb = new JsonDbRepository()

const trainingHandlers = new TrainingLogHandlers({
  groupsDbPath: './src/data/muscle-groups.json',
  logDbPath: './src/data/training-log.json',
  jsonDb
})

bot.command('start', (ctx) => ctx.reply('start ok'))
bot.command('train', (ctx) => trainingHandlers.start(ctx))
bot.command('training', (ctx) => trainingHandlers.start(ctx))

bot.command('stop', (ctx) => trainingHandlers.stop(ctx))
bot.command('cancel', (ctx) => trainingHandlers.stop(ctx))
bot.command('done', (ctx) => trainingHandlers.done(ctx))

bot.command('bar', (ctx) => trainingHandlers.bar(ctx))
bot.command('side', (ctx) => trainingHandlers.side(ctx))
bot.command('note', (ctx) => trainingHandlers.note(ctx))

bot.on('message:text', (ctx) => trainingHandlers.onText(ctx))

bot.catch((err) => console.error('BOT ERROR:', err.error))

// ✅ Задаём команды “Меню” программно
await bot.api.setMyCommands([
  { command: 'start', description: 'старт' },
  { command: 'train', description: 'начать тренировку' },
  { command: 'training', description: 'начать тренировку (alias)' },
  { command: 'stop', description: 'остановить текущую запись' },
  { command: 'cancel', description: 'отменить текущую запись' },
  { command: 'done', description: 'завершить упражнение/тренировку' },
  { command: 'bar', description: 'модификатор штанги (+10)' },
  { command: 'side', description: 'модификатор на одну сторону (+5)' },
  { command: 'note', description: 'пояснение (ремень/пояс)' }
])

bot.start({
  onStart: (info) => {
    console.log('Bot started ✅')
    console.log(`Username: @${info.username}`)
    console.log(`Bot ID: ${info.id}`)
  }
})
