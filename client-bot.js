process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { Telegraf, Markup, session, Scenes, Composer } = require("telegraf");

const token = "5658698672:AAEJoW0r5goLqycGpm64K1KXA3bF3u1WN78";
const bot = new Telegraf(token);

bot.use(session());

const helpers = require("./helpers");

let context = {
  step: 0,
  userData: {
    city: "",
    name: "",
    age: "",
  },
  isChangeName: false,
  isChangeCity: false,
  isChangeAge: false,
  isDeclineEdit: false,
  chatId: "",
};

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
  ctx.reply(`${ctx.session.name}, откуда вы приехали?`);
  const text = ctx.update.message.text;
  ctx.session.age = text;
  return ctx.wizard.next();
});

const wizardWelcome = new Composer();
wizardWelcome.on("text", (ctx) => {
  ctx.reply(
    `Отлично🎉 Вы успешно зарегистрировались в системе карты лояльности "Выгодный путь"! Теперь вы можете пользоваться спецпредложениями от наших партеров. Достаточно только показать карту в ресторане, отеле или другом заведении из списка партнеров.`
  );
  const text = ctx.update.message.text;
  ctx.session.city = text;
  return ctx.scene.leave();
});

const menuScene = new Scenes.WizardScene(
  "scenesWizard",
  wizardName,
  wizardAge,
  wizardCity,
  wizardWelcome
);

const stage = new Scenes.Stage([menuScene]);

bot.use(stage.middleware());

bot.start((ctx) => {
  const chatId = ctx.message.chat.id;
  ctx.session ??= context;
  ctx.session.chatId = chatId;
  ctx.reply(
    `Привет, дорогой друг! Добро пожаловать в Рязань 👋 Сейчас мы расскажем, как выгодно, а главное с пользой провести свой отдых.`
  );
  setTimeout(() => {
    ctx.scene.enter("scenesWizard");
  }, 500);
});

bot.on("text", (ctx) => {
  console.log(ctx.session);
});

bot.launch();
