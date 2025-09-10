import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

export default function Dashboard() {
  const [dailyTotals, setDailyTotals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

  // Fetch daily totals for line graph
  const fetchDailyTotals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expenses/stats/daily", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyTotals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add a new expense
  const addExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/expenses",
        { title, amount, category, date: new Date() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setAmount("");
      setCategory("");
      fetchExpenses();
      fetchDailyTotals();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchDailyTotals();
  }, []);

  const pieData = Object.values(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = acc[exp.category] || { name: exp.category, value: 0 };
      acc[exp.category].value += exp.amount;
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        Expense Dashboard
      </h2>

      {/* Form */}
      <form onSubmit={addExpense} className="max-w-lg mx-auto bg-white p-6 rounded-xl space-y-4 mb-8">
        <div>
          <input
            type="text"
            placeholder="e.g. Lunch, Uber, Groceries"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">What did you spend on? (e.g. Lunch, Uber, Groceries)</p>
        </div>
        <div>
          <input
            type="number"
            placeholder="Amount (e.g. 250)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="" disabled>Select category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose a category for your expense</p>
        </div>
        <button
          type="submit"
          className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Add Expense
        </button>
      </form>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Spending Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pieData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Daily Totals */}
        <div className="bg-white p-6 rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Daily Expenses</h3>
          {dailyTotals.length === 0 ? (
            <div className="text-gray-400 text-center py-12">No daily expense data to display.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTotals} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  minTickGap={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">All Expenses</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">Title</th>
              <th className="border-b p-2">Amount</th>
              <th className="border-b p-2">Category</th>
              <th className="border-b p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id} className="hover:bg-gray-50">
                <td className="border-b p-2">{exp.title}</td>
                <td className="border-b p-2">Rs.{exp.amount}</td>
                <td className="border-b p-2">{exp.category}</td>
                <td className="border-b p-2">
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (window.confirm("Delete this expense?")) {
                        try {
                          await axios.delete(`http://localhost:5000/api/expenses/${exp._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          fetchExpenses();
                          fetchDailyTotals();
                        } catch (err) {
                          alert("Failed to delete expense");
                        }
                      }
                    }}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
