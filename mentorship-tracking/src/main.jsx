import "./utils/ecosphereAuthBridge.js";
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {IconProvider} from "@shared";
import ErrorBoundary from "./components/errorpages/ErrorBoundary.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./styles/theme.css";

import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
 <React.StrictMode>
 <BrowserRouter>
 <IconProvider>
  <ErrorBoundary>
   <App/>
  </ErrorBoundary>
 </IconProvider>
</BrowserRouter>
 </React.StrictMode>
);