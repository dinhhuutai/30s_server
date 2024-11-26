const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const userController = require("../app/controllers/UserController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/getSingleUser/:id", verifyToken, userController.getSingleUser);
router.post("/refresh", userController.requestRefreshToken);
router.post("/logout", verifyToken, userController.logout);
router.get("/check", verifyToken, userController.checkUser);
router.post("/update/:id", verifyToken, userController.update);
router.post("/changePassword/:id", verifyToken, userController.changePassword);

router.post("/create", userController.create);
router.post("/find", userController.find);
router.post("/autoFindData", userController.autoFindData);

module.exports = router;
