require('dotenv').config();

const { Telegraf, Markup, session } = require('telegraf');
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

const selectBranch = Markup.inlineKeyboard([
    [Markup.button.callback('🎮 Баумана, 15 (+ VR)', 'branch_bauman')],
    [Markup.button.callback('💼 Кремлёвская, 8 (коворкинг)', 'branch_kremlin')],
    [Markup.button.callback('🎓 Профессора Нужина, 3 (КФУ)', 'branch_univer')],
])

bot.use(session({ defaultSession: () => ({}) }));

bot.start((ctx) => {
  ctx.reply(`⏱️ Добро пожаловать в «Тайм-Аут»!
Я помогу забронировать зону в нашей сети антикафе быстро и без звонков.

✨ Через бота ты можешь:
- Выбрать филиал в своём городе
- Посмотреть свободные зоны и слоты времени
- Забронировать игровую, переговорку, лаунж или VR-комнату
- Узнать тарифы и получить поддержку

Платишь за время, а не за еду — чай, кофе и настолки уже включены 🍪

Чтобы начать, жми кнопки в меню ниже 👇`, mainKeyboard);
});

bot.command('menu', (ctx) => {
  ctx.reply(`📋 Главное меню
Выбери нужный раздел с помощью кнопок ниже 👇

⏱️ Найди свободную зону в любом из наших филиалов и забронируй слот всего за пару минут.`, mainKeyboard);
});

bot.hears('📞 Контакты', (ctx) => {
  ctx.reply(`📞 Контактная информация
По вопросам брони и сотрудничества:

👤 Менеджер: @timeout_support
📧 Email: hello@timeout-cafe.ru
📱 Телефон: +7 (843) 123-45-67

📍 Наши филиалы в Казани:
- Баумана, 15 (+ VR-зона)
- Кремлёвская, 8 (коворкинг)
- Профессора Нужина, 3 (рядом с КФУ)

🕒 Время работы:
Ежедневно с 10:00 до 02:00 по МСК

Ответим максимально быстро ✨`);
});

bot.hears('ℹ️ О нас', (ctx) => {
  ctx.reply(`⏱️ О сети антикафе «Тайм-Аут»
Мы — место, где ты платишь за время, а не за еду. Чай, кофе, настолки и приставки уже включены.

✅ 3 филиала в Казани — выбирай удобный
✅ Игровые зоны (PS5/ПК), VR, переговорки и лаунж
✅ Поминутная оплата со стоп-чеком — не переплатишь
✅ Скидка 30% для студентов
✅ Бронь зоны и слота прямо здесь, без звонков

Наша цель — чтобы ты пришёл, занял своё место и просто отдыхал или работал в комфорте 🎮`);
});

bot.hears('📆 Записаться', (ctx) => {
    ctx.reply(`📍 Выбери филиал в Казани:`, selectBranch);
});

bot.hears('🆘 Помощь', (ctx) => {
  ctx.reply(`🆘 Поддержка
Если есть вопросы по брони, тарифам или работе бота — поможем.

📋 Доступные команды:
/start — запуск бота
/menu — главное меню

💬 Связаться с поддержкой:
👉 @timeout_support

🕒 Время работы:
Ежедневно с 10:00 до 02:00 по МСК

Ответим в ближайшее время ✨`);
});

bot.action('branch_bauman', (ctx) => {
    ctx.answerCbQuery();
    ctx.session.branch = 'Баумана, 15';
    ctx.reply(`✅ Филиал «${ctx.session.branch}» выбран. Дальше выбираем зону.`);
});

bot.action('branch_kremlin', (ctx) => {
    ctx.answerCbQuery();
    ctx.session.branch = 'Кремлёвская, 8';
    ctx.reply(`✅ Филиал «${ctx.session.branch}» выбран. Дальше выбираем зону.`);
});

bot.action('branch_univer', (ctx) => {
    ctx.answerCbQuery();
    ctx.session.branch = 'Профессора Нужина, 3';
    ctx.reply(`✅ Филиал «${ctx.session.branch}» выбран. Дальше выбираем зону.`);
});

bot.on('text', (ctx) => {
  ctx.reply(`🤔 Не смог распознать запрос.
Открой меню команд через /menu или выбери нужный раздел кнопками ниже.

🆘 Если что-то непонятно — загляни в раздел «Помощь».

Хорошего отдыха в «Тайм-Аут»! ⏱️✨`);
});

bot.launch(() => console.log('Бот запущен!'))
    .catch((err) => {
        console.error('Не удалось запустить бота:', err);
        process.exit(1);
    });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));