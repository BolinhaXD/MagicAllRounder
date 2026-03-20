import Layout from "../components/Layout";
import "./Pages.css";

export default function HomePage() {
  return (
    <Layout>
      <div className="main-content page-content-centered">
        <h1>Welcome</h1>
        <p className="lead">
          Use the Randomizer to get random commander suggestions, or explore from here.
        </p>
      </div>
    </Layout>
  );
}
