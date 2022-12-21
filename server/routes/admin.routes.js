const Router = require("express");
const adminController = require("../controller/admin.controller");
const router = new Router();

router.post("/admin", adminController.createAdmin);
router.get("/admins", adminController.getAllAdmin);
router.delete("/admin/:id", adminController.deleteAdmin);

module.exports = router;
