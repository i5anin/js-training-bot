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

const handlers = Object.freeze({
  start: (ctx) => trainingHandlers.start(ctx),
  stop: (ctx) => trainingHandlers.stop(ctx),
  done: (ctx) => trainingHandlers.done(ctx),
  bar: (ctx) => trainingHandlers.bar(ctx),
  side: (ctx) => trainingHandlers.side(ctx),
  note: (ctx) => trainingHandlers.note(ctx),
  help: (ctx) => trainingHandlers.help(ctx),
  onText: (ctx) => trainingHandlers.onText(ctx)
})

bot.command('start', (ctx) => ctx.reply('start ok'))

bot.command('train', handlers.start)

bot.command('stop', handlers.stop)

bot.command('done', handlers.done)

bot.command('bar', handlers.bar)

bot.command('side', handlers.side)

bot.command('note', handlers.note)

bot.command('help', handlers.help)

bot.on('message:text', handlers.onText)

bot.catch((err) => console.error('BOT ERROR:', err.error))

await bot.api.setMyCommands([
  { command: 'start', description: 'старт' },
  { command: 'train', description: 'начать тренировку' },
  { command: 'stop', description: 'остановить запись' },
  { command: 'done', description: 'завершить/сохранить' },
  { command: 'bar', description: 'модификатор штанги (+10)' },
  { command: 'side', description: 'модификатор на сторону (+5)' },
  { command: 'note', description: 'пояснение' },
  { command: 'help', description: 'подсказка (вкл/выкл)' }
])

console.log('✅ Commands set')


bot.start({
  onStart: (info) => {
    console.log('Bot started ✅')
    console.log(`Username: https://t.me/${info.username}`)
    console.log(`Bot ID: ${info.id}`)
  }
})
