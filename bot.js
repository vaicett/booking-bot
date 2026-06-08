require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const mainKeyboard = Markup.keyboard([
    ['📆 Записаться', 'ℹ️ О нас'],
    ['📞 Контакты']
]).resize()

bot.start((ctx) => {
    ctx.reply('Привет, я бот для записи. Скоро научусь принимать брони :)');
});

bot.help((ctx) => {
    ctx.reply('Я пока только учусь. Доступные команды: /start, /help, /menu');
});

bot.command('menu', (ctx) => {
    ctx.reply('Выбери, что хочешь:', mainKeyboard);
});

bot.hears('📞 Контакты', (ctx) => {
    ctx.reply('Звоните: +7 ...');
});

bot.hears('ℹ️ О нас', (ctx) => {
    ctx.reply('Сервис по бронировнию отелей');
});

bot.hears('📆 Записаться', (ctx) => {
    ctx.reply('Тут будет второй вид кнопок для выбора даты и времени заселения');
});

bot.on('text', (ctx) => {
    ctx.reply('Не очень понял текст, поробуйте воспользоваться командой /help');
});

bot.launch()
    .then(() => console.log('Бот запущен!'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));