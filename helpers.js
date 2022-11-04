function setWebAppUrl() {
  // привязываю profile_options для сета URL, userData для search params
  const { userData, profile_options } = this;

  const url = `https://taupe-smakager-db3f52.netlify.app/`;
  const searchParams = `?name=${userData?.name}`;
  const webAppUrl = encodeURI(url + searchParams);

  profile_options.reply_markup.inline_keyboard[0][0].web_app.url = webAppUrl;
}

function transformText(text) {
  const textLower = text.toLowerCase();

  return textLower[0].toUpperCase() + textLower.slice(1);
}

function getItemUuid(source) {
  return source.substr(3, source.length);
}

function getNameForSearch(source) {
  const key = source.substr(1, 2);

  switch (true) {
    case key === "ho":
      return "hostel";

    case key === "ca":
      return "cafe";

    case key === "cu":
      return "culture";

    case key === "so":
      return "souvenir";

    case key === "me":
      return "medicine";

    default:
      break;
  }
}

module.exports = {
  setWebAppUrl: setWebAppUrl,
  transformText: transformText,
  getItemUuid: getItemUuid,
  getNameForSearch: getNameForSearch,
};
