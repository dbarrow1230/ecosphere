import ResourcePage from "../../components/photography/ResourcePage.jsx";
import EquipmentForm from "../forms/photography/EquipmentForm.jsx";
import {equipmentFields} from "../../config/photographyFields.js";
const lookups={};
export default function EquipmentPage(){return <ResourcePage title="Equipment" singular="Equipment" endpoint="/api/equipment" FormComponent={EquipmentForm} fields={equipmentFields} lookups={lookups}/>;}
