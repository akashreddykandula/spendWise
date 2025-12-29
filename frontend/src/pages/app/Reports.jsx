import {useEffect, useState} from 'react';
import api from '../../api/axios';
import {motion} from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#ec4899', '#8b5cf6', '#22c55e', '#f97316', '#06b6d4'];

const StatCard = ({title, value, icon, gradient}) => (
  <div
    className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${gradient}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-white/80">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-bold mt-1">{value}</h3>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const Reports = () => {
  const [transactions, setTransactions] = useState ([]);
  const [from, setFrom] = useState ('');
  const [to, setTo] = useState ('');
  const [loading, setLoading] = useState (true);

  useEffect (() => {
    const fetchTx = async () => {
      try {
        const res = await api.get ('/transactions');
        setTransactions (Array.isArray (res.data) ? res.data : []);
      } catch (err) {
        console.error ('Reports fetch error:', err);
      } finally {
        setLoading (false);
      }
    };
    fetchTx ();
  }, []);

  // 📆 Filter
  const filtered = transactions.filter (tx => {
    const d = new Date (tx.date);
    if (from && d < new Date (from)) return false;
    if (to && d > new Date (to)) return false;
    return true;
  });

  // 🔢 Totals
  const income = filtered
    .filter (t => t.type === 'income')
    .reduce ((s, t) => s + Number (t.amount || 0), 0);

  const expense = filtered
    .filter (t => t.type === 'expense')
    .reduce ((s, t) => s + Number (t.amount || 0), 0);

  const savings = income - expense;

  // 📈 Monthly trend
  const buildLineData = () => {
    const map = {};
    filtered.forEach (t => {
      const d = new Date (t.date);
      const key = d.toLocaleString ('default', {month: 'short'});
      if (!map[key]) map[key] = {name: key, income: 0, expense: 0};
      map[key][t.type] += Number (t.amount || 0);
    });
    return Object.values (map);
  };

  const lineData = buildLineData ();

  // 🥧 Category pie
  const catMap = {};
  filtered.forEach (t => {
    if (t.type === 'expense') {
      catMap[t.category] = (catMap[t.category] || 0) + Number (t.amount || 0);
    }
  });
  const pieData = Object.keys (catMap).map (k => ({name: k, value: catMap[k]}));

  // 📄 Export PDF
  const exportPDF = () => {
    const doc = new jsPDF ();

    // 🎨 Header
    doc.setFontSize (20);
    doc.setTextColor (236, 72, 153); // pink
    doc.text ('SpendWise', 14, 18);

    doc.setFontSize (12);
    doc.setTextColor (100);
    doc.text ('Your Expenses Report', 14, 26);

    doc.setFontSize (10);
    doc.setTextColor (150);
    doc.text (`Generated on: ${new Date ().toLocaleDateString ()}`, 14, 32);

    // 📊 Table
    autoTable (doc, {
      startY: 38,
      head: [['Title', 'Type', 'Category', 'Amount (INR)', 'Date']],
      body: filtered.map (t => [
        t.title,
        t.type,
        t.category,
        `${Number (t.amount).toFixed (2)}`,
        new Date (t.date).toLocaleDateString (),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [139, 92, 246], // purple
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 255],
      },
    });

    // 🔢 Totals at bottom
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize (12);
    doc.setTextColor (0);

    doc.text (`Total Income: ${income.toFixed (2)} INR`, 14, finalY);
    doc.text (`Total Expense: ${expense.toFixed (2)} INR`, 14, finalY + 8);
    doc.text (
      `Savings: ${(income - expense).toFixed (2)} INR`,
      14,
      finalY + 16
    );

    // Footer
    doc.setFontSize (10);
    doc.setTextColor (150);
    doc.text (
      '© SpendWise — Smart Expense Tracker-By Akash Kandula',
      14,
      finalY + 28
    );

    doc.save ('spendwise-report.pdf');
  };

  // 📁 Export CSV
  const exportCSV = () => {
    const headers = ['Title,Type,Category,Amount,Date'];
    const rows = filtered.map (
      t =>
        `${t.title},${t.type},${t.category},${t.amount},${new Date (t.date).toLocaleDateString ()}`
    );
    const csv = [...headers, ...rows].join ('\n');

    const blob = new Blob ([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL (blob);
    const a = document.createElement ('a');
    a.href = url;
    a.download = 'spendwise-report.csv';
    a.click ();
    window.URL.revokeObjectURL (url);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Loading reports...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Reports</h2>
        <p className="text-gray-400 text-sm">Analyze & export your data</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Income"
          value={`₹${income}`}
          icon="📈"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Expense"
          value={`₹${expense}`}
          icon="📉"
          gradient="from-pink-500 to-rose-600"
        />
        <StatCard
          title="Savings"
          value={`₹${savings}`}
          icon="💎"
          gradient="from-indigo-500 to-blue-600"
        />
        <StatCard
          title="Records"
          value={filtered.length}
          icon="🧾"
          gradient="from-purple-500 to-fuchsia-600"
        />
      </div>

      {/* Filters + Export */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={from}
            onChange={e => setFrom (e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/10 text-white outline-none"
          />
          <input
            type="date"
            value={to}
            onChange={e => setTo (e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/10 text-white outline-none"
          />
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{scale: 0.95}}
            onClick={exportPDF}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold"
          >
            📄 PDF
          </motion.button>
          <motion.button
            whileTap={{scale: 0.95}}
            onClick={exportCSV}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold"
          >
            📁 CSV
          </motion.button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Line */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 h-72">
          <h3 className="font-semibold mb-2">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#34d399"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#f472b6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 h-72">
          <h3 className="font-semibold mb-2">Expense by Category</h3>
          {pieData.length === 0
            ? <p className="text-gray-400 text-sm">No expense data</p>
            : <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {pieData.map ((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>}
        </div>
      </div>
    </div>
  );
};

export default Reports;
