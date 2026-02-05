const db = require("../config/db");

const Coupon = {
  findByCode: async (code) => {
    const query = `
      SELECT * FROM coupons
      WHERE code = ? AND is_active = 1
      AND (expires_at IS NULL OR expires_at >= NOW())
    `;
    const [rows] = await db.query(query, [code]);
    return rows;
  },

  getAllAvailable: async () => {
    const query = `
      SELECT id, code, discount_type, discount_value, min_order_value, max_discount, expires_at
      FROM coupons
      WHERE is_active = 1 AND (expires_at IS NULL OR expires_at >= NOW())
      ORDER BY expires_at ASC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM coupons ORDER BY id DESC");
    return rows;
  },

  create: async (data) => {
    const { code, discount_type, discount_value, min_order_value, max_discount, expires_at } = data;
    const query = `
      INSERT INTO coupons 
      (code, discount_type, discount_value, min_order_value, max_discount, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [code, discount_type, discount_value, min_order_value || 0, max_discount || null, expires_at || null]);
    return result;
  },

  update: async (id, data) => {
    const { code, discount_type, discount_value, min_order_value, max_discount, expires_at, is_active } = data;
    const query = `
      UPDATE coupons SET
        code = ?, discount_type = ?, discount_value = ?, min_order_value = ?,
        max_discount = ?, expires_at = ?, is_active = ?
      WHERE id = ?
    `;
    const [result] = await db.query(query, [code, discount_type, discount_value, min_order_value || 0, max_discount || null, expires_at || null, is_active ?? 1, id]);
    return result;
  }
};

module.exports = Coupon;
