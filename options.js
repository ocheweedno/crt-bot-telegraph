const { Markup } = require("telegraf");

module.exports = {
  profile_options: {
    reply_markup: Markup.inlineKeyboard([
      [
        Markup.button.webApp(
          "Моя карта 🎫",
          "https://taupe-smakager-db3f52.netlify.app/"
        ),
      ],
      [Markup.button.callback("Спецпредложения 🎁", "profile_offer")],
    ]),
  },

  offer_options: {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("Отели и гостиницы 🏨", "offer_hostel")],
      [Markup.button.callback("Кафе и рестораны 🍕", "offet_cafe")],
      [Markup.button.callback("Культура и развлечения 🎭", "offer_culture")],
      [Markup.button.callback("Сувениры 🧩", "offer_souvenir")],
      [Markup.button.callback("Медицинский туризм👩‍⚕️", "offer_medicine")],
      [Markup.button.callback("◀️ Назад", "back_to_main")],
    ]),
  },
  offer_options_back: {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("◀️ Назад", "back_to_offer")],
    ]),
  },

  admin_option: {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("Клиенты 💁‍♂️", "get_client")],
      [Markup.button.callback("Города 🏙", "get_citys")],
      [Markup.button.callback("Отправить уведомление 🔔", "send_notification")],
    ]),
  },
  admin_options_back: {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("◀️ Назад", "back_to_admin")],
    ]),
  },
};
