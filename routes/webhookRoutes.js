const express = require("express");
const router = express.Router();
const { paymentWebhook, githubWebhook } = require("../controllers/webhookController");

router.post("/payment", paymentWebhook);
router.post("/github", githubWebhook);

module.exports = router;
