import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// This will give the default vite styling instead of just the basic HTML
// import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
