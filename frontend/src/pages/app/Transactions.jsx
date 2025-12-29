import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
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
 const [confirmId, setConfirmId] = useState (null);
 const [search, setSearch] = useState ('');
const [fromDate, setFromDate] = useState ('');
const [toDate, setToDate] = useState ('');





  // 🔗 Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      // console.log ('Transactions from API:', res.data); // 👈 add this
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
    setForm({ ...form, [name]: files ? files[0] : value });
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

  // ❌ Delete
const handleDelete = async id => {
  try {
    await api.delete (`/transactions/${id}`);
    setTransactions (prev => prev.filter (tx => tx._id !== id));
    toast.success ('Transaction deleted 🗑️');
  } catch (err) {
    toast.error ('Delete failed');
  } finally {
    setConfirmId (null);
  }
};

const filteredTransactions = transactions.filter((tx) => {
  const matchSearch = tx.title
    ?.toLowerCase()
    .includes(search.toLowerCase());

  const txDate = new Date(tx.date);
  const fromOk = fromDate ? txDate >= new Date(fromDate) : true;
  const toOk = toDate ? txDate <= new Date(toDate) : true;

  return matchSearch && fromOk && toOk;
});



  return (
    
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-gray-400 text-sm">
            Manage your income & expenses
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 rounded-xl font-semibold shadow"
        >
          ➕ Add Transaction
        </button>
      </div>
      {
  /* 🔍 Search & Filters */
}
<div className="flex flex-col md:flex-row gap-3 md:items-end bg-white/5 border border-white/10 rounded-2xl p-4">
  {/* Search */}
  <div className="flex-1">
    <label className="text-xs text-gray-400">Search</label>
    <input
      type="text"
      value={search}
      onChange={e => setSearch (e.target.value)}
      placeholder="Search by title..."
      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-pink-500"
    />
  </div>

  {/* From */}
  <div>
    <label className="text-xs text-gray-400">From</label>
    <input
      type="date"
      value={fromDate}
      onChange={e => setFromDate (e.target.value)}
      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-pink-500"
    />
  </div>

  {/* To */}
  <div>
    <label className="text-xs text-gray-400">To</label>
    <input
      type="date"
      value={toDate}
      onChange={e => setToDate (e.target.value)}
      className="w-full mt-1 px-4 py-2 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-pink-500"
    />
  </div>

  {/* Clear */}
  <button
    onClick={() => {
      setSearch ('');
      setFromDate ('');
      setToDate ('');
    }}
    className="mt-2 md:mt-0 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
  >
    Clear
  </button>
</div>


      {/* List */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-400">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx._id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/10 transition"
            >
              <div>
                <p className="font-semibold">{tx.title}</p>
                <p className="text-xs text-gray-400">
                  {tx.category} • {tx.paymentMode} •{" "}
                  {tx.date?.slice(0, 10)}
                </p>
                {tx.receipt && (
                  <a
                    href={tx.receipt}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 underline"
                  >
                    View receipt
                  </a>
                )}
              </div>
              <div className="text-right space-y-1">
                <p
                  className={`font-bold ${
                    tx.type === "income"
                      ? "text-emerald-400"
                      : "text-pink-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}₹{tx.amount}
                </p>
                <div className="text-xs space-x-3">
                  <button
                    onClick={() => openEdit(tx)}
                    className="text-indigo-400 hover:underline"
                  >
                    Edit
                  </button>
     <button
  onClick={() => setConfirmId (tx._id)}
  className="text-red-400 hover:text-red-300 text-sm"
>
  Delete
</button>


                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ➕ / ✏️ Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="w-full sm:max-w-md bg-[#120a1f] rounded-t-3xl sm:rounded-3xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-bold mb-4">
                {editing ? "Edit" : "Add"} Transaction
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
  name="title"
  value={form.title || ''}
  onChange={handleChange}
  placeholder="Description"
  className="w-full px-4 py-3 rounded-xl bg-white/10 outline-none"
  required
/>


               <input
  name="amount"
  type="number"
  value={form.amount || ''}
  onChange={handleChange}
  placeholder="Amount"
  className="w-full px-4 py-3 rounded-xl bg-white/10 outline-none"
  required
/>

                {/* Type */}
                <div className="flex bg-white/10 rounded-xl p-1">
                  {["expense", "income"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 rounded-lg font-semibold transition ${
                        form.type === t
                          ? t === "expense"
                            ? "bg-pink-500"
                            : "bg-emerald-500"
                          : "text-gray-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <select
  name="category"
  value={form.category || "Food"}
  onChange={handleChange}
  className="w-full px-4 py-3 rounded-xl bg-[#1b1230]"
>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <select
  name="paymentMode"
  value={form.paymentMode || "Cash"}
  onChange={handleChange}
  className="w-full px-4 py-3 rounded-xl bg-[#1b1230]"
>

                  {payments.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>

                <input
  name="date"
  type="date"
  value={form.date || ''}
  onChange={handleChange}
  className="w-full px-4 py-3 rounded-xl bg-white/10"
  required
/>


                <input
                  type="file"
                  name="receipt"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-400"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold shadow-lg"
                  >
                    {editing ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {
  /* ❗ Delete Confirmation Modal */
}
<AnimatePresence>
  {confirmId &&
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      onClick={() => setConfirmId (null)}
    >
      <motion.div
        onClick={e => e.stopPropagation ()}
        initial={{scale: 0.9, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        exit={{scale: 0.9, opacity: 0}}
        className="bg-[#120a1f] border border-white/10 rounded-2xl p-6 w-[90%] max-w-sm text-center"
      >
        <h3 className="text-lg font-bold text-white mb-2">
          Delete Transaction?
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setConfirmId (null)}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete (confirmId)}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 font-semibold"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>}
</AnimatePresence>

    </div>
  );
};

export default Transactions;
