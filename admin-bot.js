process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { Telegraf } = require("telegraf");
const token_admin = "5523730787:AAFIeghzZwLo0qxSaD1gwBogBijSSl7rSWE";
const token_client = "5655101504:AAHOpz0IuTcJsltGUdL8pYfhCJOCfFJc2m4";

const bot_admin = new Telegraf(token_admin);
const bot_client = new Telegraf(token_client);

const { admin_option, admin_options_back } = require("./options");

const request = require("./request");
const { getAllUsers, getAllAdmin } = request;

let isSendNotification = false;

bot_admin.start(async (ctx) => {
  const userId = ctx.message.chat.id;

  try {
    const { data } = await getAllAdmin();
    const isAdminFound = data.find((item) => item.admin_id === userId);
    if (isAdminFound) {
      sendAdminMenu(ctx);
    } else {
      await ctx.reply(`⛔️Нет доступа⛔️`);
    }
  } catch (error) {
    console.log(error);
    ctx.reply(`Что-то пошло не так...`);
  }
});

bot_admin.on("text", async (ctx) => {
  const text = ctx.update.message.text;

  try {
    const { data } = await getAllUsers();

    //NOTE: отправляем сообщение в клиентский бот
    if (isSendNotification) {
      data.map((item) => {
        bot_client.telegram.sendMessage(item.user_id, text, {
          parse_mode: "HTML",
        });
      });
    }
  } catch (error) {
    console.log(error);
    ctx.reply(`Что-то пошло не так...`);
  }
});

bot_admin.on("callback_query", async (ctx) => {
  const callback_query = ctx.update.callback_query.data;
  const chatId = ctx.update.callback_query.from.id;
  const messageId = ctx.update.callback_query.message.message_id;

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

async function sendAdminMenu(ctx) {
  await ctx.replyWithHTML("<b>Главное меню</b>", admin_option.reply_markup);
}

async function sendNotification(ctx) {
  await ctx.reply(
    `Введите сообщение для уведомления\n\nДля изменения стиля шрифта оберните текст в следующие теги:\n\n<b>жирный</b>\n\n<i>курсив</i>\n\n<u>подчеркнутый</u>\n\n<s>перечеркнутый</s>\n\n<a href="ссылка">ссылка</a>\n\n\n❗️После отправки нажмите назад❗️`,
    admin_options_back.reply_markup
  );
}
