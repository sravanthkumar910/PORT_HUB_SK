import React from "react";
import Sidebar from "./Sidebar.jsx";

const Layout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 min-w-0">{children}</main>
  </div>
);

export default Layout;
