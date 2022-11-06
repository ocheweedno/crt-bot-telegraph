const fs = require("fs");
var _ = require("lodash");

function getUsersData() {
  const usersData = fs.readFileSync("./database/users.json");
  return JSON.parse(usersData);
}

function saveUser(userData) {
  const lastUsersData = getUsersData();

  if (!getUser(userData.userId)) {
    lastUsersData.push(userData);
    fs.writeFileSync("./database/users.json", JSON.stringify(lastUsersData));
    return;
  }
  return;
}

function getUser(id) {
  const lastUsersData = getUsersData();
  return lastUsersData.find((item) => item.userId === id);
}

function getAllUsersId() {
  const lastUsersData = getUsersData();
  return lastUsersData.map((item) => item.userId);
}

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
};
