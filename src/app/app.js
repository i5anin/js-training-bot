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
bot.on('message:text', (ctx) => trainingHandlers.onText(ctx))

bot.catch((err) => console.error('BOT ERROR:', err.error))

bot.start({
  onStart: (info) => {
    console.log('Bot started ✅')
    console.log(`Username: @${info.username}`)
    console.log(`Bot ID: ${info.id}`)
  }
})
