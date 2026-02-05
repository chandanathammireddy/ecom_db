const db = require("../config/db");

const Contact = {
    create: async (data) => {
        const { name, email, subject, message } = data;
        const query = `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `;
        const [result] = await db.query(query, [name, email, subject, message]);
        return result;
    }
};

module.exports = Contact;
