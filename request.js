const axios = require("axios");

const API_URL = "http://localhost:8080/api";
const CREATE_USER_URL = `${API_URL}/user`;
const GET_USER_URL = `${API_URL}/user`;
const GET_ALL_USERS_URL = `${API_URL}/users`;
const GET_ALL_ADMINS_URL = `${API_URL}/admins`;

function createUser(obj) {
  console.log(obj);
  return axios.post(CREATE_USER_URL, { ...obj });
}
function getUser(userId) {
  return axios.get(`${GET_USER_URL}/${userId}`);
}
function getAllUsers() {
  return axios.get(GET_ALL_USERS_URL);
}
function getAllAdmin() {
  return axios.get(GET_ALL_ADMINS_URL);
}

module.exports = {
  createUser: createUser,
  getUser: getUser,
  getAllUsers: getAllUsers,
  getAllAdmin: getAllAdmin,
};
