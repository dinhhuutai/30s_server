const express = require("express");
const router = express.Router();

const kqxsController = require("../app/controllers/KqxsController");

router.post("/create", kqxsController.create);
router.post("/find", kqxsController.find);
router.post("/findKqxsByDate", kqxsController.findKqxsByDate);
router.post(
    "/findKqxsByDateAndProvince",
    kqxsController.findKqxsByDateAndProvince
);

module.exports = router;
