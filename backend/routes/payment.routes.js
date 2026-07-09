const express = require("express");
const router = express.Router();
const {
  getPayHereParams,
  handlePayHereNotification,
} = require("../controllers/payment.controller");

const { authenticate } = require("../middleware/auth.middleware");

router.post("/checkout-params", authenticate, getPayHereParams);
router.post("/notify", handlePayHereNotification);

module.exports = router;
