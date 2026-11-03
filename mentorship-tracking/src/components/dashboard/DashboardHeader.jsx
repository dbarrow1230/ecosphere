import {Button} from "react-bootstrap";
import {UserPlus} from "lucide-react";

function DashboardHeader({onAddMentee}){
 return(
  <header className="mentor-command-header">
   <div>
    <p className="mentor-kicker">Today’s mentorship work</p>
    <h1>Mentor Dashboard</h1>
    <p>See your mentees, schedule, and work requiring attention.</p>
   </div>
   <div className="mentor-header-actions">
    <Button onClick={onAddMentee}><UserPlus size={17}/>Add Mentee</Button>
   </div>
  </header>
 );
}

export default DashboardHeader;
