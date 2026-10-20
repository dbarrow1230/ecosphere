import CropRelationshipsBrowser from "./CropRelationshipsBrowser.jsx";

export default function TrapCropsPage({user}){
 return <CropRelationshipsBrowser title="Trap Crops" field="trapCrops" description="Select a seed or plant to see its recorded trap crops." user={user}/>;
}
