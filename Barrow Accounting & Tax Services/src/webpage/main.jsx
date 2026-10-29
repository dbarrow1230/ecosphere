import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {BusinessBrandProvider} from "./BusinessBrand.jsx";
import "../styles/theme.css";
import PublicSite from "./PublicSite.jsx";
createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><BusinessBrandProvider><PublicSite/></BusinessBrandProvider></BrowserRouter></React.StrictMode>);
