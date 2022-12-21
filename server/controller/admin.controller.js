const db = require("../db");

class AdminController {
  async createAdmin(req, res) {
    const { name, userId } = req.body;
    const newUser = await db.query(
      "INSERT INTO admin(admin_id, name) values ($1, $2) RETURNING *",
      [userId, name]
    );
    res.status(200).json(newUser.rows[0]);
  }

  async getAllAdmin(req, res) {
    const admins = await db.query("SELECT * FROM admin");
    res.json(admins.rows);
  }

  async deleteAdmin(req, res) {
    const id = req.params.id;
    const admin = await db.query("DELETE FROM admin WHERE admin_id = $1", [id]);
    res.json(`delete admin ${id} success`);
  }
}

module.exports = new AdminController();
