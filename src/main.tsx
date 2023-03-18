import React from "react";
import ReactDOM from "react-dom/client";
import SerialProvider from "./Serial";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SerialProvider>
      <App />
    </SerialProvider>
  </React.StrictMode>
);
