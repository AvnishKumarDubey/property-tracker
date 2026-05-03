import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Transactions = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "income",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
    if (selectedProperty) fetchTransactions();
  }, [selectedProperty]);

  const fetchProperties = async () => {
    const res = await api.get("/properties");
    setProperties(res.data);
  };

  const fetchTransactions = async () => {
    const res = await api.get(`/transactions?propertyId=${selectedProperty}`);
    setTransactions(res.data);
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.post("/transactions", {
      ...form,
      propertyId: selectedProperty,
    });
    setForm({ type: "income", amount: "", description: "" });
    fetchTransactions();
    setLoading(false);
  };

  const deleteTransaction = async (id) => {
    if (user.role !== "admin") return;
    if (!window.confirm("Delete this transaction?")) return;
    await api.delete(`/transactions/${id}`);
    fetchTransactions();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Transactions</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="w-full md:w-64 p-3 border border-gray-300 rounded-xl mb-4"
        >
          <option value="">Select Property</option>
          {properties.map((prop) => (
            <option key={prop._id} value={prop._id}>
              {prop.name}
            </option>
          ))}
        </select>

        {selectedProperty && (
          <form
            onSubmit={addTransaction}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="p-3 border border-gray-300 rounded-xl"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount"
              className="p-3 border border-gray-300 rounded-xl"
              required
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              className="p-3 border border-gray-300 rounded-xl"
              required
            />
            <button
              type="submit"
              disabled={loading || !selectedProperty}
              className="bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 md:col-span-3"
            >
              {loading ? "Adding..." : "Add Transaction"}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Date</th>
              {user.role === "admin" && (
                <th className="p-4 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      t.type === "income"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t.type.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 font-semibold">₹{t.amount}</td>
                <td className="p-4">{t.description}</td>
                <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>
                {user.role === "admin" && (
                  <td className="p-4">
                    <button
                      onClick={() => deleteTransaction(t._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
