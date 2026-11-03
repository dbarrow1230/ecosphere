import {NavLink,Outlet} from "react-router-dom";
import {CalendarDays,CalendarClock,Clock} from "lucide-react";

export default function SchedulingWorkspace(){
 return <section className="employee-scheduling-workspace"><nav className="employee-scheduling-tabs" aria-label="Employee scheduling">
  <NavLink to="/scheduling" end><CalendarDays size={18}/> Weekly schedules</NavLink>
  <NavLink to="/scheduling/calendar"><CalendarClock size={18}/> Calendar</NavLink>
  <NavLink to="/scheduling/availability"><Clock size={18}/> Availability</NavLink>
 </nav><Outlet/></section>;
}
