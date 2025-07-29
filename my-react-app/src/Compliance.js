import React, { useState, useEffect } from "react";
import { FaFileUpload } from "react-icons/fa";
import companyLogo from "./companyLogo.jpg";

import { Link } from "react-router-dom";

const mockComplianceData = [
  {
    id: 1,
    name: "Environmental Policy",
    uploadedAt: "2025-07-14 10:30 AM",
    status: "Pending Review",
  },
  {
    id: 2,
    name: "BRSR Compliance Report",
    uploadedAt: "2025-07-12 02:00 PM",
    status: "Approved",
  },
];

const statusColors = {
  "Pending Review": "bg-yellow-100 text-yellow-800",
  "Approved": "bg-green-100 text-green-800",
  "Rejected": "bg-red-100 text-red-800",
};

const Compliance = () => {
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);

 useEffect(() => {
  const storedHistory = JSON.parse(localStorage.getItem("complianceHistory"));
  if (storedHistory) {
    setHistory(storedHistory);
  } else {
    setHistory(mockComplianceData);
  }
}, []);


  const handleFileChange = (e) => {
  const newFile = e.target.files[0];
  if (newFile) {
    const uploadedAt = new Date().toLocaleString();
    const newEntry = {
      id: Date.now(),
      name: newFile.name,
      uploadedAt,
      status: "Pending Review",
    };
    const updatedHistory = [newEntry, ...history];
    setFiles([...files, newFile]);
    setHistory(updatedHistory);
    localStorage.setItem("complianceHistory", JSON.stringify(updatedHistory)); // ✅ Save to localStorage
  }
};


  return (
    <div className="bg-[#dbe4f0] min-h-screen font-sans flex flex-col">
      {/* ✅ Navbar */}
      <nav className="bg-gradient-to-r from-[#1b3a2d] to-[#2a4a33] flex items-center px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
  <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded-full" />
        <h1 className="text-white text-xl font-semibold">ESG Compliance</h1>
        </div>
        <ul className="ml-auto flex gap-6 text-white text-sm">
          <li><Link to="/" className="hover:underline">Dashboard</Link></li>
          <li><Link to="/data-entry" className="hover:underline">Data Entry</Link></li>
          <li><Link to="/reports" className="hover:underline">Reports</Link></li>
          <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
          <li><Link to="/compliance" className="bg-[#4f6a56] px-3 py-1.5 rounded">Compliance</Link></li>
        </ul>
      </nav>

      <div className="px-6 py-8 flex-grow">
        <h1 className="text-2xl font-bold text-[#1b3a2d] mb-6">
          📋 Compliance Center
        </h1>

        {/* Upload */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-lg font-semibold text-[#1b3a2d] mb-4">
            Upload Compliance Documents
          </h2>
          <label className="flex items-center space-x-3 cursor-pointer text-[#3a7a44] font-medium">
            <FaFileUpload />
            <span>Select a file to upload</span>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Accepted formats: PDF, DOCX, XLSX
          </p>
        </div>

        {/* History Table */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-[#1b3a2d] mb-4">
            🕒 Compliance History
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-600">No documents uploaded yet.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-[#1b3a2d] border-b">
                  <th className="pb-2">Document Name</th>
                  <th className="pb-2">Uploaded At</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="py-2">{doc.name}</td>
                    <td className="py-2">{doc.uploadedAt}</td>
                    <td className="py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[doc.status]}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default Compliance;
