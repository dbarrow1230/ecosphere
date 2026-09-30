import ReferenceDataPage from "./ReferenceDataPage.jsx";

export default function Categories(){
 return <ReferenceDataPage title="Recipe Categories" singular="Category" endpoint="/api/categories" description="Organize recipes into searchable categories."/>;
}
