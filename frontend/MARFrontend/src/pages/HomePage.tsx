import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Pages.css";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <nav className="nav">
        <span className="nav-brand">Magic All Rounder</span>
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
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>
      <main className="main">
        <h1>Welcome{user ? `, ${user.username ?? user.email}` : ""}</h1>
        <p className="lead">
          {user
            ? "You're signed in. Start building your decks."
            : "Sign in or create an account to get started."}
        </p>
      </main>
    </div>
  );
}
