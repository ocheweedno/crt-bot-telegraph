process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { Telegraf, Markup, session, Scenes, Composer } = require("telegraf");

const token_client = "5658698672:AAEJoW0r5goLqycGpm64K1KXA3bF3u1WN78";
const token_admin = "5716052270:AAH5gIRHWAiSb3mTehBSjRoG-eQqMfgBRe4";

const bot_client = new Telegraf(token_client);
const bot_admin = new Telegraf(token_admin);

bot_client.use(session());

const helpers = require("./helpers");
const offersData = require("./database/offers.json");
const dataReader = require("./data-reader");

const {
  profile_options,
  offer_options,
  offer_options_back,
} = require("./options");

const wizardName = new Composer();
wizardName.on("text", (ctx) => {
  ctx.reply("Давайте знакомиться. Как вас зовут?");
  return ctx.wizard.next();
});

const wizardAge = new Composer();
wizardAge.on("text", (ctx) => {
  const text = ctx.update.message.text;

  if (/^[а-яА-ЯёЁ]+$/.test(text) && text.length <= 10) {
    ctx.session.name = helpers.transformText(text);
    ctx.reply("Сколько вам лет?");
    return ctx.wizard.next();
  } else {
    ctx.replyWithHTML(
      "Хорошая попытка 😅\n\n<i>Допустимы только русские буквы. Не больше 10-ти символов без пробелов.</i>"
    );
  }
});

const wizardCity = new Composer();
wizardCity.on("text", (ctx) => {
  const text = ctx.update.message.text;
  if (/^[0-9 ]+$/.test(Number(text)) && text <= 100) {
    ctx.session.age = text;
    ctx.replyWithHTML(
      `${ctx.session.name}, откуда вы приехали?\n\n<i>Пример: Москва, Рязань, Воронеж</i>`
    );
    return ctx.wizard.next();
  } else {
    ctx.replyWithHTML("Интересная версия 😅\n\n<i>Допустимы только цифры.</i>");
  }
});

