import {Card,ProgressBar} from "react-bootstrap";

export default function ProjectProgress({projects}){
 return <Card className="h-100"><Card.Body><Card.Title>Project Progress</Card.Title>{projects.length?projects.slice(0,5).map(project=><div className="mb-3" key={project._id}><div className="d-flex justify-content-between"><span>{project.name}</span><span>{project.progress||0}%</span></div><ProgressBar now={project.progress||0}/></div>):<p className="text-muted mb-0">No projects yet.</p>}</Card.Body></Card>;
}
