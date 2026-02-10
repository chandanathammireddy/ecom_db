const db = require("../config/db");
const crypto = require("crypto");
const { exec } = require("child_process");

exports.paymentWebhook = (req, res) => {
  const event = req.body.event;
  const paymentId = req.body.payment_id;
  const orderId = req.body.order_id;

  console.log("Webhook received:", req.body);

  if (event === "payment.success") {
    db.query(
      "UPDATE orders SET status = 'paid' WHERE id = ?",
      [orderId],
      (err) => {
        if (err) return res.status(500).send("DB error");
        console.log("Order marked as PAID");
      }
    );
  }

  res.status(200).json({ received: true });
};

exports.githubWebhook = (req, res) => {
  const secret = process.env.GITHUB_SECRET;
  const signature = req.headers["x-hub-signature-256"];

  if (!secret) {
    console.error("GITHUB_SECRET is not defined in .env");
    return res.status(500).send("Server configuration error");
  }

  if (!signature) {
    return res.status(401).send("No signature found");
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

  if (signature !== digest) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  if (event === "push") {
    console.log("Received GitHub push event. updating...");

    exec("git pull", (err, stdout, stderr) => {
      if (err) {
        console.error("Git pull failed:", err);
        return res.status(500).send("Git pull failed");
      }
      console.log("Git pull output:", stdout);
      if (stderr) console.error("Git pull stderr:", stderr);

      res.status(200).send("Updated successfully");
    });
  } else {
    res.status(200).send("Ignored event");
  }
};
