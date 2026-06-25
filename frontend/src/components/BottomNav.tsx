import { NavLink } from "react-router-dom";

/**
 * Bottom navigation bar.
 *
 * IMPORTANT: The "Validation Model" screen is deliberately NOT listed here.
 * It must never appear in the menu bar, sidebar, bottom navigation, or any
 * visible app navigation. It remains an internal-only route.
 */
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/add-entry", label: "Add", icon: "➕" },
  { to: "/reports", label: "Reports", icon: "📄" },
  { to: "/reminders", label: "Reminders", icon: "🔔" },
  { to: "/vehicles", label: "Vehicles", icon: "🚗" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
