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
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Receipt,
  Sparkles,
  CreditCard,
  Tag,
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

  // 🔗 Fetch transactions
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

  // 📝 Handle form change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  // ➕ Open add modal
  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setOpen(true);
  };

  // ✏️ Open edit modal
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

  // ❌ Close modal
  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(defaultForm);
  };

  // 💾 Save / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== "") {
          fd.append(k, v);
        }
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

  // ❌ Delete
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

  // 🔍 Filters
  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch = tx.title?.toLowerCase().includes(search.toLowerCase());

    const txDate = new Date(tx.date);

    const fromOk = fromDate ? txDate >= new Date(fromDate) : true;

    const toOk = toDate ? txDate <= new Date(toDate) : true;

    return matchSearch && fromOk && toOk;
  });

  // 📊 Metrics
  const totalInflow = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-28 sm:pb-12 space-y-5 sm:space-y-8 text-slate-100 font-sans overflow-x-hidden">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative w-full min-w-0">
        {/* Ambient background */}
        <div className="absolute -top-12 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="absolute top-1/2 right-1/4 w-64 sm:w-80 h-64 sm:h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
          {/* Heading */}
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold max-w-full">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />

              <span className="truncate">Real-time Ledger</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent break-words">
              Transactions History
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Review, filter, and track all inbound and outbound cash flows.
            </p>
          </div>

          {/* Add button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-3.5 rounded-2xl font-semibold shadow-xl shadow-purple-600/25 border border-white/20 transition flex items-center justify-center gap-2.5 cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />

            <span>New Transaction</span>
          </motion.button>
        </div>
      </div>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {/* Filtered Volume */}
        <div className="min-w-0 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Filtered Volume
            </p>

            <p className="text-xl sm:text-2xl font-black text-white mt-1 truncate">
              {filteredTransactions.length} Items
            </p>
          </div>

          <div className="p-3 shrink-0 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Total Inflow */}
        <div className="min-w-0 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Inflow
            </p>

            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 truncate">
              +${totalInflow.toLocaleString()}
            </p>
          </div>

          <div className="p-3 shrink-0 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outflow */}
        <div className="min-w-0 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Outflow
            </p>

            <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1 truncate">
              -${totalOutflow.toLocaleString()}
            </p>
          </div>

          <div className="p-3 shrink-0 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH & FILTERS
      ===================================================== */}

      <div className="w-full min-w-0 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-5 items-end">
        {/* Search */}
        <div className="w-full min-w-0 md:col-span-5">
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Search Description
          </label>

          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or merchant..."
              className="w-full min-w-0 pl-11 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* From Date */}
        <div className="w-full min-w-0 md:col-span-3">
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
          />
        </div>

        {/* To Date */}
        <div className="w-full min-w-0 md:col-span-3">
          <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
          />
        </div>

        {/* Clear */}
        <div className="w-full min-w-0 md:col-span-1">
          <button
            onClick={() => {
              setSearch("");
              setFromDate("");
              setToDate("");
            }}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            title="Clear filters"
          >
            <X className="w-4 h-4 shrink-0" />

            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          LIST
      ===================================================== */}

      {loading ? (
        <div className="w-full py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />

          <p className="text-sm font-medium text-center">
            Loading ledger transactions...
          </p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="w-full py-16 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 px-4">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />

          <p className="text-slate-300 font-semibold text-base">
            No matching records
          </p>

          <p className="text-slate-500 text-xs mt-1">
            Try adjusting your query parameters or log a new entry.
          </p>
        </div>
      ) : (
        <div className="w-full min-w-0 space-y-3.5">
          {filteredTransactions.map((tx) => (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="group w-full min-w-0 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-purple-500/30 backdrop-blur-xl rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 transition-all shadow-md hover:shadow-xl overflow-hidden"
            >
              {/* Left content */}
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                {/* Transaction icon */}
                <div
                  className={`p-2.5 sm:p-3 rounded-2xl shrink-0 mt-0.5 shadow-inner ${
                    tx.type === "income"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-bold text-white text-sm sm:text-base truncate tracking-tight">
                    {tx.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 bg-slate-800/90 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-700/60 font-medium text-slate-300 max-w-full">
                      <Tag className="w-3 h-3 text-purple-400 shrink-0" />

                      <span className="truncate max-w-[100px] sm:max-w-none">
                        {tx.category}
                      </span>
                    </span>

                    <span className="text-slate-600 hidden xs:inline">•</span>

                    <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                      <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />

                      <span>{tx.paymentMode}</span>
                    </span>

                    <span className="text-slate-600 hidden xs:inline">•</span>

                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 shrink-0" />

                      <span>{tx.date?.slice(0, 10)}</span>
                    </span>
                  </div>

                  {/* Receipt */}
                  {tx.receipt && (
                    <div className="pt-1">
                      <a
                        href={tx.receipt}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium underline underline-offset-4"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />

                        <span className="truncate">View Verified Receipt</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right content */}
              <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0 shrink-0 gap-2">
                <p
                  className={`font-black text-lg sm:text-2xl tracking-tight whitespace-nowrap ${
                    tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}$
                  {Number(tx.amount).toLocaleString()}
                </p>

                <div className="flex items-center gap-2">
                  {/* Edit */}
                  <button
                    onClick={() => openEdit(tx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20 transition-all cursor-pointer"
                    title="Edit transaction"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmId(tx._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
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
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
              }}
              className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                    {editing ? "Edit Transaction" : "New Transaction"}
                  </h3>
                </div>

                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Description / Title
                  </label>

                  <input
                    name="title"
                    value={form.title || ""}
                    onChange={handleChange}
                    placeholder="e.g. Apple Store, Monthly Salary"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Amount (INR)
                  </label>

                  <input
                    name="amount"
                    type="number"
                    value={form.amount || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Type
                  </label>

                  <div className="grid grid-cols-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 gap-1.5">
                    {["expense", "income"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            type: t,
                          })
                        }
                        className={`py-2.5 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

                {/* Category + Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Category
                    </label>

                    <select
                      name="category"
                      value={form.category || "Food"}
                      onChange={handleChange}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
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

                  {/* Payment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Payment Mode
                    </label>

                    <select
                      name="paymentMode"
                      value={form.paymentMode || "Cash"}
                      onChange={handleChange}
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Date
                  </label>

                  <input
                    name="date"
                    type="date"
                    value={form.date || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                    required
                  />
                </div>

                {/* Receipt */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Attachment / Receipt
                  </label>

                  <label className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-slate-800/40 border border-dashed border-slate-700/80 hover:border-purple-500/50 cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors">
                    <Paperclip className="w-4 h-4 text-purple-400 shrink-0" />

                    <span className="truncate max-w-[200px]">
                      {form.receipt
                        ? form.receipt.name
                        : "Upload receipt format (PNG, JPG)"}
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

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition cursor-pointer"
                  >
                    {editing ? "Update Ledger" : "Save Transaction"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      <AnimatePresence>
        {confirmId && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                Delete Record?
              </h3>

              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                This transaction will be permanently removed from your history
                ledger.
              </p>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setConfirmId(null)}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDelete(confirmId)}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/25 transition cursor-pointer"
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
