const PDFDocument = require('pdfkit');
const Expense = require('../models/expenseModel');

const lastNDates = (n) => {
  const today = new Date();
  return [...Array(n)].map((_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - idx));
    const key = d.toISOString().split('T')[0];
    return { key, label: d.toLocaleDateString('en-IN', { weekday: 'short' }) };
  });
};

const computeStats = (expenses) => {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const count = expenses.length;
  const avg = count ? total / count : 0;
  const highest = expenses.reduce((max, e) => Math.max(max, Number(e.amount || 0)), 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
    return acc;
  }, {});

  const now = new Date();
  const months = [...Array(6)].map((_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short' }),
      total: 0,
    };
  });

  // Monthly buckets (6 months)
  expenses.forEach((e) => {
    const date = e.date ? new Date(e.date) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.total += Number(e.amount || 0);
  });

  // Weekly buckets (last 7 days)
  const days = lastNDates(7).map((d) => ({ ...d, total: 0 }));
  expenses.forEach((e) => {
    const dateKey = e.date ? String(e.date).split('T')[0] : null;
    if (!dateKey) return;
    const bucket = days.find((d) => d.key === dateKey);
    if (bucket) bucket.total += Number(e.amount || 0);
  });

  // Top expenses
  const topExpenses = [...expenses]
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5);

  return { total, count, avg, highest, categoryTotals, months, days, topExpenses };
};

const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

const drawBarChart = (doc, data, options = {}) => {
  const {
    x,
    y = doc.y,
    width,
    barHeight = 14,
    gap = 6,
    labelWidth = 100,
    color = '#6366F1',
  } = options;

  const maxVal = Math.max(...data.map((d) => d.value || 0), 1);
  let cursorY = y;

  data.forEach((d) => {
    const barWidth = Math.max(4, (d.value / maxVal) * (width - labelWidth));
    doc
      .fillColor('#111')
      .fontSize(10)
      .text(d.label, x, cursorY + 1, { width: labelWidth, ellipsis: true });
    doc
      .rect(x + labelWidth + 8, cursorY, barWidth, barHeight)
      .fillColor(color)
      .fill();
    doc
      .fillColor('#374151')
      .fontSize(9)
      .text(formatAmount(d.value), x + labelWidth + 12 + barWidth, cursorY + 1, {
        width: 80,
      });
    cursorY += barHeight + gap;
  });
  doc.moveDown();
  return cursorY;
};

const drawSparkline = (doc, data, options = {}) => {
  const { x, y = doc.y + 10, width, height = 80, color = '#6366F1' } = options;
  const values = data.map((d) => d.value || 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = Math.max(maxVal - minVal, 1);
  const step = width / Math.max(data.length - 1, 1);

  // Axes
  doc
    .moveTo(x, y)
    .lineTo(x, y + height)
    .lineTo(x + width, y + height)
    .strokeColor('#e5e7eb')
    .stroke();

  // Line
  data.forEach((point, idx) => {
    const px = x + idx * step;
    const py = y + height - ((point.value - minVal) / range) * height;
    if (idx === 0) {
      doc.moveTo(px, py);
    } else {
      doc.lineTo(px, py);
    }
  });
  doc.strokeColor(color).lineWidth(2).stroke();

  // Points
  data.forEach((point, idx) => {
    const px = x + idx * step;
    const py = y + height - ((point.value - minVal) / range) * height;
    doc.circle(px, py, 2.5).fillColor(color).fill();
  });

  // Labels (bottom)
  doc.fontSize(9).fillColor('#374151');
  data.forEach((point, idx) => {
    const px = x + idx * step;
    doc.text(point.label, px - 10, y + height + 6, { width: 20, align: 'center' });
  });

  doc.moveDown();
};

// GET /api/reports/pdf
exports.generatePdf = async (req, res) => {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `expenses-report-${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
  const stats = computeStats(expenses);
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.fontSize(20).text('Expense Tracker Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { width: contentWidth });
  doc.text(`Total expenses: ${stats.count}`, { width: contentWidth });
  doc.text(`Total spent: ${formatAmount(stats.total)}`, { width: contentWidth });
  doc.text(`Average spend: ${formatAmount(stats.avg)}`, { width: contentWidth });
  doc.text(`Highest spend: ${formatAmount(stats.highest)}`, { width: contentWidth });

  // Category chart
  doc.moveDown().fontSize(14).text('By Category', { width: contentWidth });
  const categoryData = Object.entries(stats.categoryTotals).map(([cat, val]) => ({
    label: cat,
    value: val,
  }));
  if (categoryData.length) {
    drawBarChart(doc, categoryData, {
      color: '#8B5CF6',
      labelWidth: 120,
      width: contentWidth,
      x: doc.page.margins.left,
    });
  } else {
    doc.fontSize(11).text('No category data yet.', { width: contentWidth });
  }

  // Monthly chart
  doc.moveDown().fontSize(14).text('Monthly Spend (last 6 months)', { width: contentWidth });
  const monthData = stats.months.map((m) => ({ label: m.label, value: m.total }));
  drawBarChart(doc, monthData, {
    color: '#10B981',
    labelWidth: 70,
    width: contentWidth,
    x: doc.page.margins.left,
  });

  // Weekly sparkline
  doc.moveDown().fontSize(14).text('Weekly Spend (last 7 days)', { width: contentWidth });
  const weekData = stats.days.map((d) => ({ label: d.label, value: d.total }));
  drawSparkline(doc, weekData, {
    color: '#6366F1',
    width: contentWidth,
    x: doc.page.margins.left,
  });

  // Recent expenses table
  doc.moveDown().fontSize(14).text('Recent Expenses', {
    width: contentWidth,
    align: 'center',
  });
  expenses.slice(0, 20).forEach((e) => {
    doc
      .fontSize(11)
      .text(
        `${e.date || 'N/A'} | ${e.category || 'Other'} | ${e.description || 'Expense'} | ${formatAmount(e.amount)}`,
        { width: contentWidth, align: 'center' }
      );
  });

  // Top expenses table
  doc.moveDown().fontSize(14).text('Top 5 Expenses', {
    width: contentWidth,
    align: 'center',
  });
  if (!stats.topExpenses.length) {
    doc.fontSize(11).text('No expenses yet.', { width: contentWidth, align: 'center' });
  } else {
    stats.topExpenses.forEach((e, idx) => {
      doc
        .fontSize(11)
        .text(
          `${idx + 1}. ${e.description || 'Expense'} — ${e.date || 'N/A'} — ${e.category || 'Other'} — ${formatAmount(e.amount)}`,
          { width: contentWidth, align: 'center' }
        );
    });
  }

  doc.end();
};
