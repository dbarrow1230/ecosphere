// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {IconProvider} from "@shared";
import ErrorBoundary from "./components/errorpages/ErrorBoundary.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./styles/theme.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
 <React.StrictMode>
  <BrowserRouter>
   <IconProvider>
    <ErrorBoundary>
     <ScrollToTop/>
     <App/>
    </ErrorBoundary>
   </IconProvider>
  </BrowserRouter>
 </React.StrictMode>
);
import "@shared/ecosphereAuthBridge.js";
