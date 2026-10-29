// src/components/errorpages/Error401.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/error-pages.css';

export default function Error401(){
return(
<div className="error-page d-flex align-items-center justify-content-center">
<div className="container">
<div className="row justify-content-center">
<div className="col-lg-7 col-md-9">
<div className="error-card text-center shadow-lg">
<h1 className="error-code">401</h1>
<h2 className="error-title">Unauthorized</h2>
<p className="error-text">You need to sign in before you can access this page.</p>
<div className="d-flex flex-wrap gap-2 justify-content-center">
<Link to="/" className="btn btn-primary error-btn">Back Home</Link>
<button type="button" className="btn btn-outline-secondary error-btn" onClick={()=>window.history.back()}>Go Back</button>
</div>
</div>
</div>
</div>
</div>
</div>
);
}