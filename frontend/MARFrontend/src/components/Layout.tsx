import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/Pages.css";
import "./Layout.css";

type LayoutProps = { children: React.ReactNode };

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="page-container">
      <div className="page">
        <nav className="nav">
          <div className="nav-inner">
            <Link to="/" className="nav-brand">
              Magic All Rounder
            </Link>
            <div className="nav-tabs">
              <NavLink to="/" className={({ isActive }) => "nav-tab" + (isActive ? " nav-tab-active" : "")} end>
                Home
              </NavLink>
              <NavLink to="/randomizer" className={({ isActive }) => "nav-tab" + (isActive ? " nav-tab-active" : "")}>
                Randomizer
              </NavLink>
              <NavLink to="/decks" className={({ isActive }) => "nav-tab" + (isActive ? " nav-tab-active" : "")}>
                Your Decks
              </NavLink>
            </div>
            <div className="nav-links">
              {user ? (
                <>
                  <span className="nav-user">{user.username ?? user.email}</span>
                  <button type="button" onClick={logout} className="btn btn-outline">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    Log in
                  </Link>
                  <Link to="/signup" className="btn btn-primary">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="main">
          <div className="main-inner">{children}</div>
        </main>
        <div className="footer-wrap">
          <div className="footer-wave-wrap">
            <svg className="footer-wave" viewBox="0 0 1200 48" preserveAspectRatio="none">
              <path d="M0,24 C150,0 300,48 450,24 C550,8 650,40 750,24 C850,8 950,40 1050,24 C1100,16 1150,32 1200,24 L1200,48 L0,48 Z" />
            </svg>
          </div>
          <footer>
            <p><strong>Magic All Rounder</strong> — deck builder & randomizer</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
