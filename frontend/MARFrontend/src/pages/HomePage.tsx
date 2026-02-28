import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import "./Pages.css";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="main-content page-content-centered">
        <h1>Welcome{user ? `, ${user.username ?? user.email}` : ""}</h1>
        <p className="lead">
          {user
            ? "You're signed in. Start building your decks."
            : "Sign in or create an account to get started."}
        </p>
      </div>
    </Layout>
  );
}
