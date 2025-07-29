import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import companyLogo from "./companyLogo.jpg";
import { calculateAndSaveKPIs } from "./utils/storage";

function Dashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    overallScore: 0,
    complianceRate: 0,
    environmental: 0,
    social: 0,
    governance: 0,
    totalEntries: 0,
  });

  useEffect(() => {
    const updatedKPIs = calculateAndSaveKPIs();
    setKpis(updatedKPIs);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-br from-[#232946] via-[#3a7abf] to-[#5a3a8a] min-h-screen font-sans animate-gradient-x">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#1b3a2d] to-[#2a4a33] flex items-center px-6 py-4 shadow-lg border-b-4 border-[#6b7bd6] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              alt="E-S-Genius Logo"
              src={companyLogo}
              className="w-10 h-10 object-cover"
            />
          </div>
          <h1 className="text-[#3a7a44] text-xl sm:text-2xl font-bold">
            E-S-Genius Tech Solutions
          </h1>
        </div>
        <ul className="ml-auto flex gap-4 text-white text-sm sm:text-base items-center">
          <li>
            <Link
              to="/"
              className="bg-[#4f6a56] px-3 py-1.5 rounded hover:bg-[#5f7a66] transition-transform duration-200 hover:scale-105 hover:shadow-lg"
            >
              Dashboard
            </Link>
          </li>
          <li><Link to="/data-entry" className="hover:underline">Data Entry</Link></li>
          <li><Link to="/reports" className="hover:underline">Reports</Link></li>
          <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
          <li><Link to="/compliance" className="hover:underline">Compliance</Link></li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-transform duration-200 hover:scale-105"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 mt-8">
        <KpiCard value={kpis.overallScore} label="Overall ESG Score" />
        <KpiCard value="94%" label="Compliance Rate" />
        <KpiCard value={`${kpis.environmental}%`} label="Environmental Score" />
        <KpiCard value="B+" label="Sustainability Index" />
      </section>

      {/* Performance Overview */}
      <main className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-6 mt-8">
        <aside className="bg-white/70 backdrop-blur-md w-full md:w-1/3 p-6 rounded-xl shadow-xl border border-white/20">
          <h2 className="text-lg font-bold text-[#1b3a2d] mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2 mb-6">
            <Link to="/data-entry" className="bg-gradient-to-r from-[#1b3a2d] to-[#3a7a44] text-white px-4 py-2 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#3a7a44]">
              Add New Data
            </Link>
            <Link to="/reports" className="bg-[#3a7abf] hover:bg-[#2a4a8f] text-white px-4 py-2 rounded text-center transition-transform duration-200 hover:scale-105">
              Generate Report
            </Link>
            <Link to="/compliance" className="bg-[#1b3a2d] hover:bg-[#2a4a33] text-white px-4 py-2 rounded text-center transition-transform duration-200 hover:scale-105">
              Check Compliance
            </Link>
          </div>
          <h3 className="font-semibold text-[#1b3a2d] mb-2">Recent Alerts</h3>
          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
            <li>Carbon emissions target review due</li>
            <li>Quarterly sustainability report pending</li>
            <li>New ESG regulation update available</li>
          </ul>
        </aside>

        <section className="bg-white/70 backdrop-blur-md w-full md:w-2/3 p-6 rounded-xl shadow-xl border border-white/20">
          <h2 className="text-lg font-bold text-[#1b3a2d] border-b-2 border-[#3a7a44] pb-1 mb-6">ESG Performance Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '🌍',
                title: 'Environmental',
                score: kpis.environmental,
                description: ['Energy savings, emissions, water use'],
                tag: kpis.environmental > 70 ? 'GOOD' : 'NEEDS WORK',
                tagColor: kpis.environmental > 70 ? 'bg-[#a8cbb0] text-[#1b3a2d]' : 'bg-yellow-100 text-yellow-800'
              },
              {
                icon: '👥',
                title: 'Social',
                score: kpis.social,
                description: ['Employee satisfaction, diversity, training'],
                tag: kpis.social > 70 ? 'EXCELLENT' : 'AVERAGE',
                tagColor: kpis.social > 70 ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-900'
              },
              {
                icon: '🏛',
                title: 'Governance',
                score: kpis.governance,
                description: ['Transparency, ethics, board diversity'],
                tag: kpis.governance > 70 ? 'STRONG' : 'IMPROVING',
                tagColor: kpis.governance > 70 ? 'bg-blue-200 text-blue-900' : 'bg-orange-100 text-orange-900'
              }
            ].map((item, i) => (
              <article
                key={i}
                className="border-l-4 border-[#6b7bd6] p-5 rounded-xl shadow-xl transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_30px_#6b7bd6] bg-white/70"
              >
                <h3 className="text-[#1b3a2d] font-bold text-xl mb-2 flex items-center gap-2 animate-pulse">
                  <span>{item.icon}</span> {item.title}
                </h3>
                <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
                  <div
                    className="bg-[#3a7a44] h-2 rounded-full"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
                {item.description.map((text, j) => (
                  <p key={j} className="text-sm mb-1">{text}</p>
                ))}
                <span className={`inline-block ${item.tagColor} text-xs font-semibold px-3 py-1 rounded-full mt-2`}>
                  {item.tag}
                </span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const KpiCard = ({ value, label }) => (
  <div className="bg-gradient-to-br from-[#6b7bd6]/80 to-[#5a3a8a]/80 rounded-xl text-white shadow-xl p-6 text-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer backdrop-blur-md border border-white/20">
    <h2 className="text-4xl font-extrabold mb-2 drop-shadow">{value}</h2>
    <p className="text-base tracking-wide opacity-90">{label}</p>
  </div>
);

export default Dashboard;
