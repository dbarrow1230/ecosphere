import { useCallback, useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Container, Form, Modal, Spinner, Table } from "react-bootstrap";
import { authUserId, displayValue, splitList, textList } from "./workflowFormUtils.js";
import RichTextEditor from "../components/RichTextEditor.jsx";
import RichTextContent from "../components/RichTextContent.jsx";

const emptyConnection = {
  fromRecordId: "",
  toRecordId: "",
  relationType: "relates to",
  reason: "",
  tags: "",
  status: "active",
};

export default function LinksPage() {
  const userId = authUserId();
  const [connections, setConnections] = useState([]);
  const [zettels, setZettels] = useState([]);
  const [form, setForm] = useState(emptyConnection);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const query = `?userId=${encodeURIComponent(userId)}`;
      const [connectionRes, zettelRes] = await Promise.all([fetch(`/api/connections${query}`), fetch(`/api/zettels${query}`)]);
      const [connectionJson, zettelJson] = await Promise.all([connectionRes.json(), zettelRes.json()]);
      if (!connectionRes.ok) throw new Error(connectionJson?.message || "Unable to load connections");
      setConnections(connectionJson.data || []);
      setZettels(zettelRes.ok ? zettelJson.data || [] : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const zettelById = (id) => zettels.find((zettel) => String(zettel._id) === String(id));
  const zettelLabel = (id) => {
    const zettel = zettelById(id);
    return zettel ? `${zettel.zettelId} - ${zettel.title}` : displayValue(id);
  };

  const openCreate = () => {
    setEditing({});
    setForm(emptyConnection);
  };

  const openEdit = (connection) => {
    setEditing(connection);
    setForm({
      ...emptyConnection,
      ...connection,
      tags: textList(connection.tags),
    });
  };

  const save = async (event) => {
    event.preventDefault();
    if (form.fromRecordId === form.toRecordId) {
      setError("Choose two different zettels.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const id = editing?._id;
      const from = zettelById(form.fromRecordId);
      const to = zettelById(form.toRecordId);
      const payload = {
        ...form,
        userId,
        fromModel: "Zettel",
        toModel: "Zettel",
        fromDisplayId: from?.zettelId || "",
        toDisplayId: to?.zettelId || "",
        tags: splitList(form.tags),
      };
      const response = await fetch(id ? `/api/connections/${id}` : "/api/connections", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to save connection");
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const archive = async (connection) => {
    const response = await fetch(`/api/connections/${connection._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...connection, userId, status: "archived" }),
    });
    if (!response.ok) setError("Unable to archive connection");
    else await load();
  };

  const remove = async (connection) => {
    if (!window.confirm(`Delete ${connection.connectionId}?`)) return;
    const response = await fetch(`/api/connections/${connection._id}?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
    if (!response.ok) setError("Unable to delete connection");
    else await load();
  };

  if (!userId) return <Container className="py-5"><Alert variant="info">Log in to review connections.</Alert></Container>;
  if (loading) return <Container className="py-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between mb-4">
        <div><p className="dashboard-section-kicker mb-1">4. Explain how ideas connect</p><h1>Connections</h1></div>
        <Button onClick={openCreate}>Add connection</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table responsive hover className="workflow-table">
        <thead><tr><th>ID</th><th>From</th><th>Relation</th><th>To</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {connections.map((connection) => (
            <tr key={connection._id}>
              <td className="workflow-id"><Button variant="link" className="p-0 text-decoration-none" onClick={() => setDetail(connection)}><code>{connection.connectionId}</code></Button></td>
              <td>{connection.fromDisplayId || zettelLabel(connection.fromRecordId)}</td>
              <td>{connection.relationType || "--"}</td>
              <td>{connection.toDisplayId || zettelLabel(connection.toRecordId)}</td>
              <td>{connection.status || "--"}</td>
              <td className="workflow-actions">
                <ButtonGroup size="sm">
                  <Button variant="outline-secondary" onClick={() => openEdit(connection)}>Edit</Button>
                  <Button variant="outline-warning" disabled={connection.status === "archived"} onClick={() => archive(connection)}>Archive</Button>
                  <Button variant="outline-danger" onClick={() => remove(connection)}>Delete</Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!connections.length && <Alert variant="light">No connections yet.</Alert>}

      <Modal className="workflow-modal" show={!!editing} onHide={() => setEditing(null)} size="lg" backdrop="static" keyboard={false}>
        <Modal.Header closeButton><Modal.Title>{editing?._id ? "Edit connection" : "Add connection"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={save}>
            <Form.Group className="mb-3"><Form.Label>From zettel</Form.Label><Form.Select required value={form.fromRecordId} onChange={(event) => setForm({ ...form, fromRecordId: event.target.value })}><option value="">Choose zettel</option>{zettels.map((zettel) => <option key={zettel._id} value={zettel._id}>{zettel.zettelId} - {zettel.title}</option>)}</Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>To zettel</Form.Label><Form.Select required value={form.toRecordId} onChange={(event) => setForm({ ...form, toRecordId: event.target.value })}><option value="">Choose zettel</option>{zettels.map((zettel) => <option key={zettel._id} value={zettel._id}>{zettel.zettelId} - {zettel.title}</option>)}</Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Relation type</Form.Label><Form.Control required value={form.relationType} onChange={(event) => setForm({ ...form, relationType: event.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Reason</Form.Label><RichTextEditor value={form.reason} onChange={value=>setForm({...form,reason:value})} placeholder="Explain why these records are connected." minHeight="9rem"/></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Tags</Form.Label><Form.Control value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{["active", "archived"].map((status) => <option key={status}>{status}</option>)}</Form.Select></Form.Group>
            <div className="text-end"><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save connection"}</Button></div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal className="workflow-modal" show={!!detail} onHide={() => setDetail(null)} size="lg">
        <Modal.Header closeButton><Modal.Title>{detail?.connectionId}</Modal.Title></Modal.Header>
        <Modal.Body>{detail && <article className="workflow-record-view"><dl><div><dt>From</dt><dd>{detail.fromDisplayId || zettelLabel(detail.fromRecordId)}</dd></div><div><dt>Relation type</dt><dd>{detail.relationType || "--"}</dd></div><div><dt>To</dt><dd>{detail.toDisplayId || zettelLabel(detail.toRecordId)}</dd></div><div><dt>Tags</dt><dd>{displayValue(detail.tags)}</dd></div><div><dt>Status</dt><dd>{detail.status || "--"}</dd></div></dl><section><h3>Reason</h3><RichTextContent value={detail.reason}/></section></article>}</Modal.Body>
        <Modal.Footer><Button variant="outline-primary" onClick={() => { openEdit(detail); setDetail(null); }}>Edit</Button><Button variant="secondary" onClick={() => setDetail(null)}>Close</Button></Modal.Footer>
      </Modal>
    </Container>
  );
}
