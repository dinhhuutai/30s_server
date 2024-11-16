const express = require("express");
const router = express.Router();

const SmsDetailController = require("../app/controllers/SmsDetailController");

router.post("/create", SmsDetailController.create);
router.post("/update/:id", SmsDetailController.update);
router.post("/delete/:idSms", SmsDetailController.delete);
router.post(
    "/findSmsDetailByIdMemberAndDomainAndDate/:idUser",
    SmsDetailController.findSmsDetailByIdMemberAndDomainAndDate
);
router.post(
    "/findSmsDetailByIdSms/:idSms",
    SmsDetailController.findSmsDetailByIdSms
);
router.post(
    "/findSmsDetailByRevenueWin",
    SmsDetailController.findSmsDetailByRevenueWin
);

module.exports = router;
