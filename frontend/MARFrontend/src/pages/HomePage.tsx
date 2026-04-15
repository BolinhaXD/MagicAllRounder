import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import {
  CONTACT_EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  PORTFOLIO_NAME,
} from "../siteLinks";
import "./Pages.css";

export default function HomePage() {
  return (
    <Layout>
      <div className="main-content portfolio-page">
        <header className="portfolio-hero">
          <h1>{PORTFOLIO_NAME}</h1>
          <p className="lead">
            Young Developer and Magic: The Gathering fan - this website is a portfolio project around using the Scryfall API to get random cards and show them to the user.
          </p>
        </header>

        <section className="portfolio-section" aria-labelledby="about-site">
          <h2 id="about-site">About this website</h2>
          <p>
            <strong>Magic All Rounder</strong> is a web app for Commander players. The{" "}
            <Link to="/randomizer">Randomizer</Link> helps you find legal commanders with filters for mana
            value, power, toughness, and color identity.
          </p>
          <p>
            It had a bigger scope being a random deck builder but i think that took out a lot of the fun of 
            discovering new cards and card interactions using the scryfall website its amazing features.
          </p>
          <p>
            It uses a React frontend and a Node backend that caches Scryfall data so random picks stay fast.
          </p>
          <div className="portfolio-actions">
            <Link to="/randomizer" className="portfolio-link">
              Try the Randomizer
            </Link>
          </div>
        </section>

        <section className="portfolio-section" aria-labelledby="about-me">
          <h2 id="about-me">About me</h2>
          <p>
            I&apos;m {PORTFOLIO_NAME}. I built this project to practice using a data API and use that for a purpose that I enjoy,
            clean UI, and real-world APIs - here, Scryfall - while making something I&apos;d actually use.
          </p>
          <p>
           
          </p>
        </section>

        <section className="portfolio-section" aria-labelledby="contact">
          <h2 id="contact">Contact</h2>
          <p>Reach out if you want to talk about the project, collaboration, or Magic: The Gathering in general.</p>
          <ul className="portfolio-list">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="portfolio-link portfolio-link--inline">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-link portfolio-link--inline"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-link portfolio-link--inline"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
