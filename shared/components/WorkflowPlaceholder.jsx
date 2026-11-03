import {Link} from "react-router-dom";

// Explicit development scaffolding for navigation destinations without a page.
export default function WorkflowPlaceholder({title}){
 return <section className="container py-4">
  <h1>{title}</h1>
  <div className="alert alert-info" role="status">
   This workflow is a development preview. Its data screen is not connected yet.
  </div>
  <p>This page lets you test navigation. It does not load or save records.</p>
  <Link className="btn btn-outline-primary" to="/dashboard">Return to dashboard</Link>
 </section>;
}
