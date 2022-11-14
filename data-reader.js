const fs = require("fs");
var _ = require("lodash");

//NOTE: получаем данные пользователей
function getUsersData() {
  const usersData = fs.readFileSync("./database/users.json");
  return JSON.parse(usersData);
}
//NOTE: получаем данные админов
function getAdminData() {
  const usersData = fs.readFileSync("./database/admin.json");
  return JSON.parse(usersData);
}
//NOTE: сохраняем данные пользователей
function saveUser(userData) {
  const lastUsersData = getUsersData();

  if (!getUser(userData.userId)) {
    lastUsersData.push(userData);
    fs.writeFileSync("./database/users.json", JSON.stringify(lastUsersData));
    return;
  }
  return;
}
//NOTE: сохраняем данные админа
/* function saveAdmin(adminData) {
  const lastUsersData = getAdminData();

  if (!getAdmin(adminData.userId)) {
    lastUsersData.push(adminData);
    fs.writeFileSync("./database/admin.json", JSON.stringify(lastUsersData));
    return;
  }
  return;
} */
//NOTE: получаем конкретного пользователя
function getUser(id) {
  const lastUsersData = getUsersData();
  return lastUsersData.find((item) => item.userId === id);
}
//NOTE: получаем конкретного админа
function getAdmin(id) {
  const lastAdminData = getAdminData();
  return lastAdminData.find((item) => item.userId === id);
}
//NOTE: получаем айди всех пользователей
function getAllUsersId() {
  const lastUsersData = getUsersData();
  return lastUsersData.map((item) => item.userId);
}
//NOTE: получаем айди всех админов
/* function getAllAdminId() {
  const lastAdminData = getAdminData();
  return lastAdminData.map((item) => item.userId);
} */

function getCitys() {
  const lastUsersData = getUsersData();
  return _.map(_.countBy(lastUsersData, "city"), (val, key) => ({
    city: key,
    total: val,
  }));
}

module.exports = {
  getUsersData: getUsersData,
  saveUser: saveUser,
  getUser: getUser,
  getCitys: getCitys,
  getAllUsersId: getAllUsersId,
  getAdmin: getAdmin,
};
