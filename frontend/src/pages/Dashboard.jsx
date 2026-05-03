import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState("");
  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState({
    income: {},
    expenses: {},
    chartData: [],
  });
  const [loading, setLoading] = useState(false);

  // Fetch properties once on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get("/properties");
        setProperties(res.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, []);

  // Fetch analytics when property changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = selectedProperty
          ? `/transactions/dashboard/${selectedProperty}`
          : "/transactions/dashboard";
        const res = await api.get(url);
        setAnalytics(res.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedProperty]);

  const downloadPDF = async () => {
    if (user?.role !== "admin") {
      alert("Admin access required for PDF download");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = `${api.defaults.baseURL}/transactions/report/${selectedProperty}`;
      link.setAttribute("download", `report-${selectedProperty || "all"}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        {user?.role === "admin" && (
          <button
            onClick={downloadPDF}
            disabled={!selectedProperty || loading}
            className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            Download PDF Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Income
          </h3>
          <p className="text-3xl font-bold text-green-600">
            ₹{(analytics.income?.total || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {analytics.income?.count || 0} transactions
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Expenses
          </h3>
          <p className="text-3xl font-bold text-red-600">
            ₹{(analytics.expenses?.total || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {analytics.expenses?.count || 0} transactions
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Net Balance
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            ₹
            {(
              (analytics.income?.total || 0) - (analytics.expenses?.total || 0)
            ).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl lg:col-span-1">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Properties</option>
            {properties.map((prop) => (
              <option key={prop._id} value={prop._id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-6">
            Income vs Expenses (Daily)
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#00C49F"
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#FFBB28"
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-6">
            Income/Expense Distribution
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={[
                  { name: "Income", value: analytics.income?.total || 0 },
                  { name: "Expenses", value: analytics.expenses?.total || 0 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill="#00C49F" />
                <Cell fill="#FFBB28" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
