import ReferenceDataPage from "../recipes/ReferenceDataPage.jsx";

export default function VendorCategories(){
 return <ReferenceDataPage title="Vendor Types" singular="Vendor Type" endpoint="/api/vendor-categories" description="Manage supplier and service classifications used by vendor records."/>;
}
