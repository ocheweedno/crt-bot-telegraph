const db = require("../db");

class UserController {
  async createUser(req, res) {
    const { name, age, city, userId } = req.body;
    const now = new Date();
    const newUser = await db.query(
      "INSERT INTO users(user_id, name,age,city,create_date) values ($1, $2, $3, $4, $5) RETURNING *",
      [userId, name, age, city, now]
    );
    res.status(200).json(newUser.rows[0]);
  }

  async getAllUsers(req, res) {
    const users = await db.query("SELECT * FROM users");
    res.json(users.rows);
  }

  async getUser(req, res) {
    const id = req.params.id;
    const user = await db.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (user.rows[0]) {
      res.status(201).json(user.rows[0]);
    } else {
      res.status(200).json(user.rows[0]);
    }
  }

  async updateUser(req, res) {
    const { name, age, city, userId } = req.body;
    const user = await db.query("UPDATE users set name");
  }

  async deleteUser(req, res) {
    const id = req.params.id;
    const user = await db.query("DELETE FROM users WHERE user_id = $1", [id]);
    res.json(`delete user ${id} success`);
  }
}

module.exports = new UserController();
