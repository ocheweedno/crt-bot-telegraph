const Router = require("express");
const userController = require("../controller/user.controller");
const router = new Router();

router.post("/user", userController.createUser);
router.get("/users", userController.getAllUsers);
router.get("/user/:id", userController.getUser);
router.delete("/user/:id", userController.deleteUser);

module.exports = router;
