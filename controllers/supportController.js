const db = require("../config/db");

const getUserSupportTickets = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, subject, message, status, created_at
    FROM support_tickets
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, tickets) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      total: tickets.length,
      tickets
    });
  });
};



// CREATE support ticket (USER)
const createSupportTicket = (req, res) => {
  const userId = req.user.id;
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ message: "Subject and message are required" });
  }

  const sql = `
    INSERT INTO support_tickets (user_id, subject, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [userId, subject, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket_id: result.insertId
    });
  });
};

// GET all support tickets (ADMIN)
const getAllSupportTickets = (req, res) => {
  const sql = `
    SELECT 
      st.id,
      st.subject,
      st.message,
      st.status,
      st.created_at,
      u.id AS user_id,
      u.name,
      u.email
    FROM support_tickets st
    JOIN users u ON st.user_id = u.id
    ORDER BY st.created_at DESC
  `;

  db.query(sql, (err, tickets) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      total: tickets.length,
      tickets
    });
  });
};

// UPDATE support ticket status (ADMIN)
const updateTicketStatus = (req, res) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  // allowed statuses
  const allowedStatus = ["open", "in_progress", "closed"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const sql = `
    UPDATE support_tickets
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, ticketId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({
      message: "Ticket status updated successfully",
      ticketId,
      status
    });
  });
};



module.exports = { getUserSupportTickets,
    createSupportTicket,
    getAllSupportTickets,
    updateTicketStatus
 };
