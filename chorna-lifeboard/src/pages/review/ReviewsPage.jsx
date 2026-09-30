// src/pages/review/ReviewsPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function ReviewsPage(){
 return(
  <LifeboardListPage
   title="Reviews"
   text="View daily, weekly, monthly, quarterly, and yearly reviews."
   endpoint="/api/reviews"
   dataKey="reviews"
   emptyText="No reviews found."
   createPath="/reviews/new"
   createLabel="Add Review"
   filters={[
    {name:"reviewType",label:"Review Type",field:"reviewType",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"quarterly",label:"Quarterly"},
     {value:"yearly",label:"Yearly"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"reviewType",label:"Type"},
    {key:"periodStartDisplay",label:"Start"},
    {key:"periodEndDisplay",label:"End"},
    {key:"completedTasks",label:"Tasks"},
    {key:"completedHabits",label:"Habits"},
    {key:"completedGoals",label:"Goals"}
   ]}
  />
 );
}

export default ReviewsPage;