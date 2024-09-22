const express = require("express");
const router = express.Router();

const SmsDetailController = require("../app/controllers/SmsDetailController");

router.post("/create", SmsDetailController.create);
router.post("/update/:id", SmsDetailController.update);
router.post("/delete/:idSms", SmsDetailController.delete);
router.post("/findSmsDetailByIdSms/:idSms", SmsDetailController.findSmsDetailByIdSms);


module.exports = router;
