import "../styles/theme.css";
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import PublicSite from './PublicSite.jsx';
createRoot(document.getElementById('root')).render(<BrowserRouter><PublicSite /></BrowserRouter>);
