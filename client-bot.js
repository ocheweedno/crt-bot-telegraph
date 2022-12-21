process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { Telegraf, Markup, session, Scenes, Composer } = require("telegraf");

const token_client = "5655101504:AAHOpz0IuTcJsltGUdL8pYfhCJOCfFJc2m4";
const token_admin = "5523730787:AAFIeghzZwLo0qxSaD1gwBogBijSSl7rSWE";

const bot_client = new Telegraf(token_client);
const bot_admin = new Telegraf(token_admin);

bot_client.use(session());

const helpers = require("./helpers");
const offersData = require("./database/offers.json");

const request = require("./request");
const { createUser, getUser, getAllAdmin } = request;

const {
  profile_options,
  offer_options,
  offer_options_back,
} = require("./options");

const wizardName = new Composer();
wizardName.on("text", async (ctx) => {
  await ctx.reply("Давайте знакомиться. Как вас зовут?");
  return ctx.wizard.next();
});

const wizardAge = new Composer();
wizardAge.on("text", async (ctx) => {
  const text = ctx.update.message.text;

  if (/^[а-яА-ЯёЁ]+$/.test(text) && text.length <= 10) {
    ctx.session.name = helpers.transformText(text);
    await ctx.reply("Сколько вам лет?");
    return ctx.wizard.next();
  } else {
    await ctx.replyWithHTML(
      "Хорошая попытка 😅\n\n<i>Допустимы только русские буквы. Не больше 10-ти символов без пробелов.</i>"
    );
  }
});

const wizardCity = new Composer();
wizardCity.on("text", async (ctx) => {
  const text = ctx.update.message.text;
  if (/^[0-9 ]+$/.test(Number(text)) && text <= 100) {
    ctx.session.age = text;
    ctx.reply(`${ctx.session.name}, откуда вы приехали?`);
    return ctx.wizard.next();
  } else {
    await ctx.replyWithHTML(
      "Интересная версия 😅\n\n<i>Допустимы только цифры.</i>"
    );
  }
});

const wizardWelcome = new Composer();
wizardWelcome.on("text", async (ctx) => {
  const text = ctx.update.message.text;
  if (/^[а-яА-ЯёЁ `-]+$/.test(text) && text.length <= 23) {
    ctx.session.city = helpers.transformText(text);

    try {
      await createUser({
        name: ctx.session.name,
        age: ctx.session.age,
        city: ctx.session.city,
        userId: ctx.message.chat.id,
      });

      await ctx.replyWithHTML(
        `🎉 Вы успешно зарегистрировались в системе карты лояльности <b>«Выгодный путь»</b>`
      );
      await ctx.replyWithHTML(
        "Теперь вы можете пользоваться спецпредложениями от наших партнеров. Достаточно только показать карту в ресторане, отеле или другом заведении из списка партнеров.",
        profile_options.reply_markup
      );
    } catch (err) {
      await ctx.replyWithHTML(`Упс! Что-то пошло не так, попробуйте еще раз`);
    }

    try {
      await getAllAdmin().then((res) => {
        res.data.map((item) => {
          bot_admin.telegram.sendMessage(
            item.admin_id,
            sendNewUser(ctx.session),
            {
              parse_mode: "HTML",
            }
          );
        });
      });
    } catch (error) {
      console.log(error, "Не удалось отправить уведомление админам");
    }

    return ctx.scene.leave();
  } else {
    await ctx.replyWithHTML(
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

bot_client.on("text", async (ctx) => {
  const text = ctx.update.message.text;
  const userId = ctx.message.chat.id;

  if (text === "/start" || text === "/restart") {
    try {
      const { status, data } = await getUser(userId);
      if (status === 201) {
        ctx.reply(`${data.name}, добро пожаловать снова!`);
        setTimeout(() => {
          sendMenu(ctx);
        }, 500);
      }
      if (status === 200) {
        sendHi(ctx);
        setTimeout(() => {
          ctx.scene.enter("scenesWizard");
        }, 500);
      }
    } catch (error) {
      console.log(error);
      await ctx.replyWithHTML(`Упс! Что-то пошло не так, попробуйте еще раз`);
    }
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
});

bot_client.launch();

async function sendHi(ctx) {
  await ctx.reply(
    `Привет, дорогой друг!\nДобро пожаловать в Рязань 👋\nСейчас мы расскажем, как выгодно и с пользой провести свой отдых.`
  );
}

async function sendMenu(ctx) {
  await ctx.replyWithHTML(
    "Теперь вы можете пользоваться спецпредложениями от наших партнеров. Достаточно только показать карту в ресторане, отеле или другом заведении из списка партнеров.",
    profile_options.reply_markup
  );
}

async function sendOffers(ctx) {
  await ctx.replyWithHTML("<b>Категории:</b>", offer_options.reply_markup);
}

async function sendOfferByType(ctx, type) {
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

  await ctx.replyWithHTML(
    `<b>${titleOffer}</b>\n\n<i>Для подробностей нажмите на ссылку</i> \n\n${html}`,
    offer_options_back.reply_markup
  );
}

async function sendOfferCard(ctx, item, keyDataBase) {
  await ctx.replyWithPhoto(
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

async function sendHelp(ctx) {
  await ctx.replyWithHTML(
    `Если у вас остались вопросы по программе <b>«Выгодный путь»</b>, обращайтесь в наш Туристский информационный центр. Мы будем рады гостям❤️\n\nЖелаем вам хорошего отдыха!\n\n📍 ТИЦ, Почтовая, 54\n\n📞 +7 910 577 03-03\n\n🤖 @visitryazantravelbot`,
    Markup.inlineKeyboard([Markup.button.callback("◀️ Назад", "back_to_main")])
  );
}

function sendNewUser(obj) {
  const html = `<b>🎉 У нас новый пользователь 👤</b>\n\n<b>Имя</b> - ${obj.name}\n<b>Возраст</b> - ${obj.age}\n<b>Город</b> - ${obj.city}`;
  return html;
}
