import SupplyVendorsForm from '../forms/vendors/supplyVendorsForm.jsx';
import VendorDirectoryPage from './VendorDirectoryPage.jsx';

export default function SupplyVendorsPage(){
	return(
		<VendorDirectoryPage
			title="Supply Vendors"
			endpoint="/api/supply-vendors"
			VendorForm={SupplyVendorsForm}
		/>
	);
}
