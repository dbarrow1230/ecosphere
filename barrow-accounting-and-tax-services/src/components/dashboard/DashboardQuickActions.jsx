import {Link} from "react-router-dom";
import {Users,ClipboardList} from "lucide-react";

export default function DashboardQuickActions(){
 return <nav className="accounting-quick-actions" aria-label="Accounting quick actions">
  <Link className="btn btn-primary" to="/clients"><Users size={17}/> Manage clients</Link>
  <a className="btn btn-outline-primary" href="#accounting-work"><ClipboardList size={17}/> Client work & deadlines</a>
 </nav>;
}
