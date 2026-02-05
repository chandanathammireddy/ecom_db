const Contact = require("../models/Contact");

// Submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const result = await Contact.create({ name, email, subject, message });
    res.status(201).json({
      message: "Contact form submitted successfully",
      contact_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
