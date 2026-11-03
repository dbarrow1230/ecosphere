import ResourcePage from "../../components/photography/ResourcePage.jsx";
import TagForm from "../forms/photography/TagForm.jsx";
import {tagFields} from "../../config/photographyFields.js";
const lookups={};
export default function TagsPage(){return <ResourcePage title="Tags" singular="Tag" endpoint="/api/photo-tags" FormComponent={TagForm} fields={tagFields} lookups={lookups} photoFilter="tagRefs"/>;}
