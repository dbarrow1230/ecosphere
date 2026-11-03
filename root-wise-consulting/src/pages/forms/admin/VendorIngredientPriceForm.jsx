// src/pages/forms/admin/VendorIngredientPriceForm.jsx
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function VendorIngredientPriceForm({ row, onClose, onSave }) {
  const [form, setForm] = useState({
    business: "",
    vendor: "",
    ingredient: "",
    brand: "",
    packSizeName: "",
    imperialQuantity: null,
    imperialUnit: "",
    metricQuantity: null,
    metricUnit: "",
    packCost: 0,
    unitCost: 0,
    sku: "",
    itemCode: "",
    notes: [],
    effectiveDate: new Date(),
    isPreferred: false,
    isActive: true
  });

  useEffect(() => {
    if (row) setForm({ ...form, ...row });
  }, [row]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (onSave) onSave(form);
    onClose();
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{form._id ? "Edit Vendor Ingredient Price" : "Add Vendor Ingredient Price"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Brand</Form.Label>
            <Form.Control name="brand" value={form.brand} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pack Size</Form.Label>
            <Form.Control name="packSizeName" value={form.packSizeName} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pack Cost</Form.Label>
            <Form.Control type="number" name="packCost" value={form.packCost} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Preferred"
              name="isPreferred"
              checked={form.isPreferred}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Active"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{form._id ? "Update" : "Create"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default VendorIngredientPriceForm;