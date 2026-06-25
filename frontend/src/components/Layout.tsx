import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

/**
 * Layout wraps every visible screen with:
 *   - a mobile-style header
 *   - the page content (<Outlet/>)
 *   - the bottom navigation bar
 */
export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="menu-btn" aria-label="Menu">
          ☰
        </button>
        <div>
          <div className="title">MOT-UK</div>
          <div className="subtitle">Car Service &amp; MOT Manager</div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
