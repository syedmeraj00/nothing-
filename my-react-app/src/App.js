import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Dashboard from "./Dashboard";
import DataEntry from "./DataEntry";
import SimpleDataEntry from "./SimpleDataEntry";
import IndustryStandardDataEntry from "./IndustryStandardDataEntry";
import Reports from "./Reports";
import SimpleReports from "./SimpleReports";
import Analytics from "./Analytics";
import Compliance from "./Compliance";
import Login from "./Login.jsx";
import Regulatory from "./Regulatory";
import Stakeholders from "./Stakeholders";
import MaterialityAssessment from "./components/MaterialityAssessment";
import SupplyChainESG from "./components/SupplyChainESG";
import AdminPanel from "./AdminPanel";
import FlowTester from "./FlowTester";
import { ThemeProvider } from './contexts/ThemeContext';

// ✅ Route guard
const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? children : <Navigate to="/login" replace />;
};

// ✅ Footer wrapper
const Layout = () => {
  const location = useLocation();
  const hideFooterOn = ["/login"];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/data-entry" element={<ProtectedRoute><DataEntry /></ProtectedRoute>} />
          <Route path="/simple-data-entry" element={<ProtectedRoute><SimpleDataEntry /></ProtectedRoute>} />
          <Route path="/industry-standard-data-entry" element={<ProtectedRoute><IndustryStandardDataEntry /></ProtectedRoute>} />
          <Route path="/materiality-assessment" element={<ProtectedRoute><MaterialityAssessment /></ProtectedRoute>} />
          <Route path="/supply-chain" element={<ProtectedRoute><SupplyChainESG /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/simple-reports" element={<ProtectedRoute><SimpleReports /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
          <Route path="/stakeholders" element={<ProtectedRoute><Stakeholders /></ProtectedRoute>} />
          <Route path="/regulatory" element={<ProtectedRoute><Regulatory /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/test-flow" element={<ProtectedRoute><FlowTester /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
