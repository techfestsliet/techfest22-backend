const express = require("express");
const adminCon = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
router.get("/tfdetails", isAuth, isAdmin, adminCon.tfdetails);

module.exports = router;
