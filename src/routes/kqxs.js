const express = require("express");
const router = express.Router();

const kqxsController = require("../app/controllers/KqxsController");

router.post("/create", kqxsController.create);
router.post("/findKqxsByDate", kqxsController.findKqxsByDate);

module.exports = router;
