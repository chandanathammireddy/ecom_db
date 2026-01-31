const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const { getUserAddresses } = require("../controllers/addressController");
const { addNewAddress } = require("../controllers/addressController");
const { updateAddress } = require("../controllers/addressController");
const {setDefaultAddress} = require("../controllers/addressController");

// SET default address
router.patch("/:id/default", auth, setDefaultAddress);

// UPDATE address
router.put("/:id", auth, updateAddress);

// ADD new address
router.post("/", auth, addNewAddress);

// GET saved addresses
router.get("/", auth, getUserAddresses);

module.exports = router;
