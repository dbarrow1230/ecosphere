import {Navigate,Link} from "react-router-dom";
import "../../styles/StorefrontPages.css";

export default function StaffPortal({user}){
 if(user)return <Navigate to="/dashboard" replace/>;
 return <div className="storefront-page staff-portal"><p className="storefront-eyebrow">Authorized team members</p><h1>Staff portal</h1><p>Sign in to manage products, inventory, stores, customer orders, and administration.</p><Link to="/login" className="storefront-link-button">Continue to staff sign in</Link></div>;
}
