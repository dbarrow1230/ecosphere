// src/pages/forms/TaskForm.jsx
import {useState} from "react";
import {Form,Button,Row,Col,Card} from "react-bootstrap";
import axios from "axios";

export default function TaskForm(){

 const [form,setForm]=useState({
  name:"",
  description:"",
  dueDate:"",
  status:"pending",
  priority:"normal",
  remindAt:"",
  message:""
 });

 const handleChange=(e)=>{
  setForm({...form,[e.target.name]:e.target.value});
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();
  await axios.post("/api/tasks",form);
 };

 return(
  <Row className="justify-content-center">
   <Col md={10} lg={8}>
    <Card className="shadow-sm">
     <Card.Body>
      <h3 className="mb-4">Create Task</h3>

      <Form onSubmit={handleSubmit}>
       <Row className="g-3">

        <Col md={6}>
         <Form.Group>
          <Form.Label>Task Name</Form.Label>
          <Form.Control
           name="name"
           value={form.name}
           onChange={handleChange}
           required
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>Due Date</Form.Label>
          <Form.Control
           type="date"
           name="dueDate"
           value={form.dueDate}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col md={12}>
         <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
           as="textarea"
           rows={3}
           name="description"
           value={form.description}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select name="status" value={form.status} onChange={handleChange}>
           <option value="pending">Pending</option>
           <option value="in_progress">In Progress</option>
           <option value="completed">Completed</option>
           <option value="cancelled">Cancelled</option>
          </Form.Select>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>Priority</Form.Label>
          <Form.Select name="priority" value={form.priority} onChange={handleChange}>
           <option value="low">Low</option>
           <option value="normal">Normal</option>
           <option value="high">High</option>
          </Form.Select>
         </Form.Group>
        </Col>

        {/* Reminder Section */}
        <Col md={12}>
         <hr/>
         <h5>Reminder</h5>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>Remind At</Form.Label>
          <Form.Control
           type="datetime-local"
           name="remindAt"
           value={form.remindAt}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group>
          <Form.Label>Message</Form.Label>
          <Form.Control
           name="message"
           value={form.message}
           onChange={handleChange}
          />
         </Form.Group>
        </Col>

        <Col md={12}>
         <Button type="submit" className="mt-3">
          Create Task
         </Button>
        </Col>

       </Row>
      </Form>
     </Card.Body>
    </Card>
   </Col>
  </Row>
 );
}