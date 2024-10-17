const express = require("express");
const router = express.Router();

const SmsController = require("../app/controllers/SmsController");

router.post("/create", SmsController.create);
router.post("/findSmsById/:id", SmsController.findSmsById);
router.post("/findSmsByNameAndPhone/:idUser", SmsController.findSmsByNameAndPhone);
router.post("/findSmsDeleted/:idUser", SmsController.findSmsDeleted);
router.post("/restoreSmsAll", SmsController.restoreSmsAll);
router.post("/findSmsByStatus", SmsController.findSmsByStatus);
router.post("/findSmsByStatus2", SmsController.findSmsByStatus2);
router.post("/delete", SmsController.delete);
router.post("/update/:id", SmsController.update);
router.post("/findSmsByIdMember", SmsController.findSmsByIdMember);

module.exports = router;
