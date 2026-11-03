import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from "../../utils/api.js";
import { useStudio } from "../../utils/studioContext.jsx";
import BlendForm from "../forms/BlendForm.jsx";
export default function BlendFormPage() {
  const {
      id
    } = useParams(),
    navigate = useNavigate(),
    {
      data,
      run,
      busy
    } = useStudio();
  const initialData = id ? data.blends.find(row => row._id === id) : null;
  if (id && !initialData) return <><h1>Blend not found</h1><Link to="/blends">Back to Blends</Link></>;
  const save = blend => run(async () => {
    await api('/api/studio/blends' + (id ? '/' + id : ''), blend, id ? 'PUT' : 'POST');
    navigate('/blends');
    return 'Blend saved.';
  });
  return <><header className="page-heading"><h1>{id ? 'Edit Blend' : 'Add Blend'}</h1><Link to="/blends">Back to Blends</Link></header><BlendForm key={id || 'new'} initialData={initialData} ingredients={data.ingredients} onSubmit={save} onCancel={() => navigate('/blends')} busy={busy} /></>;
}
