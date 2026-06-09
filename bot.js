require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const bot = new Telegraf(process.env.BOT_TOKEN, { telegram: { agent } });

const mainKeyboard = Markup.keyboard([
    ['📆 Записаться', '📞 Контакты'],
    ['ℹ️ О нас', '🆘 Помощь']
]).resize()

bot.start((ctx) => {
    ctx.reply('Привет, я бот для записи. Скоро научусь принимать брони :)', mainKeyboard);
});

bot.command('menu', (ctx) => {
    ctx.reply('Выбери, что хочешь:', mainKeyboard);
});

bot.hears('📞 Контакты', (ctx) => {
    ctx.reply(`📞 Контактная информация

По всем вопросам бронирования и сотрудничества:

👤 Менеджер: @booking_support
📧 Email: support@easybooking.pro
📱 Телефон: +7 (999) 123-45-67

🕒 Время работы:
Ежедневно с 09:00 до 22:00 по МСК

Мы постараемся ответить вам как можно быстрее ✨`);
});

bot.hears('ℹ️ О нас', (ctx) => {
    ctx.reply(`🏨 О нашем сервисе

Мы помогаем быстро и удобно бронировать отели по всему миру.

✅ Большой выбор гостиниц
✅ Актуальные цены и специальные предложения
✅ Простое и безопасное бронирование
✅ Поддержка клиентов на всех этапах

Наша цель — сделать поиск и бронирование жилья максимально комфортным для каждого путешественника ✈️`);
});

bot.hears('📆 Записаться', (ctx) => {
    ctx.reply('Тут будет второй вид кнопок для выбора даты и времени заселения');
});

bot.hears('🆘 Помощь', (ctx) => {
    ctx.reply(`🆘 Поддержка

Если у вас возникли вопросы по бронированию, оплате или работе сервиса, мы готовы помочь.

📋 Доступные команды:
/start — запуск бота
/menu — главное меню

💬 Связаться с поддержкой:
👉 @booking_support

🕒 Время работы:
Ежедневно с 09:00 до 22:00 по МСК

Мы ответим вам в ближайшее время ✨`);
});

bot.on('text', (ctx) => {
    ctx.reply(`🤔 Я не смог распознать ваш запрос.

Воспользуйтесь меню команд через /menu или выберите нужный раздел с помощью кнопок.

🆘 Если у вас возникли вопросы, откройте раздел «Помощь» в меню.

Желаю приятного бронирования! 🏨✨`);
});

bot.launch(() => console.log('Бот запущен!'))
    .catch((err) => {
        console.error('Не удалось запустить бота:', err);
        process.exit(1);
    });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));