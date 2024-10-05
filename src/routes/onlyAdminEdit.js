const express = require("express");
const router = express.Router();

const OnlyAdminEditController = require("../app/controllers/OnlyAdminEditController");

router.post("/create", OnlyAdminEditController.create);
router.post("/update/:id", OnlyAdminEditController.update);
router.post("/find", OnlyAdminEditController.find);

module.exports = router;
