import RecordForm from "../../../components/photography/RecordForm.jsx";
import {shootFields} from "../../../config/photographyFields.js";
export default function ShootForm(props){return <RecordForm {...props} fields={shootFields}/>;}
