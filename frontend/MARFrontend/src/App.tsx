import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RandomizerPage from "./pages/RandomizerPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/randomizer" element={<RandomizerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
