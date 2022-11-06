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
const adminIds = dataReader.getAllAdminId();

const {
  profile_options,
  offer_options,
  offer_options_back,
} = require("./options");

const wizardName = new Composer();
wizardName.on("text", (ctx) => {
  ctx.reply("Как вас зовут?");
  return ctx.wizard.next();
});

const wizardAge = new Composer();
wizardAge.on("text", (ctx) => {
  const text = ctx.update.message.text;

  if (/^[а-яА-ЯёЁ]+$/.test(text)) {
    ctx.session.name = helpers.transformText(text);
    setTimeout(() => {
      ctx.reply("Сколько вам лет?");
      return ctx.wizard.next();
    }, 500);
  } else {
    ctx.reply("Допустимы только русские буквы.");
  }
});

const wizardCity = new Composer();
wizardCity.on("text", (ctx) => {
  const text = ctx.update.message.text;
  if (/^[0-9 ]+$/.test(Number(text))) {
    ctx.session.age = text;
    ctx.reply(`${ctx.session.name}, откуда вы приехали?`);
    return ctx.wizard.next();
  } else {
    ctx.reply("Допустимы только цифры.");
  }
});

const wizardWelcome = new Composer();
wizardWelcome.on("text", async (ctx) => {
  const text = ctx.update.message.text;
  if (/^[а-яА-ЯёЁ]+$/.test(text)) {
    ctx.session.city = helpers.transformText(text);

    //NOTE: отправляем сообщение в админ бота
    let isUserFound = dataReader.getUser(ctx.message.chat.id);

    if (!isUserFound) {
      console.log("isUserFound");
      adminIds.map(async (userId) => {
        await bot_admin.telegram.sendMessage(userId, sendNewUser(ctx.session), {
          parse_mode: "HTML",
        });
      });
    }

    dataReader.saveUser({
      name: ctx.session.name,
      age: ctx.session.age,
      city: ctx.session.city,
      userId: ctx.message.chat.id,
    });
    await ctx.reply(
      `🎉Вы успешно зарегистрировались в системе карты лояльности "Выгодный путь"!🎉`
    );
    await sendMenu(ctx);

    return ctx.scene.leave();
  } else {
    ctx.reply("Допустимы только русские буквы.");
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

  console.log(chatId, messageId);
});

bot_client.launch();

function sendHi(ctx) {
  ctx.reply(
    `Привет, дорогой друг! Добро пожаловать в Рязань 👋 Сейчас мы расскажем, как выгодно, а главное с пользой провести свой отдых.`
  );
}

async function sendMenu(ctx) {
  await ctx.replyWithHTML(
    "<b>⏺ Главное меню ⏺</b>\n\nТеперь вы можете пользоваться спецпредложениями от наших партеров. Достаточно только показать карту в ресторане, отеле или другом заведении из списка партнеров.",
    profile_options.reply_markup
  );
}

function sendOffers(ctx) {
  ctx.replyWithHTML("<b>⏺ Категории: ⏺</b>", offer_options.reply_markup);
}

function sendOfferByType(ctx, type) {
  const chatId = ctx.update.callback_query.from.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const link = type.substring(0, 2);
  const html = offersData[type]
    .map((item, i) => {
      return `<b>${i + 1}.</b> <i>${item.title}</i> - /${link}${item.uuid}`;
    })
    .join("\n\n");
  const titleOffer = helpers.getTitleOffer(link);

  bot_client.telegram.deleteMessage(chatId, messageId);

  ctx.replyWithHTML(
    `<b>${titleOffer}</b>\n\n${html}`,
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

function sendNewUser(obj) {
  const html = `<b>🎉 У нас новый пользователь 👤</b>\n\n<b>Имя</b> - ${obj.name}\n<b>Возраст</b> - ${obj.age}\n<b>Город</b> - ${obj.city}`;
  return html;
}
