import "dotenv/config";
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is missing in environment variables");

const bot = new Bot(token);

// 1) Лог любого апдейта (НЕ блокирует цепочку)
bot.use(async (ctx, next) => {
    console.log("UPDATE_ID:", ctx.update.update_id);
    await next();
});

// 2) Лог сообщений (НЕ блокирует цепочку)
bot.on("message", async (ctx, next) => {
    const text = ctx.message?.text ?? "[non-text]";
    const entities = ctx.message?.entities ?? [];
    console.log("MESSAGE:", { text, entities });
    await next();
});

// 3) Команды
bot.command("start", async (ctx) => {
    console.log("COMMAND /start");
    await ctx.reply("start ok");
});

bot.command("train", async (ctx) => {
    console.log("COMMAND /train");
    await ctx.reply("train ok ✅");
});

bot.command("debug", async (ctx) => {
    console.log("COMMAND /debug");
    await ctx.reply(
        JSON.stringify(
            {
                chat: { id: ctx.chat?.id, type: ctx.chat?.type },
                from: { id: ctx.from?.id, username: ctx.from?.username },
                text: ctx.message?.text,
                entities: ctx.message?.entities,
            },
            null,
            2
        )
    );
});

bot.catch((err) => console.error("BOT ERROR:", err.error));

bot.start({
    onStart: (info) => {
        console.log("Bot started ✅");
        console.log(`Username: @${info.username}`);
        console.log(`Bot ID: ${info.id}`);
    },
});
