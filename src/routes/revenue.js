const express = require("express");
const router = express.Router();

const RevenueController = require("../app/controllers/RevenueController");

router.post("/create", RevenueController.create);
router.post("/delete", RevenueController.delete);
router.post("/update/:id", RevenueController.update);
router.post(
    "/findRevenueByDateAndIdMember",
    RevenueController.findRevenueByDateAndIdMember
);
router.post("/findRevenueBy", RevenueController.findRevenueBy);

module.exports = router;
