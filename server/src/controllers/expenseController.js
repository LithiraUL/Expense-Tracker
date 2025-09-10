import mongoose from "mongoose";
import Expense from "../models/Expense.js";

// 📊 Get daily totals for the current user
export const dailyTotals = async (req, res) => {
  try {
    const { month } = req.query; // optional: YYYY-MM
    const match = { user: new mongoose.Types.ObjectId(req.user.id) };

    if (month) {
      const [y, m] = month.split("-");
      const start = new Date(Number(y), Number(m) - 1, 1);
      const end = new Date(Number(y), Number(m), 1);
      match.date = { $gte: start, $lt: end };
    }

    // Debugging
    console.log("Aggregation match stage:", match);

    const stats = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = stats.map((s) => ({ date: s._id, total: s.total }));
    res.json(result);
  } catch (e) {
    console.error("Error in dailyTotals:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// 📋 List expenses
export const listExpenses = async (req, res) => {
  try {
    const { from, to, category, q } = req.query;
    const filter = { user: req.user.id };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (category) filter.category = category;
    if (q) filter.note = { $regex: q, $options: "i" };

    const items = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

// ➕ Create expense
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    const item = await Expense.create({
      user: req.user.id,
      title,
      amount,
      category,
      date,
      note,
    });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Invalid data" });
  }
};

// ✏️ Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, note } = req.body;

    const updated = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { title, amount, category, date, note },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Invalid data" });
  }
};

// ❌ Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Invalid id" });
  }
};

// 📊 Monthly stats (by category + total)
export const stats = async (req, res) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    const [y, m] = month?.split("-") ?? [];

    const start = month
      ? new Date(Number(y), Number(m) - 1, 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const match = {
      user: new mongoose.Types.ObjectId(req.user.id),
      date: { $gte: start, $lt: end },
    };

    const data = await Expense.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const sum = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      byCategory: data,
      total: sum[0]?.total || 0,
      month: start.toISOString().slice(0, 7),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};
