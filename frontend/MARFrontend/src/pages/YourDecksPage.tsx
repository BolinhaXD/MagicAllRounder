import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import "./Pages.css";

export default function YourDecksPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="main-content page-content-centered">
          <p>Loading…</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="main-content page-content-centered">
        <h1>Your Decks</h1>
        <p className="lead">Your decks are on this page.</p>
      </div>
    </Layout>
  );
}
