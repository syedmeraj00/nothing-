import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getStoredData, initializeStorage } from "./utils/storage";
import companyLogo from "./companyLogo.jpg";
import jsPDF from "jspdf";



import html2canvas from "html2canvas";

const COLORS = ["#3a7a44", "#6b7bd6", "#ffbb28", "#ff8042"];

const sampleReports = [
  { type: "SEBI BRSR", description: "Mandatory ESG report for listed Indian companies" },
  { type: "GRI Standards", description: "Global Reporting Initiative based template" },
  { type: "Carbon Report", description: "Tracks CO2 emissions and carbon footprint" },
  { type: "Water Usage", description: "Analyzes total water consumption" },
  { type: "Waste Management", description: "Details waste segregation and disposal" },
];

function Reports() {
  const [data, setData] = useState([]);
  const [selectedReport, setSelectedReport] = useState("SEBI BRSR");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    initializeStorage();
    const stored = getStoredData();
    setData(stored);
  }, []);

  const chartData = () => {
    const categoryCount = {};
    data.forEach((item) => {
      if (!categoryCount[item.category]) categoryCount[item.category] = 0;
      categoryCount[item.category]++;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  };

  const filteredData = data.filter((item) => {
    return filterStatus === "All" || item.status === filterStatus;
  });

  const exportPDF = () => {
    const reportDiv = document.getElementById("report-summary");
    html2canvas(reportDiv).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save(`${selectedReport}-summary.pdf`);
    });
  };

  const exportCSV = () => {
    const csvRows = [
      ["Category", "Metric", "Value", "Description", "Status"],
      ...filteredData.map((item) => [
        item.category,
        item.metric,
        item.value,
        item.description,
        item.status || "Pending"
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.map((x) => `"${x}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReport}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#e9edf2] p-6 font-sans">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#1b3a2d] to-[#2a4a33] flex items-center px-6 py-4 shadow-md mb-6">
        <div className="flex items-center gap-3">
  <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded-full" />
        <h1 className="text-white text-xl font-semibold">ESG Reports Module</h1>
        </div>
        <ul className="ml-auto flex gap-6 text-white text-sm">
          <li><Link to="/" className="hover:underline">Dashboard</Link></li>
          <li><Link to="/data-entry" className="hover:underline">Data Entry</Link></li>
          <li><Link to="/reports" className="bg-[#4f6a56] px-3 py-1.5 rounded">Reports</Link></li>
          <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
          <li><Link to="/compliance" className="hover:underline">Compliance</Link></li>
        </ul>
      </nav>


      <div className="grid md:grid-cols-2 gap-8">
        {/* Template List */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-[#1b3a2d] mb-4">Pre-Built Templates</h2>
          <ul className="space-y-3">
            {sampleReports.map((report, i) => (
              <li
                key={i}
                className={`border p-4 rounded-lg cursor-pointer ${selectedReport === report.type ? "bg-[#d3ede0] border-[#3a7a44]" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedReport(report.type)}
              >
                <strong>{report.type}</strong>
                <p className="text-sm text-gray-700">{report.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary & Chart */}
        <div className="bg-white p-6 rounded-xl shadow" id="report-summary">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#1b3a2d]">{selectedReport} Summary</h2>
            <div className="flex gap-2">
              <button onClick={exportPDF} className="bg-[#3a7a44] text-white px-4 py-1 rounded text-sm hover:bg-[#2a4a33]">
                Download PDF
              </button>
              <button onClick={exportCSV} className="bg-[#3a7a44] text-white px-4 py-1 rounded text-sm hover:bg-[#2a4a33]">
                Export CSV
              </button>
            </div>
          </div>
          {chartData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {chartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data available. Enter some ESG data first.</p>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white p-6 rounded-xl shadow mt-8">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1b3a2d]">Report History</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        {filteredData.length > 0 ? (
          <ul className="divide-y divide-gray-200 text-sm">
            {filteredData.map((item, idx) => (
              <li key={idx} className="py-2 flex justify-between items-start">
                <div>
                  <strong>{item.metric}</strong> – {item.category} – {item.value}<br />
                  <span className="text-gray-500">{item.description}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  item.status === "Submitted"
                    ? "bg-green-200 text-green-800"
                    : item.status === "Pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}>
                  {item.status || "Pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No report history found.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
