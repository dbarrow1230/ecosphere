import { useState, useEffect } from 'react';
import { api, money } from "../../utils/api.js";
import { useStudio } from "../../utils/studioContext.jsx";
import { resourceLabels } from "../../utils/records.js";
import { Modal, Form } from 'react-bootstrap';
import ResourceForm from "../forms/admin/ResourceForm.jsx";
export default function ResourcePage({
  kind
}) {
  const {
      data,
      run,
      busy,
      archive,
      setError
    } = useStudio(),
    [records, setRecords] = useState([]),
    [resource, setResource] = useState(null),
    [show, setShow] = useState(false),
    [search, setSearch] = useState(''),
    ingredients = data.ingredients;
  useEffect(() => {
    let active = true;
    api('/api/studio/resources/' + kind).then(rows => {
      if (active) setRecords(rows);
    }).catch(e => setError(e.message));
    return () => {
      active = false;
    };
  }, [kind, data]);
  const filtered = rows => rows.filter(row => (row.name + ' ' + (row.category || '')).toLowerCase().includes(search.toLowerCase()));
  const setResourceForEdit = row => {
    setResource(row);
    setShow(true);
  };
  const save = async row => {
    const ok = await run(async () => {
      await api('/api/studio/resources/' + kind + (row._id ? '/' + row._id : ''), row, row._id ? 'PUT' : 'POST');
      return 'Record saved.';
    });
    if (ok) setShow(false);
  };
  return <><header className="page-heading"><h1>{resourceLabels[kind]}</h1><button className="btn btn-primary" onClick={() => {
        setResource(null);
        setShow(true);
      }}>Add Record</button></header><div className="tools"><Form.Group><Form.Label>{"Search records"}</Form.Label><Form.Control value={search ?? ""} onChange={event => setSearch(event.target.value)} /></Form.Group></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Category</th>{['herbs', 'spices'].includes(kind) && <><th>Cost / kg</th><th>Stock (g)</th></>}<th>Actions</th></tr></thead><tbody>{filtered(records).map(row => <tr key={row._id}><td>{row.name}</td><td>{row.category}</td>{['herbs', 'spices'].includes(kind) && <><td>{money(row.costPerKg)}</td><td>{ingredients.find(item => item._id === row._id)?.stockGrams || 0}</td></>}<td><button onClick={() => setResourceForEdit(row)}>Edit</button><button onClick={() => archive(`/api/studio/resources/${kind}/${row._id}`, row.name)}>Archive</button></td></tr>)}</tbody></table>{!filtered(records).length && <p className="empty">No records found.</p>}</div><Modal show={show} onHide={() => setShow(false)} size="lg" centered><Modal.Header closeButton><Modal.Title>{resource ? 'Edit' : 'Add'} Record</Modal.Title></Modal.Header><Modal.Body><ResourceForm key={resource?._id || 'new'} kind={kind} initialData={resource} onSubmit={save} onCancel={() => setShow(false)} busy={busy} /></Modal.Body></Modal></>;
}
