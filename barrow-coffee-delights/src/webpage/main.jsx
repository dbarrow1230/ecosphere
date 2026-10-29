import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import PublicSite from "./PublicSite.jsx";
createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><PublicSite/></BrowserRouter></React.StrictMode>);
