// src/components/BackupForm.jsx

import {useEffect,useState} from "react";
import { Button, Form, Spinner } from "react-bootstrap";

const BackupForm = ({onSubmit,saving=false,defaultBackupLocation=""}) => {
  const [backupType, setBackupType] = useState("full");
  const [backupLocation,setBackupLocation]=useState(defaultBackupLocation);

  useEffect(()=>{
   if(defaultBackupLocation)queueMicrotask(()=>setBackupLocation(current=>current||defaultBackupLocation));
  },[defaultBackupLocation]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      backupType,
      backupLocation,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="backupType">
        <Form.Label>Backup Type</Form.Label>

        <Form.Select
          name="backupType"
          value={backupType}
          onChange={(event) => setBackupType(event.target.value)}
          disabled={saving}
          required
        >
          <option value="full">Full Backup</option>
          <option value="notes">Notes</option>
          <option value="favorites">Favorites</option>
          <option value="archived">Archived Notes</option>
          <option value="tags">Tags</option>
        </Form.Select>

        <Form.Text className="text-muted">
          Select the data you want included in the backup.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="backupLocation">
       <Form.Label>Backup Location</Form.Label>
       <Form.Control type="text" name="backupLocation" value={backupLocation} onChange={event=>setBackupLocation(event.target.value)} disabled={saving} required/>
      </Form.Group>

      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
            Creating Backup
          </>
        ) : (
          "Create Backup"
        )}
      </Button>
    </Form>
  );
};

export default BackupForm;
