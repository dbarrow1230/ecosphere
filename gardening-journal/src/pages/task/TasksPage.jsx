// src/pages/tasks/TasksPage.jsx
import {useEffect,useState} from "react";
import {Button,Card,Col,Form,Modal,Row,Spinner,Table,Badge} from "react-bootstrap";
import axios from "axios";

const defaultForm={
	name:"",
	description:"",
	dueDate:"",
	status:"",
	priority:"",
	remindAt:"",
	message:"",
	reminderId:""
};

function TasksPage(){

	const [tasks,setTasks]=useState([]);
	const [statuses,setStatuses]=useState([]);
	const [priorities,setPriorities]=useState([]);
	const [filters,setFilters]=useState({search:"",status:"",priority:""});
	const [form,setForm]=useState(defaultForm);
	const [editId,setEditId]=useState("");
	const [deleteId,setDeleteId]=useState("");
	const [showFormModal,setShowFormModal]=useState(false);
	const [showDeleteModal,setShowDeleteModal]=useState(false);
	const [loading,setLoading]=useState(false);
	const [saving,setSaving]=useState(false);
	const [deleting,setDeleting]=useState(false);

	const toDateTimeLocal=(value)=>{
		if(!value)return "";
		const d=new Date(value);
		if(Number.isNaN(d.getTime()))return "";
		const offset=d.getTimezoneOffset();
		const local=new Date(d.getTime()-offset*60000);
		return local.toISOString().slice(0,16);
	};

	const resetForm=()=>{
		setForm(defaultForm);
		setEditId("");
	};

	const fetchRefs=async()=>{
		const [statusRes,priorityRes]=await Promise.all([
			axios.get("/api/task-statuses"),
			axios.get("/api/task-priorities")
		]);
		setStatuses(Array.isArray(statusRes.data)?statusRes.data:statusRes.data?.items||[]);
		setPriorities(Array.isArray(priorityRes.data)?priorityRes.data:priorityRes.data?.items||[]);
	};

	const fetchTasks=async()=>{
		try{
			setLoading(true);
			const params={};
			if(filters.search)params.search=filters.search;
			if(filters.status)params.status=filters.status;
			if(filters.priority)params.priority=filters.priority;
			const {data}=await axios.get("/api/tasks",{params});
			setTasks(Array.isArray(data)?data:data?.tasks||[]);
		}catch(error){
			console.error(error);
			setTasks([]);
		}finally{
			setLoading(false);
		}
	};

	useEffect(()=>{
		fetchRefs();
		fetchTasks();
	},[]);

	const handleFilterChange=(e)=>{
		const {name,value}=e.target;
		setFilters(prev=>({...prev,[name]:value}));
	};

	const handleFormChange=(e)=>{
		const {name,value}=e.target;
		setForm(prev=>({...prev,[name]:value}));
	};

	const handleFilterSubmit=(e)=>{
		e.preventDefault();
		fetchTasks();
	};

	const openAddModal=()=>{
		resetForm();
		setShowFormModal(true);
	};

	const openEditModal=async(taskId)=>{
		try{
			setLoading(true);
			const {data}=await axios.get(`/api/tasks/${taskId}`);
			const task=data?.task||data;
			const reminder=Array.isArray(data?.reminders)&&data.reminders.length?data.reminders[0]:null;
			setEditId(task?._id||"");
			setForm({
				name:task?.name||"",
				description:task?.description||"",
				dueDate:toDateTimeLocal(task?.dueDate),
				status:task?.status||"",
				priority:task?.priority||"",
				remindAt:toDateTimeLocal(reminder?.remindAt),
				message:reminder?.message||"",
				reminderId:reminder?._id||""
			});
			setShowFormModal(true);
		}catch(error){
			console.error(error);
		}finally{
			setLoading(false);
		}
	};

	const handleSubmit=async(e)=>{
		e.preventDefault();
		try{
			setSaving(true);
			const payload={
				name:form.name,
				description:form.description,
				dueDate:form.dueDate||null,
				status:form.status||undefined,
				priority:form.priority||undefined,
				remindAt:form.remindAt||undefined,
				message:form.message,
				reminderId:form.reminderId||undefined
			};
			if(editId){
				await axios.put(`/api/tasks/${editId}`,payload);
			}else{
				await axios.post("/api/tasks",payload);
			}
			setShowFormModal(false);
			resetForm();
			fetchTasks();
		}catch(error){
			console.error(error);
		}finally{
			setSaving(false);
		}
	};

	const openDeleteModal=(id)=>{
		setDeleteId(id);
		setShowDeleteModal(true);
	};

	const handleDelete=async()=>{
		try{
			setDeleting(true);
			await axios.delete(`/api/tasks/${deleteId}`);
			setShowDeleteModal(false);
			setDeleteId("");
			fetchTasks();
		}catch(error){
			console.error(error);
		}finally{
			setDeleting(false);
		}
	};

	return(
		<div className="container py-4">
			<Row className="g-3 mb-3">
				<Col xs={12}>
					<div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
						<h2 className="mb-0">Tasks</h2>
						<Button onClick={openAddModal}>Add Task</Button>
					</div>
				</Col>

				<Col xs={12}>
					<Card>
						<Card.Body>
							<Form onSubmit={handleFilterSubmit}>
								<Row className="g-2">
									<Col md={4}>
										<Form.Control name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search tasks"/>
									</Col>
									<Col md={3}>
										<Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
											<option value="">All Statuses</option>
											{statuses.map(item=>(
												<option key={item._id} value={item.name}>{item.name}</option>
											))}
										</Form.Select>
									</Col>
									<Col md={3}>
										<Form.Select name="priority" value={filters.priority} onChange={handleFilterChange}>
											<option value="">All Priorities</option>
											{priorities.map(item=>(
												<option key={item._id} value={item.name}>{item.name}</option>
											))}
										</Form.Select>
									</Col>
									<Col md={2}>
										<div className="d-grid">
											<Button type="submit">Filter</Button>
										</div>
									</Col>
								</Row>
							</Form>
						</Card.Body>
					</Card>
				</Col>

				<Col xs={12}>
					<Card>
						<Card.Body>
							{loading?(
								<div className="text-center py-4">
									<Spinner animation="border"/>
								</div>
							):(
								<Table responsive hover className="align-middle mb-0">
									<thead>
										<tr>
											<th>Name</th>
											<th>Status</th>
											<th>Priority</th>
											<th>Due Date</th>
											<th style={{width:"140px"}}>Actions</th>
										</tr>
									</thead>
									<tbody>
										{tasks.length?tasks.map(item=>(
											<tr key={item._id}>
												<td>
													<div className="fw-semibold">{item.name}</div>
													{item.description?<div className="text-muted small">{item.description}</div>:null}
												</td>
												<td><Badge bg="secondary">{item.status||"-"}</Badge></td>
												<td><Badge bg="dark">{item.priority||"-"}</Badge></td>
												<td>{item.dueDate?new Date(item.dueDate).toLocaleString():"-"}</td>
												<td>
													<div className="d-flex gap-2">
														<Button size="sm" variant="outline-primary" onClick={()=>openEditModal(item._id)}>Edit</Button>
														<Button size="sm" variant="outline-danger" onClick={()=>openDeleteModal(item._id)}>Delete</Button>
													</div>
												</td>
											</tr>
										)):(
											<tr>
												<td colSpan="5" className="text-center py-4">No tasks found.</td>
											</tr>
										)}
									</tbody>
								</Table>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Modal show={showFormModal} onHide={()=>{setShowFormModal(false);resetForm();}} centered backdrop="static">
				<Form onSubmit={handleSubmit}>
					<Modal.Header closeButton>
						<Modal.Title>{editId?"Edit Task":"Add Task"}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Row className="g-3">
							<Col xs={12}>
								<Form.Group>
									<Form.Label>Name</Form.Label>
									<Form.Control name="name" value={form.name} onChange={handleFormChange} required/>
								</Form.Group>
							</Col>

							<Col xs={12}>
								<Form.Group>
									<Form.Label>Description</Form.Label>
									<Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleFormChange}/>
								</Form.Group>
							</Col>

							<Col md={6}>
								<Form.Group>
									<Form.Label>Due Date</Form.Label>
									<Form.Control type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleFormChange}/>
								</Form.Group>
							</Col>

							<Col md={6}>
								<Form.Group>
									<Form.Label>Status</Form.Label>
									<Form.Select name="status" value={form.status} onChange={handleFormChange}>
										<option value="">Select Status</option>
										{statuses.map(item=>(
											<option key={item._id} value={item.name}>{item.name}</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>

							<Col md={6}>
								<Form.Group>
									<Form.Label>Priority</Form.Label>
									<Form.Select name="priority" value={form.priority} onChange={handleFormChange}>
										<option value="">Select Priority</option>
										{priorities.map(item=>(
											<option key={item._id} value={item.name}>{item.name}</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>

							<Col xs={12}>
								<hr className="my-1"/>
							</Col>

							<Col md={6}>
								<Form.Group>
									<Form.Label>Remind At</Form.Label>
									<Form.Control type="datetime-local" name="remindAt" value={form.remindAt} onChange={handleFormChange}/>
								</Form.Group>
							</Col>

							<Col md={6}>
								<Form.Group>
									<Form.Label>Reminder Message</Form.Label>
									<Form.Control name="message" value={form.message} onChange={handleFormChange}/>
								</Form.Group>
							</Col>
						</Row>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={()=>{setShowFormModal(false);resetForm();}}>Cancel</Button>
						<Button type="submit" disabled={saving}>{saving?"Saving...":editId?"Update Task":"Create Task"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			<Modal show={showDeleteModal} onHide={()=>setShowDeleteModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Delete Task</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to delete this task?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={()=>setShowDeleteModal(false)}>Cancel</Button>
					<Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting?"Deleting...":"Delete"}</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default TasksPage;