import CropRelationshipsBrowser from "./CropRelationshipsBrowser.jsx";

export default function CoverCropsPage({user}){
 return <CropRelationshipsBrowser title="Cover Crops" field="coverCrops" description="Select a seed or plant to see its recorded cover crops." user={user}/>;
}
