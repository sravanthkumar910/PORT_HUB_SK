import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Ideas from "./pages/Ideas.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectStore from "./pages/ProjectStore.jsx";
import Tasks from "./pages/Tasks.jsx";
import Documents from "./pages/Documents.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

const withLayout = (el) => (
  <ProtectedRoute>
    <Layout>{el}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={withLayout(<Dashboard />)} />
      <Route path="/ideas" element={withLayout(<Ideas />)} />
      <Route path="/projects" element={withLayout(<Projects />)} />
      <Route path="/project-store" element={withLayout(<ProjectStore />)} />
      <Route path="/tasks" element={withLayout(<Tasks />)} />
      <Route path="/documents" element={withLayout(<Documents />)} />
      <Route path="/profile" element={withLayout(<Profile />)} />
      <Route path="/settings" element={withLayout(<Settings />)} />
    </Routes>
  );
}

export default App;
