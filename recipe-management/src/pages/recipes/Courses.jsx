import ReferenceDataPage from "./ReferenceDataPage.jsx";

export default function Courses(){
 return <ReferenceDataPage title="Courses" singular="Course" endpoint="/api/courses" description="Manage recipe courses such as appetizer, main course, side, and dessert."/>;
}
