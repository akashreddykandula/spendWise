import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Calendar,
  X,
  Trash2,
  Edit3,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Loader2,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import api from "../../api/axios";

const defaultForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  paymentMode: "Cash",
  date: "",
  receipt: null,
};

const categories = ["Food", "Shopping", "Bills", "Travel", "Salary", "Other"];
const payments = ["Cash", "UPI", "Card"];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 🔗 Fetch transactions (LOGIC UNTOUCHED)
  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.transactions || [];
      setTransactions(list);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 📝 Handle form change (LOGIC UNTOUCHED)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  // ➕ Open add modal (LOGIC UNTOUCHED)
  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setOpen(true);
  };

  // ✏️ Open edit modal (LOGIC UNTOUCHED)
  const openEdit = (tx) => {
    setEditing(tx);
    setForm({
      title: tx.title ?? "",
      amount: tx.amount ?? "",
      type: tx.type ?? "expense",
      category: tx.category ?? "Food",
      paymentMode: tx.paymentMode ?? "Cash",
      date: tx.date ? tx.date.slice(0, 10) : "",
      receipt: null,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(defaultForm);
  };

  // 💾 Save / Update (LOGIC UNTOUCHED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== "") fd.append(k, v);
      });

      if (editing) {
        await api.put(`/transactions/${editing._id}`, fd);
        toast.success("Transaction updated ✨");
      } else {
        await api.post("/transactions", fd);
        toast.success("Transaction added 🎉");
      }

      closeModal();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  // ❌ Delete (LOGIC UNTOUCHED)
  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
      toast.success("Transaction deleted 🗑️");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setConfirmId(null);
    }
  };

  // Filter calculations (LOGIC UNTOUCHED)
  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch = tx.title?.toLowerCase().includes(search.toLowerCase());

    const txDate = new Date(tx.date);
    const fromOk = fromDate ? txDate >= new Date(fromDate) : true;
    const toOk = toDate ? txDate <= new Date(toDate) : true;

    return matchSearch && fromOk && toOk;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Transactions
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your daily cash inflows and expenses
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search Input */}
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Search Description
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* From Date */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            From Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            To Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Clear Button */}
        <div className="md:col-span-1">
          <button
            onClick={() => {
              setSearch("");
              setFromDate("");
              setToDate("");
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition text-sm font-medium flex items-center justify-center gap-1"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
            <span className="md:hidden">Clear</span>
          </button>
        </div>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm font-medium">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No transactions found</p>
          <p className="text-slate-500 text-xs mt-1">
            Try adjusting your filters or add a new record.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx._id}
              className="bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                    tx.type === "income"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-white text-base truncate">
                    {tx.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/50 font-medium">
                      {tx.category}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">{tx.paymentMode}</span>
                    <span>•</span>
                    <span>{tx.date?.slice(0, 10)}</span>
                  </div>
                  {tx.receipt && (
                    <div className="pt-1">
                      <a
                        href={tx.receipt}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium underline underline-offset-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Attached Receipt</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0 shrink-0">
                <p
                  className={`font-black text-lg sm:text-xl ${
                    tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}₹
                  {Number(tx.amount).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => openEdit(tx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                    title="Edit transaction"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmId(tx._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ➕ / ✏️ Form Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">
                  {editing ? "Edit Transaction" : "Add Transaction"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <input
                    name="title"
                    value={form.title || ""}
                    onChange={handleChange}
                    placeholder="e.g. Grocery shopping, Salary"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    name="amount"
                    type="number"
                    value={form.amount || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                {/* Type Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 gap-1">
                    {["expense", "income"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`py-2 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                          form.type === t
                            ? t === "expense"
                              ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                              : "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {t === "expense" ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        )}
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Payment Mode Dropdowns */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category || "Food"}
                      onChange={handleChange}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      {categories.map((c) => (
                        <option
                          key={c}
                          value={c}
                          className="bg-slate-900 text-white"
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Payment Mode
                    </label>
                    <select
                      name="paymentMode"
                      value={form.paymentMode || "Cash"}
                      onChange={handleChange}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      {payments.map((p) => (
                        <option
                          key={p}
                          value={p}
                          className="bg-slate-900 text-white"
                        >
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={form.date || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                    required
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Receipt (Optional)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-dashed border-slate-700/80 hover:border-purple-500/50 cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span>
                      {form.receipt
                        ? form.receipt.name
                        : "Choose receipt image"}
                    </span>
                    <input
                      type="file"
                      name="receipt"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition"
                  >
                    {editing ? "Update Transaction" : "Save Transaction"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❗ Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmId && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Delete Transaction?
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                This action cannot be undone. Are you sure you want to proceed?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/20 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
