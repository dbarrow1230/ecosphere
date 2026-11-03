import { Link } from 'react-router-dom';
export default function NotFound() {
  return <section className="page"><h1>Page Not Found</h1><Link to="/shop">Return to the Shop</Link></section>;
}
