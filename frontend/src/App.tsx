import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import Reports from "./pages/Reports";
import Reminders from "./pages/Reminders";
import VehiclesRoles from "./pages/VehiclesRoles";
import Settings from "./pages/Settings";
import ValidationModel from "./pages/ValidationModel";

/**
 * App routing.
 *
 * All visible screens are rendered inside <Layout>, which provides the
 * mobile header and bottom navigation.
 *
 * NOTE: The "Validation Model" screen is intentionally a hidden/internal
 * route. It is reachable only by typing the URL directly and is NOT listed
 * in the bottom navigation, sidebar, or any visible menu (see BottomNav.tsx).
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-entry" element={<AddEntry />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/vehicles" element={<VehiclesRoles />} />
        <Route path="/settings" element={<Settings />} />

        {/* Hidden / internal only — not shown in any navigation. */}
        <Route path="/internal/validation-model" element={<ValidationModel />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
