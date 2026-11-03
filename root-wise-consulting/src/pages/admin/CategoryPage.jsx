import { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import axios from "axios";
import CategoryForm from "../forms/admin/CategoryForm.jsx";

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Categories</h2>
      <Button className="mb-3" onClick={() => setShowForm(true)}>Add Category</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Description</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat._id}>
              <td>{cat.name}</td>
              <td>{cat.slug}</td>
              <td>{cat.description}</td>
              <td>{cat.isActive ? "Yes" : "No"}</td>
              <td>
                <Button size="sm" variant="primary" onClick={() => handleEdit(cat)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(cat._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => { setShowForm(false); setEditingCategory(null); fetchCategories(); }}
        />
      )}
    </div>
  );
}

export default CategoryPage;