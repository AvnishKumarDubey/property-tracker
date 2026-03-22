const express = require("express");
const Property = require("../models/Property");
const { auth, adminAuth } = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const properties = await Property.find().sort({ createdAt: -1 });
  res.json(properties);
});

router.post("/", auth, async (req, res) => {
  const { name, address } = req.body;
  const property = new Property({ name, address });
  await property.save();
  res.status(201).json(property);
});

router.delete("/:id", auth, adminAuth, async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.json({ message: "Property deleted" });
});

module.exports = router;
