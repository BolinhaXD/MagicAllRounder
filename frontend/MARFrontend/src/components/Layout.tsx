import { Link, NavLink } from "react-router-dom";
import "../pages/Pages.css";
import "./Layout.css";

type LayoutProps = { children: React.ReactNode };

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="page-container">
      <div className="page">
        <nav className="nav">
          <div className="nav-inner">
            <Link to="/" className="nav-brand" aria-label="Magic All Rounder home">
              <img src="/logo2.png" alt="Magic All Rounder" className="nav-brand-logo" />
            </Link>
            <div className="nav-tabs">
              <NavLink to="/" className={({ isActive }) => "nav-tab" + (isActive ? " nav-tab-active" : "")} end>
                Home
              </NavLink>
              <NavLink to="/randomizer" className={({ isActive }) => "nav-tab" + (isActive ? " nav-tab-active" : "")}>
                Randomizer
              </NavLink>
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
