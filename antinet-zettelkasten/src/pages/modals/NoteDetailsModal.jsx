// src/pages/modals/NoteDetailsModal.jsx
import {Modal,Button,Spinner,Alert,Row,Col,ListGroup,Card,Badge} from "react-bootstrap";
import RichTextContent from "../../components/RichTextContent.jsx";

function NoteDetailsModal({show,onHide,note,loading,error,onEdit,allNotes=[],onSelectRelatedNote})
{
 const getStatusVariant=(status)=>{
  if(status==="active")
  {
   return "success";
  }

  if(status==="draft")
  {
   return "warning";
  }

  return "secondary";
 };

 const renderValue=(value)=>{
  if(value===undefined||value===null||value==="")
  {
   return "—";
  }

  return value;
 };

 const getTagValues=(tags)=>{
  if(!Array.isArray(tags))
  {
   return [];
  }

  return tags.map(tag=>{
   if(typeof tag==="string")
   {
    return tag;
   }

   return tag?._id||tag?.name||tag?.slug||"";
  }).filter(Boolean);
 };

 const getRelatedNotes=()=>{
  if(!note?._id||!Array.isArray(allNotes))
  {
   return [];
  }

  const currentTagValues=getTagValues(note.tags);
  const currentNotebookId=note.notebook?._id||note.notebook||"";

  return allNotes.filter(relatedNote=>{
   if(!relatedNote?._id||relatedNote._id===note._id)
   {
    return false;
   }

   const relatedNotebookId=relatedNote.notebook?._id||relatedNote.notebook||"";
   const relatedTagValues=getTagValues(relatedNote.tags);

   const sameNotebook=currentNotebookId&&relatedNotebookId&&String(currentNotebookId)===String(relatedNotebookId);
   const sharedTags=currentTagValues.length&&relatedTagValues.some(tagValue=>currentTagValues.includes(tagValue));

   return sameNotebook||sharedTags;
  });
 };

 const relatedNotes=getRelatedNotes();

 return(
  <Modal show={show} onHide={onHide} size="xl" centered scrollable>
   <Modal.Header closeButton>
    <Modal.Title>{note?.title||"Note Details"}</Modal.Title>
   </Modal.Header>

   <Modal.Body className="px-4 py-4">
    {loading?
     <div className="text-center py-5">
      <Spinner animation="border"/>
     </div>
    :error?
     <Alert variant="danger" className="mb-0">{error}</Alert>
    :!note?
     <Alert variant="secondary" className="mb-0">No note selected.</Alert>
    :
     <Row className="g-4">
      <Col lg={8}>
       <Card className="h-100">
        <Card.Body>
         <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
           <h3 className="mb-1">{renderValue(note.title)}</h3>
           <div className="text-muted small">Note ID: {renderValue(note.noteId)}</div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
           <Badge bg={getStatusVariant(note.status)}>{renderValue(note.status)}</Badge>
           {note.isFavorite&&<Badge bg="warning" text="dark">Favorite</Badge>}
           {note.isArchived&&<Badge bg="dark">Archived</Badge>}
          </div>
         </div>

         <div className="mb-4">
          <h5>Summary</h5>
          <RichTextContent value={note.summary||note.mainIdea}/>
         </div>

         <div className="mb-0">
          <h5>Content</h5>
          <RichTextContent value={note.content||note.body}/>
         </div>
        </Card.Body>
       </Card>
      </Col>

      <Col lg={4}>
       <Card className="mb-4">
        <Card.Header>Details</Card.Header>
        <ListGroup variant="flush">
         <ListGroup.Item><strong>Notebook:</strong> {note.notebook?.name||"—"}</ListGroup.Item>
         <ListGroup.Item><strong>Note Type:</strong> {note.noteType?.name||"—"}</ListGroup.Item>
         <ListGroup.Item><strong>User:</strong> {note.user?.username||note.user?.email||"—"}</ListGroup.Item>
         <ListGroup.Item><strong>Created:</strong> {note.createdAt?new Date(note.createdAt).toLocaleString():"—"}</ListGroup.Item>
         <ListGroup.Item><strong>Updated:</strong> {note.updatedAt?new Date(note.updatedAt).toLocaleString():"—"}</ListGroup.Item>
        </ListGroup>
       </Card>

       <Card className="mb-4">
        <Card.Header>Tags</Card.Header>
        <Card.Body>
         {Array.isArray(note.tags)&&note.tags.length?
          <div className="d-flex flex-wrap gap-2">
           {note.tags.map(tag=>(
            <Badge key={tag._id||tag.name||tag} bg="info">
             {tag.name||tag.label||tag.slug||tag}
            </Badge>
           ))}
          </div>
         :
          <div className="text-muted">No tags.</div>
         }
        </Card.Body>
       </Card>

       <Card className="mb-4">
        <Card.Header>Related Notes</Card.Header>
        <Card.Body>
         {relatedNotes.length?
          <ListGroup>
           {relatedNotes.map(relatedNote=>(
            <ListGroup.Item key={relatedNote._id} className="d-flex justify-content-between align-items-center">
             <div>
              <div className="fw-semibold">{relatedNote.title||"Untitled Note"}</div>
              <div className="small text-muted">{relatedNote.noteId||"—"}</div>
             </div>
             <Button size="sm" variant="outline-primary" onClick={()=>onSelectRelatedNote(relatedNote)}>View</Button>
            </ListGroup.Item>
           ))}
          </ListGroup>
         :
          <div className="text-muted">No related notes.</div>
         }
        </Card.Body>
       </Card>

       <Card className="mb-0">
        <Card.Header>Linked Data</Card.Header>
        <Card.Body>
         <div className="mb-3">
          <h6 className="mb-2">Links</h6>
          {Array.isArray(note.links)&&note.links.length?
           <ListGroup>
            {note.links.map(link=>(
             <ListGroup.Item key={link._id||link.title||link.url}>
              <div className="fw-semibold">{link.title||link.label||"Link"}</div>
              <div className="small text-muted">{link.url||link.type||"—"}</div>
             </ListGroup.Item>
            ))}
           </ListGroup>
          :
           <div className="text-muted">No links.</div>
          }
         </div>

         <div>
          <h6 className="mb-2">References</h6>
          {Array.isArray(note.references)&&note.references.length?
           <ListGroup>
            {note.references.map(reference=>(
             <ListGroup.Item key={reference._id||reference.title}>
              <div className="fw-semibold">{reference.title||"Reference"}</div>
              <div className="small text-muted">{reference.description||"—"}</div>
              <div className="small">Page: {reference.page||"—"}</div>
             </ListGroup.Item>
            ))}
           </ListGroup>
          :
           <div className="text-muted">No references.</div>
          }
         </div>
        </Card.Body>
       </Card>
      </Col>
     </Row>
    }
   </Modal.Body>

   <Modal.Footer>
    {note&&<Button variant="outline-warning" onClick={()=>onEdit(note)}>Edit</Button>}
    <Button variant="secondary" onClick={onHide}>Close</Button>
   </Modal.Footer>
  </Modal>
 );
}

export default NoteDetailsModal;
