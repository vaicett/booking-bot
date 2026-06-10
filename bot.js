require('dotenv').config();

const { Telegraf, Markup, session } = require('telegraf');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const bot = new Telegraf(process.env.BOT_TOKEN, { telegram: { agent } });

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const BRANCHES = {
    bauman: 'Баумана, 15',
    kremlin: 'Кремлёвская, 8',
    univer: 'Профессора Нужина, 3',
}

const ZONES = {
    game: 'Игровая (PS5/ПК)',
    meeting: 'Переговорка',
    lounge: 'Лаунж',
    vr: 'VR-комната',
}

const mainKeyboard = Markup.keyboard([
    ['💰 Прайс-лист'],
    ['📆 Записаться', '📞 Контакты'],
    ['ℹ️ О нас', '🆘 Помощь']
]).resize()

const selectBranch = Markup.inlineKeyboard([
    [Markup.button.callback('Баумана, 15', 'branch_bauman')],
    [Markup.button.callback('Кремлёвская, 8', 'branch_kremlin')],
    [Markup.button.callback('Профессора Нужина, 3', 'branch_univer')],
])

const selectZone = Markup.inlineKeyboard([
    [Markup.button.callback('🎮 Игровая (PS5/ПК)', 'zone_game')],
    [Markup.button.callback('💼 Переговорка', 'zone_meeting')],
    [Markup.button.callback('🛋 Лаунж', 'zone_lounge')],
])

const selectZoneWithVR = Markup.inlineKeyboard([
    [Markup.button.callback('🎮 Игровая (PS5/ПК)', 'zone_game')],
    [Markup.button.callback('💼 Переговорка', 'zone_meeting')],
    [Markup.button.callback('🛋 Лаунж', 'zone_lounge')],
    [Markup.button.callback('🥽 VR-комната', 'zone_vr')],
])

function buildDateKeyboard(days = 7) {
    const buttons = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;

        let label;
        if (i === 0) label = 'Сегодня';
        else if (i === 1) label = 'Завтра';
        else label = `${WEEKDAYS[d.getDay()]}, ${dd}.${mm}`;

        buttons.push(Markup.button.callback(label, `date_${iso}`));
    }

    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(buttons.slice(i, i + 3));
    }
    return Markup.inlineKeyboard(rows);
}

function buildHourKeyboard(prefix, startHour = 10, endHour = 22) {
    const buttons = [];
    for (let h = startHour; h <= endHour; h++) {
        const hh = String(h).padStart(2, '0');
        buttons.push(Markup.button.callback(`${hh} ч`, `${prefix}_h_${hh}`));
    }
    const rows = [];
    for (let i = 0; i < buttons.length; i += 4) {
        rows.push(buttons.slice(i, i + 4));
    }
    return Markup.inlineKeyboard(rows);
}

function buildMinuteKeyboard(prefix, hh) {
    const mins = ['00', '15', '30', '45'];
    const row = mins.map(mm => 
        Markup.button.callback(`${hh}:${mm}`, `${prefix}_t_${hh}:${mm}`)
    );
    return Markup.inlineKeyboard([row]);
}

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
Ежедневно с 10:00 до 02:00 (по Казани)

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

bot.hears('💰 Прайс-лист', (ctx) => {
  ctx.reply(`💰 Прайс-лист «Тайм-Аут»
Платишь за время, а не за еду.
———————————————

⌛ Тариф по времени
- Первый час —  3 ₽/мин
- После 60 минут —  2 ₽/мин
- Стоп-чек —  600 ₽/день
  (дальше время бесплатно)

🎓 Скидки
- Студентам −30% по студенческому билету!

🍪 Уже включено в стоимость
- Чай, кофе, печеньки
- Настолки и приставки
- Wi-Fi и зарядки

🪑 Зоны
- 🎮 Игровая (PS5 / ПК)
- 💼 Переговорка
- 🛋 Лаунж
- 🥽 VR-комната — только на Баумана
———————————————

Бронь — кнопка «Записаться» в меню 👇`);
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
Ежедневно с 10:00 до 02:00 (по Казани)

Ответим в ближайшее время ✨`);
});

bot.action(/^branch_(.+)$/, (ctx) => {
  ctx.answerCbQuery();
  const key = ctx.match[1];
  ctx.session.branch = BRANCHES[key];
  const kb = key === 'bauman' ? selectZoneWithVR : selectZone;
  ctx.reply(`✅ Филиал выбран
🏢 Филиал:  ${ctx.session.branch}
———————————————
Шаг 2 из 4 — выбери зону 👇`, kb);
});

bot.action(/^zone_(.+)$/, (ctx) => {
  ctx.answerCbQuery();
  const key = ctx.match[1];
  ctx.session.zone = ZONES[key];
  ctx.reply(`✅ Зона выбрана
🏢 Филиал:  ${ctx.session.branch}
🎮 Зона:  ${ctx.session.zone}
———————————————
Шаг 3 из 4 — выбери дату 👇`, buildDateKeyboard());
});

bot.action(/^date_(.+)$/, (ctx) => {
  ctx.answerCbQuery();
  ctx.session.date = ctx.match[1];
  ctx.reply(`✅ Дата выбрана
🏢 Филиал:  ${ctx.session.branch}
🎮 Зона:  ${ctx.session.zone}
📅 Дата:  ${ctx.session.date}
———————————————
Шаг 4 из 4 — во сколько придёшь? 👇`, buildHourKeyboard('arrive'));
});

bot.action(/^arrive_h_(.+)$/, (ctx) => {
  ctx.answerCbQuery();
  const hh = ctx.match[1];
  ctx.reply(`🕒 Час прихода: ${hh}:00
Уточни минуты 👇`, buildMinuteKeyboard('arrive', hh));
});

bot.action(/^arrive_t_(.+)$/, (ctx) => {
  ctx.answerCbQuery();
  ctx.session.time = ctx.match[1];
  const { branch, zone, date, time } = ctx.session;
  ctx.reply(`✅ Бронь оформлена
———————————————
🏢 Филиал:  ${branch}
🎮 Зона:  ${zone}
📅 Дата:  ${date}
🕒 Приход:  к ${time}
———————————————
🎓 Студенческий билет даёт скидку 30%.
Ждём тебя в «Тайм-Аут» 🍪`);
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