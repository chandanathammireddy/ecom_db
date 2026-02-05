const Support = require("../models/Support");

const getUserSupportTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await Support.getByUserId(userId);
    res.json({ total: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE support ticket (USER)
const createSupportTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: "Subject and message are required" });

    const result = await Support.create(userId, subject, message);
    res.status(201).json({ message: "Support ticket created successfully", ticket_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all support tickets (ADMIN)
const getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await Support.getAll();
    res.json({ total: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE support ticket status (ADMIN)
const updateTicketStatus = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;
    const allowedStatus = ["open", "in_progress", "closed"];
    if (!allowedStatus.includes(status)) return res.status(400).json({ message: "Invalid status value" });

    const result = await Support.updateStatus(ticketId, status);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Ticket not found" });
    res.json({ message: "Ticket status updated successfully", ticketId, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUserSupportTickets,
  createSupportTicket,
  getAllSupportTickets,
  updateTicketStatus
};
