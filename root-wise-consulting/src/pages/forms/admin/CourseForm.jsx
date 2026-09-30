// src/pages/forms/admin/CourseForm.jsx
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function CourseForm({ row, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    if (row) {
      setForm({
        _id: row._id,
        name: row.name || "",
        slug: row.slug || "",
        description: row.description || "",
        isActive: row.isActive !== false
      });
    }
  }, [row]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // delegate save to parent via onSave
    if (onSave) onSave(form);
    onClose();
  };

  return (
    <Modal show onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{form._id ? "Edit Course" : "Add Course"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Slug</Form.Label>
            <Form.Control name="slug" value={form.slug} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Active"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{form._id ? "Update" : "Create"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CourseForm;