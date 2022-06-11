const express = require("express");
const payCon = require("../controllers/pay");
const isAuth = require("../middleware/isAuth");
const router = express.Router();

router.post("/user", isAuth, payCon.payUser);
router.get("/success", payCon.successPay);
router.get("/fail", payCon.failPay);
router.get("/suc", payCon.sucPay);
router.get("/fl", payCon.failPpay);
module.exports = router;
