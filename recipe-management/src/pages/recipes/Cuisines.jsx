import ReferenceDataPage from "./ReferenceDataPage.jsx";

export default function Cuisines(){
 return <ReferenceDataPage title="Cuisines" singular="Cuisine" endpoint="/api/cuisines" description="Maintain the cuisine classifications used by recipes."/>;
}
