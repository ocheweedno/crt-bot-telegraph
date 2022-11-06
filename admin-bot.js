process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { Telegraf } = require("telegraf");
const token = "5716052270:AAH5gIRHWAiSb3mTehBSjRoG-eQqMfgBRe4";
const token_client = "5658698672:AAEJoW0r5goLqycGpm64K1KXA3bF3u1WN78";

const bot = new Telegraf(token);
const bot_client = new Telegraf(token_client);

const dataReader = require("./data-reader");
const { admin_option, admin_options_back } = require("./options");

let isSendNotification = false;

bot.start((ctx) => {
  sendAmdinMenu(ctx);
});

bot.on("text", (ctx) => {
  const text = ctx.update.message.text;
  if (isSendNotification) {
    const userIds = dataReader.getAllUsersId();
    userIds.map((userId) => {
      bot_client.telegram.sendMessage(userId, text);
    });
  }
});

bot.on("callback_query", async (ctx) => {
  const callback_query = ctx.update.callback_query.data;
  const chatId = ctx.update.callback_query.from.id;
  const messageId = ctx.update.callback_query.message.message_id;

  const usersData = dataReader.getUsersData();
  const dataCitys = dataReader.getCitys();
  const countUsers = usersData.length;

  if (callback_query === "static_client") {
    bot.telegram.deleteMessage(chatId, messageId);
    sendCountUsers(ctx, countUsers);
  }
  if (callback_query === "static_citys") {
    bot.telegram.deleteMessage(chatId, messageId);
    sendCityFrom(ctx, dataCitys);
  }
  if (callback_query === "back_to_admin") {
    isSendNotification = false;
    bot.telegram.deleteMessage(chatId, messageId);
    sendAmdinMenu(ctx);
  }
  if (callback_query === "send_notification") {
    isSendNotification = true;
    bot.telegram.deleteMessage(chatId, messageId);
    ctx.replyWithHTML(
      `<b>⏺Введите сообщение для уведомления⏺\n\nПосле отправки нажмите вернитесь назад</b>`,
      admin_options_back.reply_markup
    );
  }
});

bot.launch();

function sendAmdinMenu(ctx) {
  ctx.replyWithHTML("<b>⏺ Главное меню ⏺</b>", admin_option.reply_markup);
}

function sendCountUsers(ctx, count) {
  ctx.replyWithHTML(
    `<b>⏺ Бота установили ${count} раз ⏺</b>`,
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
    `<b>⏺ Города ⏺</b>\n\n${html}`,
    admin_options_back.reply_markup
  );
}
