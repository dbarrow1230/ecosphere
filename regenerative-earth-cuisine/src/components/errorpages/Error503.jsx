// src/components/errorpages/Error503.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/error-pages.css';

export default function Error503(){
return(
<div className="error-page d-flex align-items-center justify-content-center">
<div className="container">
<div className="row justify-content-center">
<div className="col-lg-7 col-md-9">
<div className="error-card text-center shadow-lg">
<h1 className="error-code">503</h1>
<h2 className="error-title">Service Unavailable</h2>
<p className="error-text">The service is temporarily unavailable. Please check back soon.</p>
<div className="d-flex flex-wrap gap-2 justify-content-center">
<Link to="/" className="btn btn-primary error-btn">Back Home</Link>
<button type="button" className="btn btn-outline-secondary error-btn" onClick={()=>window.location.reload()}>Reload</button>
</div>
</div>
</div>
</div>
</div>
</div>
);
}