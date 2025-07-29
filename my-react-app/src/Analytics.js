import React, { useEffect, useState } from "react";
import companyLogo from "./companyLogo.jpg";

import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { getStoredData } from "./utils/storage";
import { Link } from "react-router-dom"; // ✅ Add this for navigation links

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

const Analytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const stored = getStoredData();
    setData(stored || []);
  }, []);

  const categoryCount = { environmental: 0, social: 0, governance: 0 };
const trendMap = {}; // ✅ Make sure this is declared

data.forEach(({ category, timestamp }) => {
  if (category in categoryCount) {
    categoryCount[category] += 1;
  }
  const date = new Date(timestamp).toLocaleDateString();
  trendMap[date] = (trendMap[date] || 0) + 1;
});


  const pieData = {
    labels: ["Environmental", "Social", "Governance"],
    datasets: [
      {
        data: [
          categoryCount.environmental,
          categoryCount.social,
          categoryCount.governance,
        ],
        backgroundColor: ["#3a7a44", "#facc15", "#ef4444"],
        hoverOffset: 12,
      },
    ],
  };

  const lineData = {
    labels: Object.keys(trendMap),
    datasets: [
      {
        label: "Submissions Over Time",
        data: Object.values(trendMap),
        borderColor: "#3a7a44",
        backgroundColor: "#3a7a44",
        tension: 0.4,
      },
    ],
  };

  const riskColor = (val) =>
    val >= 10 ? "text-green-600" : val >= 5 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-[#edf1f5] p-6 font-sans">
      {/* ✅ Add Navbar */}
      <nav className="bg-gradient-to-r from-[#1b3a2d] to-[#2a4a33] flex items-center px-6 py-4 shadow-md mb-6">
        <div className="flex items-center gap-3">
  <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded-full" />
        <h1 className="text-white text-xl font-semibold">ESG Analytics</h1>
        </div>
        <ul className="ml-auto flex gap-6 text-white text-sm">
          <li><Link to="/" className="hover:underline">Dashboard</Link></li>
          <li><Link to="/data-entry" className="hover:underline">Data Entry</Link></li>
          <li><Link to="/reports" className="hover:underline">Reports</Link></li>
          <li><Link to="/analytics" className="bg-[#4f6a56] px-3 py-1.5 rounded">Analytics</Link></li>
          <li><Link to="/compliance" className="hover:underline">Compliance</Link></li>
        </ul>
      </nav>


      <h1 className="text-2xl font-extrabold text-[#1b3a2d] mb-6">
        📈 ESG Analytics Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#1b3a2d] mb-4">
            ESG Category Distribution
          </h2>
          <Pie data={pieData} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#1b3a2d] mb-4">
            Submissions Trend
          </h2>
          <Line data={lineData} />
        </div>
      </div>

      <div className="mt-10 bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-semibold text-[#1b3a2d] mb-4">
          🧠 Risk Analysis by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {["environmental", "social", "governance"].map((key, idx) => (
            <div
              key={idx}
              className="bg-[#f9fafb] border border-gray-200 p-4 rounded shadow-sm text-center"
            >
              <h3 className="text-md font-semibold text-gray-700 capitalize">
                {key}
              </h3>
              <p className={`text-xl font-bold mt-2 ${riskColor(categoryCount[key])}`}>
                {categoryCount[key]} Entries
              </p>
              <p className="text-sm mt-1 text-gray-500">
                {categoryCount[key] >= 10
                  ? "Low Risk"
                  : categoryCount[key] >= 5
                  ? "Moderate Risk"
                  : "High Risk"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
