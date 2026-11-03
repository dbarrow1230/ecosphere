import ResourcePage from "../../components/photography/ResourcePage.jsx";
import AlbumForm from "../forms/photography/AlbumForm.jsx";
import {albumFields} from "../../config/photographyFields.js";
const lookups={};
export default function AlbumsPage(){return <ResourcePage title="Albums" singular="Album" endpoint="/api/albums" FormComponent={AlbumForm} fields={albumFields} lookups={lookups} photoFilter="albumRefs"/>;}
