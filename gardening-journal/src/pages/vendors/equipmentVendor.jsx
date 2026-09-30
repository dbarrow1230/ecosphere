import EquipmentVendorsForm from '../forms/vendors/equipmentVendorsForm.jsx';
import VendorDirectoryPage from './VendorDirectoryPage.jsx';

export default function EquipmentVendorsPage(){
	return(
		<VendorDirectoryPage
			title="Equipment Vendors"
			endpoint="/api/equipment-vendors"
			VendorForm={EquipmentVendorsForm}
		/>
	);
}
