import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./components/AdminDashboard";
import HODDashboard from "./components/HODDashboard";
import FacultyDashboard from "./components/FacultyDashboard";
import CompleteProfile from "./components/CompleteProfile";
import EditProfile from './components/EditProfile';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import ViewFacultyProfile from './components/ViewFacultyProfile';
import EditFacultyProfile from './components/EditFacultyProfile';
import DepartmentDashboard from './components/DepartmentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hod-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HODDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department-dashboard/:departmentId" 
          element={
            <ProtectedRoute allowedRoles={['hod']}>
              <DepartmentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-profile" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'hod']}>
              <EditProfile />
            </ProtectedRoute>
          } 
        />
        <Route path="/view-faculty/:id" element={<ViewFacultyProfile />} />
        <Route path="/edit-faculty/:id" element={<EditFacultyProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
