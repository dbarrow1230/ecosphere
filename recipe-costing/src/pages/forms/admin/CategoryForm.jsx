// src/pages/forms/admin/CategoryForm.jsx
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  isActive: true
};

export default function CategoryForm({ initialData = {}, onSubmit, onSaved, onHide, loading = false }) {
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    ...initialData,
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive !== false
  }));

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saved = await onSubmit?.(form);
    onSaved?.(saved);
  };

  return (
    <Modal show onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{form._id ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required disabled={loading} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Slug</Form.Label>
            <Form.Control name="slug" value={form.slug} onChange={handleChange} disabled={loading} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} disabled={loading} />
          </Form.Group>

          <Form.Check type="checkbox" label="Active" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : form._id ? "Update" : "Create"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
