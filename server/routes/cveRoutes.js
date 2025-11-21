// server/routes/cveRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/cveController");

router.get("/list", controller.getList);
router.get("/:id", controller.getById);

module.exports = router;
