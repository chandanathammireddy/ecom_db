const Address = require("../models/Address");

// GET user's saved addresses
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.getByUserId(userId);
    res.json({ total: addresses.length, addresses });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADD new address
const addNewAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default
    } = req.body;

    if (!full_name || !phone || !address_line1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // If setting default address → unset old default
    if (is_default) {
      await Address.unsetDefault(userId);
    }

    const result = await Address.create({
      userId, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default
    });
    res.status(201).json({ message: "Address added successfully", addressId: result.insertId });
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const rows = await Address.getByIdAndUser(addressId, userId);
    if (rows.length === 0) return res.status(404).json({ message: "Address not found" });

    const { is_default } = req.body;
    if (is_default) {
      await Address.unsetDefault(userId);
    }

    await Address.update(addressId, userId, req.body);
    res.json({ message: "Address updated successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
};

// SET default address
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const rows = await Address.getByIdAndUser(addressId, userId);
    if (rows.length === 0) return res.status(404).json({ message: "Address not found" });

    await Address.unsetDefault(userId);
    await Address.setDefault(addressId, userId);
    res.json({ message: "Default address updated successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getUserAddresses,
  addNewAddress,
  updateAddress,
  setDefaultAddress
};