const wizardWelcome = new Composer();
wizardWelcome.on("text", async (ctx) => {
  const text = ctx.update.message.text;
  if (/^[а-яА-ЯёЁ `-]+$/.test(text) && text.length <= 23) {
    ctx.session.city = helpers.transformText(text);

    await ctx.replyWithHTML(
      `🎉 Вы успешно зарегистрировались в системе карты лояльности <b>«Выгодный путь»</b>`
    );
    await ctx.replyWithHTML(
      "Теперь вы можете пользоваться спецпредложениями от наших партнеров. Достаточно только показать карту в ресторане, отеле или другом заведении из списка партнеров.",
      profile_options.reply_markup
    );

    dataReader
      .saveUser({
        name: ctx.session.name,
        age: ctx.session.age,
        city: ctx.session.city,
        userId: ctx.message.chat.id,
      })
      .then((allAdminId) => {
        allAdminId.map((adminId) => {
          //NOTE: отправляем сообщение в админский бот
          bot_admin.telegram.sendMessage(adminId, sendNewUser(ctx.session), {
            parse_mode: "HTML",
          });
        });
      });

    return ctx.scene.leave();
  } else {
    ctx.replyWithHTML(
      "Хорошая попытка 😅\n\n<i>Допустимы только русские буквы. Не больше 23-х символов.</i>"
    );
  }
});

const menuScene = new Scenes.WizardScene(
  "scenesWizard",
  wizardName,
  wizardAge,
  wizardCity,
  wizardWelcome
);

const stage = new Scenes.Stage([menuScene]);

bot_client.use(stage.middleware());

bot_client.on("text", (ctx) => {
  const text = ctx.update.message.text;
  if (text === "/start" || text === "/restart") {
    sendHi(ctx);
    setTimeout(() => {
      ctx.scene.enter("scenesWizard");
    }, 500);
  }

  if (text === "/menu") {
    sendMenu(ctx);
  }

  if (ctx.message.text.match(/\/h(.+)|\/c(.+)|\/m(.+)|\/s(.+)/)) {
    const itemUuid = helpers.getItemUuid(text);
    const keyDataBase = helpers.getNameForSearch(text);
    const item = offersData[keyDataBase]?.find(
      (item) => item.uuid === itemUuid
    );
    if (item) {
      sendOfferCard(ctx, item, keyDataBase);
    }
  }
});

bot_client.on("callback_query", async (ctx) => {
  const callback_query = ctx.update.callback_query.data;
  const chatId = ctx.update.callback_query.from.id;
  const messageId = ctx.update.callback_query.message.message_id;

  if (callback_query === "back_to_main") {
    bot_client.telegram.deleteMessage(chatId, messageId);
    sendMenu(ctx);
  }

  if (callback_query === "profile_help") {
    bot_client.telegram.deleteMessage(chatId, messageId);
    sendHelp(ctx);
  }

  if (
    callback_query === "profile_offer" ||
    callback_query === "back_to_offer"
  ) {
    bot_client.telegram.deleteMessage(chatId, messageId);
    sendOffers(ctx);
  }

  if (
    callback_query === "offer_hostel" ||
    callback_query === "back_to_hostel"
  ) {
    sendOfferByType(ctx, "hostel");
  }
  if (callback_query === "offet_cafe" || callback_query === "back_to_cafe") {
    sendOfferByType(ctx, "cafe");
  }
  if (
    callback_query === "offer_culture" ||
    callback_query === "back_to_culture"
  ) {
    sendOfferByType(ctx, "culture");
  }
  if (
    callback_query === "offer_souvenir" ||
    callback_query === "back_to_souvenir"
  ) {
    sendOfferByType(ctx, "souvenir");
  }
  if (
    callback_query === "offer_medicine" ||
    callback_query === "back_to_medicine"
  ) {
    sendOfferByType(ctx, "medicine");
  }

  if (callback_query === "reset") {
    bot_client.telegram.deleteMessage(chatId, messageId);
    ctx.replyWithHTML("Давайте начнем сначала");
    await ctx.scene.enter("scenesWizard");
  }
});

bot_client.launch();

function sendHi(ctx) {
  ctx.reply(
    `Привет, дорогой друг!\nДобро пожаловать в Рязань 👋\nСейчас мы расскажем, как выгодно и с пользой провести свой отдых.`
  );
}

function sendMenu(ctx) {
  ctx.replyWithHTML(
    "Теперь вы можете пользоваться спецпредложениями от наших партнеров. Достаточно только показать карту в ресторане, отеле или другом заведении из списка партнеров.",
    profile_options.reply_markup
  );
}

function sendOffers(ctx) {
  ctx.replyWithHTML("<b>Категории:</b>", offer_options.reply_markup);
}

function sendOfferByType(ctx, type) {
  const chatId = ctx.update.callback_query.from.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const link = type.substring(0, 2);
  const html = offersData[type]
    .map((item, i) => {
      return `🔘 <b>${item.title}</b>\nПодробней: 👉 /${link}${item.uuid}`;
    })
    .join("\n\n");
  const titleOffer = helpers.getTitleOffer(link);

  bot_client.telegram.deleteMessage(chatId, messageId);

  ctx.replyWithHTML(
    `<b>${titleOffer}</b>\n\n<i>Для подробностей нажмите на ссылку</i> \n\n${html}`,
    offer_options_back.reply_markup
  );
}

function sendOfferCard(ctx, item, keyDataBase) {
  ctx.replyWithPhoto(
    { url: item.logo },
    {
      caption: `<b>${item?.title}</b>\n\n${item?.desc}\n\n<b>${item?.discount}</b>`,
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        Markup.button.callback("◀️ Назад", `back_to_${keyDataBase}`),
      ]),
    }
  );
}

function sendHelp(ctx) {
  ctx.replyWithHTML(
    `Если у вас остались вопросы по программе <b>«Выгодный путь»</b>, обращайтесь в наш Туристский информационный центр. Мы будем рады гостям❤️\n\nЖелаем вам хорошего отдыха!\n\n📍 ТИЦ, Почтовая, 54\n\n📞 +7 910 577 03-03\n\n🤖 @visitryazantravelbot`,
    Markup.inlineKeyboard([Markup.button.callback("◀️ Назад", "back_to_main")])
  );
}

function sendNewUser(obj) {
  const html = `<b>🎉 У нас новый пользователь 👤</b>\n\n<b>Имя</b> - ${obj.name}\n<b>Возраст</b> - ${obj.age}\n<b>Город</b> - ${obj.city}`;
  return html;
}
