const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = { userId: req.userId };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, paymentMethod, description, date } = req.body;

    const expense = new Expense({
      userId: req.userId,
      amount,
      category,
      paymentMethod,
      description,
      date: date || new Date()
    });

    await expense.save();
    res.status(201).json({ message: 'Expense added', expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, category, paymentMethod, description, date } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { amount, category, paymentMethod, description, date },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated', expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // Current month expenses by category
    const currentMonthByCategory = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: currentMonthStart }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Last month expenses by category
    const lastMonthByCategory = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Total this month
    const totalThisMonth = currentMonthByCategory.reduce((acc, cat) => acc + cat.total, 0);
    const totalLastMonth = lastMonthByCategory.reduce((acc, cat) => acc + cat.total, 0);

    // Generate insights
    const insights = [];

    if (totalLastMonth > 0) {
      const percentChange = ((totalThisMonth - totalLastMonth) / totalLastMonth * 100).toFixed(1);
      if (percentChange > 0) {
        insights.push(`You spent ${percentChange}% more this month compared to last month`);
      } else if (percentChange < 0) {
        insights.push(`You saved ${Math.abs(percentChange)}% this month compared to last month`);
      }
    }

    // Category insights
    currentMonthByCategory.forEach(current => {
      const last = lastMonthByCategory.find(l => l._id === current._id);
      if (last && last.total > 0) {
        const change = ((current.total - last.total) / last.total * 100).toFixed(1);
        if (change > 20) {
          insights.push(`You spent ${change}% more on ${current._id} this month`);
        }
      }
    });

    // Daily average
    const daysInMonth = now.getDate();
    const dailyAverage = (totalThisMonth / daysInMonth).toFixed(2);

    res.json({
      currentMonth: {
        total: totalThisMonth,
        byCategory: currentMonthByCategory,
        dailyAverage
      },
      lastMonth: {
        total: totalLastMonth,
        byCategory: lastMonthByCategory
      },
      insights
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get expenses by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.userId,
      category: req.params.category
    }).sort({ date: -1 });

    const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    res.json({ category: req.params.category, total, expenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Sync offline expenses (bulk add)
router.post('/sync', auth, async (req, res) => {
  try {
    const { expenses } = req.body;

    const expensesToAdd = expenses.map(exp => ({
      ...exp,
      userId: req.userId
    }));

    const result = await Expense.insertMany(expensesToAdd);
    res.json({ message: 'Expenses synced', count: result.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
