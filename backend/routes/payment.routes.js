const express = require("express");
const router = express.Router();
const {
  getPaymentSubmissions,
  getPaymentDetails,
  approvePayment,
  rejectPayment,
  getPaymentStats,
  getPayHereParams,
  handlePayHereNotification,
} = require("../controllers/payment.controller");

const { authenticate, requireRole } = require("../middleware/auth.middleware");

// Admin payment verification routes
router.get("/submissions", authenticate, requireRole('admin'), getPaymentSubmissions);
router.get("/submissions/:id", authenticate, requireRole('admin'), getPaymentDetails);
router.post("/submissions/:id/approve", authenticate, requireRole('admin'), approvePayment);
router.post("/submissions/:id/reject", authenticate, requireRole('admin'), rejectPayment);
router.get("/stats", authenticate, requireRole('admin'), getPaymentStats);

// Payment gateway routes
router.post("/checkout-params", authenticate, getPayHereParams);
router.post("/notify", handlePayHereNotification);

module.exports = router;
