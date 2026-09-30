import ResourcePage from "../../components/photography/ResourcePage.jsx";
import ShootForm from "../forms/photography/ShootForm.jsx";
import {shootFields} from "../../config/photographyFields.js";
const lookups={"equipmentRefs":"/api/equipment"};
export default function ShootsPage(){return <ResourcePage title="Shoots" singular="Shoot" endpoint="/api/shoots" FormComponent={ShootForm} fields={shootFields} lookups={lookups} photoFilter="shootRef"/>;}
