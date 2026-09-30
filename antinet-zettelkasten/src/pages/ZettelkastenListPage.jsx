import {useEffect,useState} from "react";
import {Alert,Button,Spinner,Table} from "react-bootstrap";
import axios from "axios";

function ZettelkastenListPage({title,eyebrow,endpoint,emptyMessage,columns=[],getDeleteUrl}){
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const loadRows=async()=>{
  setLoading(true);
  setError("");
  try{
   const {data}=await axios.get(endpoint);
   const records=Array.isArray(data)?data:data?.data||data?.items||[];
   setRows(Array.isArray(records)?records:[]);
  }catch(requestError){setError(requestError.response?.data?.message||requestError.message);}
  finally{setLoading(false);}
 };

 useEffect(()=>{loadRows();},[endpoint]);

 const removeRow=async row=>{
  if(!getDeleteUrl)return;
  try{await axios.delete(getDeleteUrl(row));await loadRows();}
  catch(requestError){setError(requestError.response?.data?.message||requestError.message);}
 };

 return <section className="container py-4">
  {eyebrow&&<p className="text-uppercase fw-semibold mb-1">{eyebrow}</p>}
  <h1>{title}</h1>
  {error&&<Alert variant="danger">{error}</Alert>}
  {loading?<Spinner animation="border"/>:<Table responsive hover>
   <thead><tr>{columns.map(column=><th key={column.key}>{column.label}</th>)}{getDeleteUrl&&<th>Actions</th>}</tr></thead>
   <tbody>{rows.length?rows.map(row=><tr key={row._id||row.id}>{columns.map(column=><td key={column.key}>{column.render?column.render(row):row[column.key]??"—"}</td>)}{getDeleteUrl&&<td><Button size="sm" variant="outline-danger" onClick={()=>removeRow(row)}>Delete</Button></td>}</tr>):<tr><td colSpan={columns.length+(getDeleteUrl?1:0)}>{emptyMessage}</td></tr>}</tbody>
  </Table>}
 </section>;
}

export default ZettelkastenListPage;
