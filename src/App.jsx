import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorsManagement from "./pages/DoctorsManagement";
import PatientsManagement from "./pages/PatientsManagement";
import SecretariesManagement from "@/pages/SecretariesManagement";
import LabResultsManagement from "./pages/LabResultsManagement";
import ArchivesManagement from "./pages/ArchivesManagement";
import ReportsManagement from "./pages/ReportsManagement";

export default function App() {
  // وضعیت اولیه از localStorage خوانده می‌شود تا بعد از رفرش هم لاگین بماند
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token")),
  );

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <DoctorsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretaries"
          element={
            <ProtectedRoute>
              <SecretariesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <LabResultsManagement />
            </ProtectedRoute>
          }
        />
         <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <ArchivesManagement />
            </ProtectedRoute>
          }
          />
          <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsManagement />
            </ProtectedRoute>
          }
          />
      </Routes>
    </BrowserRouter>
  );
}
