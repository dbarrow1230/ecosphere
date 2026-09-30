import {Link} from "react-router-dom";

export default function InventoryWorkflow(){
 return <section className="container py-4"><h1>Purchasing and stock movement</h1>
  <p>This workflow scaffold shows the intended sequence. It does not create orders or change stock.</p>
  <ol><li>Create beverage items and supplier records.</li><li>Prepare a purchase order with item quantities and costs.</li><li>Record accepted receipt quantities and lots.</li><li>Post the receipt to update the stock ledger and balances.</li><li>Review the inventory report.</li></ol>
  <p>Posting requires verification of the existing Mongo transaction setup and stock services before this page can submit stock movements.</p>
  <div className="d-flex gap-3"><Link to="/beverages/add">Add beverage</Link><Link to="/suppliers">Suppliers</Link><Link to="/shopping-list">Reorder needs</Link><Link to="/reports">Inventory report</Link></div>
 </section>;
}
