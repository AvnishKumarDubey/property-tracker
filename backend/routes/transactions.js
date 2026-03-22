const express = require("express");
const Transaction = require("../models/Transaction");
const Property = require("../models/Property");
const PDFDocument = require("pdfkit");
const { auth, adminAuth } = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { propertyId } = req.query;
  const query = propertyId ? { propertyId } : {};
  const transactions = await Transaction.find(query)
    .populate("propertyId", "name address")
    .sort({ date: -1 });
  res.json(transactions);
});

router.post("/", auth, async (req, res) => {
  const { propertyId, type, amount, description } = req.body;
  const transaction = new Transaction({
    propertyId,
    type,
    amount,
    description,
  });
  await transaction.save();
  await transaction.populate("propertyId");
  res.status(201).json(transaction);
});

router.delete("/:id", auth, adminAuth, async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: "Transaction deleted" });
});

// Dashboard analytics
router.get("/dashboard/:propertyId?", auth, async (req, res) => {
  const { propertyId } = req.params;
  const query = propertyId ? { propertyId } : {};

  const [income, expenses] = await Promise.all([
    Transaction.aggregate([
      { $match: query },
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: query },
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  const chartData = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    income: income[0] || { total: 0, count: 0 },
    expenses: expenses[0] || { total: 0, count: 0 },
    chartData: chartData.map((d) => ({
      date: d._id,
      income: d.income,
      expense: d.expense,
    })),
  });
});

// PDF Report
router.get("/report/:propertyId?", auth, adminAuth, (req, res) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
  doc.pipe(res);

  doc.fontSize(20).text("Property Income/Expense Report", 50, 50);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);

  doc.end();
});

module.exports = router;
