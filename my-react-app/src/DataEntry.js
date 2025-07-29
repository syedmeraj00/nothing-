import React, { useState } from "react";
import * as XLSX from "xlsx";
import companyLogo from "./companyLogo.jpg";
import { saveData, saveMultiple } from "./utils/storage";

import { Link } from "react-router-dom";

function DataEntry() {
  const [formData, setFormData] = useState({
    companyName: "",
    category: "",
    metric: "",
    value: "",
    description: "",
  });

  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.category || !formData.metric || !formData.value || !formData.description) {
      alert("Please fill in all fields.");
      return;
    }
    saveData({
      ...formData,
      category: formData.category.toLowerCase(),
      status: "Pending",
      timestamp: new Date().toISOString(),
    });
    alert("Data saved successfully");
    setFormData({ companyName: "", category: "", metric: "", value: "", description: "" });
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      const formatted = jsonData.map((row) => ({
        companyName: row.CompanyName || "",
        category: row.Category || "",
        metric: row.Metric || "",
        value: row.Value || "",
        description: row.Description || "",
        status: "Pending",
        timestamp: new Date().toISOString(),
      }));
      saveMultiple(formatted);
      alert(`${formatted.length} entries imported successfully.`);
    };
    reader.readAsBinaryString(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || (!file.name.endsWith(".xlsx") && !file.name.endsWith(".csv"))) {
      alert("Only .xlsx or .csv files are supported.");
      return;
    }
    handleFileUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="bg-[#e9edf2] min-h-screen font-sans">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#1b3a2d] to-[#2a4a33] flex items-center px-6 py-4 shadow-md">
    <div className="flex items-center gap-3">
  <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded-full" />
  <h1 className="text-white text-xl font-semibold">ESG Data Entry</h1>
</div>

        <ul className="ml-auto flex gap-6 text-white text-sm">
          <li><Link to="/" className="hover:underline">Dashboard</Link></li>
          <li><Link to="/data-entry" className="bg-[#4f6a56] px-3 py-1.5 rounded">Data Entry</Link></li>
          <li><Link to="/reports" className="hover:underline">Reports</Link></li>
          <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
          <li><Link to="/compliance" className="hover:underline">Compliance</Link></li>
        </ul>
      </nav>


      <main className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
        <h2 className="text-[#1b3a2d] font-extrabold text-2xl mb-6 border-b-2 pb-2 border-[#3a7a44]">Manual ESG Data Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-4 py-2"
              placeholder="e.g., TCS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-4 py-2"
            >
              <option value="">Select a category</option>
              <option value="Environmental">Environmental</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
            <input
              type="text"
              name="metric"
              value={formData.metric}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-4 py-2"
              placeholder="e.g., Carbon Emissions Reduction"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-4 py-2"
              placeholder="e.g., 15%"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-4 py-2 h-24"
              placeholder="Describe the metric..."
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="bg-[#1b3a2d] text-white px-6 py-2 rounded hover:bg-[#2a4a33]">
              Submit Data
            </button>
          </div>
        </form>

        {/* Enhanced File Upload */}
        <div className="mt-12 border-t pt-6">
          <h3 className="text-xl font-semibold text-[#1b3a2d] mb-3">📂 Upload Excel/CSV File</h3>
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 ${dragOver ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-400"} p-6 rounded-md text-center cursor-pointer`}
          >
            <p className="text-sm text-gray-600">Drag & drop your .xlsx or .csv file here</p>
            <p className="text-sm text-gray-500">OR</p>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={onFileChange}
              className="mt-2 mx-auto text-sm"
            />
            <p className="text-sm text-gray-500 mt-2">Required columns: <code>CompanyName, Category, Metric, Value, Description</code></p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DataEntry;
