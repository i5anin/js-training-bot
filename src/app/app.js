import "dotenv/config";
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN is missing in environment variables");
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  await ctx.reply("Привет! Я бот на grammY ✅");
});

bot.command("help", async (ctx) => {
  await ctx.reply(
      [
        "Доступные команды:",
        "/start — запустить",
        "/help — помощь",
        "/ping — проверка",
      ].join("\n")
  );
});

bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});

bot.on("message:text", async (ctx) => {
  await ctx.reply(`Ты написал: ${ctx.message.text}`);
});

bot.catch((err) => {
  console.error("Bot error:", err.error);
});

await bot.start();
console.log("Bot started ✅");
