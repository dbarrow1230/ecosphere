import {Badge} from "react-bootstrap";

const variants={
 active:"success",
 complete:"success",
 completed:"success",
 published:"primary",
 reviewed:"primary",
 processed:"info",
 draft:"warning",
 pending:"warning",
 paused:"warning",
 archived:"secondary",
 inactive:"secondary",
 discarded:"danger",
 deleted:"danger"
};

export default function WorkflowStatusBadge({status,empty="—"}){
 const value=String(status||"").trim().toLowerCase();
 return <Badge bg={variants[value]||"secondary"}>{value||empty}</Badge>;
}
