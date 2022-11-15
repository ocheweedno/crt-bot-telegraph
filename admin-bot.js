process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { Telegraf } = require("telegraf");
const token_admin = "5716052270:AAH5gIRHWAiSb3mTehBSjRoG-eQqMfgBRe4";
const token_client = "5658698672:AAEJoW0r5goLqycGpm64K1KXA3bF3u1WN78";

const bot_admin = new Telegraf(token_admin);
const bot_client = new Telegraf(token_client);

const dataReader = require("./data-reader");
const { admin_option, admin_options_back } = require("./options");

let isSendNotification = false;

bot_admin.start((ctx) => {
  const isAdminFound = dataReader.getAdmin(ctx.message.chat.id);

  if (isAdminFound) {
    sendAdminMenu(ctx);
  } else {
    ctx.reply(`Нет доступа`);
  }
});

bot_admin.on("text", (ctx) => {
  const text = ctx.update.message.text;
  const isAdminFound = dataReader.getAdmin(ctx.message.chat.id);

  const userIds = dataReader.getAllUsersId();

  if (isAdminFound) {
    //NOTE: отправляем сообщение в клиентский бот
    if (isSendNotification) {
      userIds.map((userId) => {
        bot_client.telegram.sendMessage(userId, text, {
          parse_mode: "HTML",
        });
      });
    }
  } else {
    ctx.reply(`Нет доступа`);
  }
});

bot_admin.on("callback_query", async (ctx) => {
  const callback_query = ctx.update.callback_query.data;
  const chatId = ctx.update.callback_query.from.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const usersData = dataReader.getUsersData();
  const dataCitys = dataReader.getCitys();
  const countUsers = usersData.length;

  if (callback_query === "get_client") {
    bot_admin.telegram.deleteMessage(chatId, messageId);
    sendCountUsers(ctx, countUsers);
  }
  if (callback_query === "get_citys") {
    bot_admin.telegram.deleteMessage(chatId, messageId);
    sendCityFrom(ctx, dataCitys);
  }
  if (callback_query === "back_to_admin") {
    isSendNotification = false;
    bot_admin.telegram.deleteMessage(chatId, messageId);
    sendAdminMenu(ctx);
  }
  if (callback_query === "send_notification") {
    isSendNotification = true;
    bot_admin.telegram.deleteMessage(chatId, messageId);
    sendNotification(ctx);
  }
});

bot_admin.launch();

function sendAdminMenu(ctx) {
  ctx.replyWithHTML("<b>Главное меню</b>", admin_option.reply_markup);
}

function sendCountUsers(ctx, count) {
  ctx.replyWithHTML(
    `<b>Бота установили ${count} раз</b>`,
    admin_options_back.reply_markup
  );
}

function sendCityFrom(ctx, citys) {
  const html = citys
    .map((item, i) => {
      return `<b>${item.city}</b> - ${item.total}`;
    })
    .join("\n");
  ctx.replyWithHTML(
    `<b>Города</b>\n\n${html}`,
    admin_options_back.reply_markup
  );
}

function sendNotification(ctx) {
  ctx.reply(
    `Введите сообщение для уведомления\n\nДля изменения стиля шрифта оберните текст в следующие теги:\n\n<b>жирный</b>\n\n<i>курсив</i>\n\n<u>подчеркнутый</u>\n\n<s>перечеркнутый</s>\n\n<a href="ссылка">ссылка</a>\n\n\n❗️После отправки нажмите назад❗️`,
    admin_options_back.reply_markup
  );
}
