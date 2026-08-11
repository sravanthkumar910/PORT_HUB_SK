import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Lightbulb, FolderKanban, Store, ListTodo,
  FileText, User, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/ideas", label: "Ideas", icon: Lightbulb },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/project-store", label: "Project Store", icon: Store },
  { to: "/tasks", label: "Daily Tasks", icon: ListTodo },
  { to: "/documents", label: "Documents", icon: FileText },
];

const bottomLinks = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-base-600/60 bg-base-800/40 flex flex-col">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="status-dot bg-signal-cyan shadow-[0_0_8px_2px_rgba(79,209,232,0.6)] animate-pulse" />
          <span className="font-display font-semibold tracking-tight text-lg">Project Hub</span>
        </div>
        <p className="label-eyebrow mt-1">control room</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-signal-cyan/10 text-signal-cyan"
                  : "text-base-50/60 hover:text-base-50 hover:bg-base-700/60"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-base-600/60 pt-3">
        {bottomLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-signal-cyan/10 text-signal-cyan"
                  : "text-base-50/60 hover:text-base-50 hover:bg-base-700/60"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="w-8 h-8 rounded-full bg-signal-violet/20 flex items-center justify-center text-signal-violet font-mono text-xs">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{user?.name}</p>
          </div>
          <button onClick={logout} title="Log out" className="text-base-50/40 hover:text-signal-rose transition">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
