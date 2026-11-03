// src/pages/forms/seeds/tabs/SpeciesTab.jsx
import { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Form, Button, Modal, InputGroup } from "react-bootstrap";
import { Plus, Trash2, Leaf } from "lucide-react";
import SortedSelect from "../../../../components/SortedSelect.jsx";
import {sortItems} from "../../../../utils/sortItems.js";

export default function SpeciesTab({
  formData,
  updateField,
  speciesOptions = [],
  onSpeciesCreated,
  onSpeciesUpdated
}) {
  const [showSpeciesModal,setShowSpeciesModal]=useState(false);
  const [editingVariety,setEditingVariety]=useState(false);
  const [varietyDraft,setVarietyDraft]=useState([""]);
  const [savingVariety,setSavingVariety]=useState(false);
  const [familyOptions,setFamilyOptions]=useState([]);
  const [genusOptions,setGenusOptions]=useState([]);
  const [newFamily,setNewFamily]=useState({name:"",description:""});
  const [newGenus,setNewGenus]=useState({name:"",description:""});
  const [savingFamily,setSavingFamily]=useState(false);
  const [savingGenus,setSavingGenus]=useState(false);

  const [newSpecies,setNewSpecies]=useState({
    family:"",
    genus:"",
    species:"",
    botanicalName:"",
    commonName:"",
    description:"",
    synonyms:[""],
    variety:[""]
  });

  const getId=value=>{
    if(!value)return "";
    if(typeof value==="string")return value;

    if(typeof value==="object"){
      if(typeof value.$oid==="string")return value.$oid;
      if(typeof value._id==="string")return value._id;
      if(typeof value.id==="string")return value.id;
      if(typeof value._id?.$oid==="string")return value._id.$oid;
      if(typeof value.id?.$oid==="string")return value.id.$oid;
    }

    return "";
  };

  const getText=value=>{
    if(value===undefined || value===null)return "";
    if(typeof value==="string")return value;
    if(typeof value==="number")return String(value);

    if(typeof value==="object"){
      return value.name || value.title || value.label || value.species || value.botanicalName || value.commonName || getId(value) || "";
    }

    return "";
  };

  const getSpeciesLabel=item=>{
    return item?.species || item?.commonName || item?.botanicalName || "Unnamed species";
  };

  const getFamilyLabel=item=>item?.name || "Unnamed family";
  const getGenusLabel=item=>item?.name || "Unnamed genus";

  const selectedSpecies=useMemo(()=>{
    const selectedId=getId(formData.species);
    return speciesOptions.find(item=>getId(item)===selectedId) || null;
  },[speciesOptions,formData.species]);

  const availableGenusOptions=useMemo(()=>{
    if(!newSpecies.family)return genusOptions;

    const matching=genusOptions.filter(genus=>getId(genus.family)===newSpecies.family);
    const unassigned=genusOptions.filter(genus=>!getId(genus.family));
    const selected=genusOptions.filter(genus=>getId(genus)===newSpecies.genus);
    const ids=new Set();

    return [...selected,...matching,...unassigned].filter(genus=>{
      const id=getId(genus);
      if(ids.has(id))return false;
      ids.add(id);
      return true;
    });
  },[genusOptions,newSpecies.family,newSpecies.genus]);

  const getVariety=()=>{
    if(Array.isArray(selectedSpecies?.variety)&&selectedSpecies.variety.length)return selectedSpecies.variety;
    return [];
  };

  useEffect(()=>{
    const currentVariety=Array.isArray(selectedSpecies?.variety) ? selectedSpecies.variety : [];
    setVarietyDraft(currentVariety.length ? currentVariety : [""]);
    setEditingVariety(false);
  },[selectedSpecies]);

  const loadTaxonomyOptions=async()=>{
    const [familyRes,genusRes]=await Promise.all([
      fetch("/api/families"),
      fetch("/api/genus")
    ]);

    const [families,genera]=await Promise.all([
      familyRes.json(),
      genusRes.json()
    ]);

    if(!familyRes.ok)throw new Error(families.message || "Failed to load families");
    if(!genusRes.ok)throw new Error(genera.message || "Failed to load genera");

    setFamilyOptions(Array.isArray(families) ? families : []);
    setGenusOptions(Array.isArray(genera) ? genera : []);
  };

  useEffect(()=>{
    loadTaxonomyOptions().catch(error=>console.error(error));
  },[]);

  const handleSpeciesSelect=value=>{
    updateField("species",value);
  };

  const updateNewSpeciesField=(field,value)=>{
    setNewSpecies(prev=>({...prev,[field]:value}));
  };

  const handleNewFamilySelect=value=>{
    setNewSpecies(prev=>{
      const selectedGenus=genusOptions.find(genus=>getId(genus)===prev.genus);
      const genusFamilyId=getId(selectedGenus?.family);

      return {
        ...prev,
        family:value,
        genus:genusFamilyId&&genusFamilyId!==value ? "" : prev.genus
      };
    });
  };

  const handleNewGenusSelect=value=>{
    const selectedGenus=genusOptions.find(genus=>getId(genus)===value);
    const familyId=getId(selectedGenus?.family);

    setNewSpecies(prev=>({
      ...prev,
      genus:value,
      family:familyId || prev.family
    }));
  };

  const createFamily=async()=>{
    const name=newFamily.name.trim();

    if(!name){
      alert("Family name is required");
      return null;
    }

    setSavingFamily(true);

    try{
      const res=await fetch("/api/families",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name,
          description:newFamily.description.trim()
        })
      });

      const data=await res.json();

      if(!res.ok){
        alert(data.message || "Failed to create family");
        return null;
      }

      setFamilyOptions(prev=>[data,...prev.filter(item=>getId(item)!==getId(data))]);
      setNewSpecies(prev=>({...prev,family:getId(data)}));
      setNewFamily({name:"",description:""});
      return data;
    }catch(error){
      alert(error.message || "Server error");
      return null;
    }finally{
      setSavingFamily(false);
    }
  };

  const createGenus=async()=>{
    const name=newGenus.name.trim();

    if(!name){
      alert("Genus name is required");
      return null;
    }

    setSavingGenus(true);

    try{
      const res=await fetch("/api/genus",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name,
          family:newSpecies.family || null,
          description:newGenus.description.trim()
        })
      });

      const data=await res.json();

      if(!res.ok){
        alert(data.message || "Failed to create genus");
        return null;
      }

      const familyId=getId(data.family);
      setGenusOptions(prev=>[data,...prev.filter(item=>getId(item)!==getId(data))]);
      setNewSpecies(prev=>({
        ...prev,
        genus:getId(data),
        family:familyId || prev.family
      }));
      setNewGenus({name:"",description:""});
      return data;
    }catch(error){
      alert(error.message || "Server error");
      return null;
    }finally{
      setSavingGenus(false);
    }
  };

  const updateNewVariety=(index,value)=>{
    setNewSpecies(prev=>{
      const next=[...(prev.variety || [])];
      next[index]=value;
      return {...prev,variety:next};
    });
  };

  const addNewVariety=()=>{
    setNewSpecies(prev=>({...prev,variety:[...(prev.variety || []),""]}));
  };

  const removeNewVariety=index=>{
    setNewSpecies(prev=>{
      const next=(prev.variety || []).filter((_,i)=>i!==index);
      return {...prev,variety:next.length ? next : [""]};
    });
  };

  const updateNewSynonym=(index,value)=>{
    setNewSpecies(prev=>{
      const next=[...(prev.synonyms || [])];
      next[index]=value;
      return {...prev,synonyms:next};
    });
  };

  const addNewSynonym=()=>{
    setNewSpecies(prev=>({...prev,synonyms:[...(prev.synonyms || []),""]}));
  };

  const removeNewSynonym=index=>{
    setNewSpecies(prev=>{
      const next=(prev.synonyms || []).filter((_,i)=>i!==index);
      return {...prev,synonyms:next.length ? next : [""]};
    });
  };
  const cleanVarietyList=value=>{
    if(!Array.isArray(value))return [];
    return value.map(item=>String(item || "").trim()).filter(Boolean);
  };

  const addSelectedVariety=()=>{
    setEditingVariety(true);
    setVarietyDraft(prev=>{
      const current=editingVariety ? prev : getVariety();
      return [...(current.length ? current : []),""];
    });
  };

  const updateSelectedVariety=(index,value)=>{
    setVarietyDraft(prev=>{
      const next=[...(prev || [])];
      next[index]=value;
      return next;
    });
  };

  const removeSelectedVariety=index=>{
    setVarietyDraft(prev=>{
      const next=(prev || []).filter((_,i)=>i!==index);
      return next.length ? next : [""];
    });
  };

  const cancelSelectedVarietyEdit=()=>{
    const currentVariety=getVariety();
    setVarietyDraft(currentVariety.length ? currentVariety : [""]);
    setEditingVariety(false);
  };

  const saveSelectedVariety=async()=>{
    const speciesId=getId(selectedSpecies);

    if(!speciesId){
      alert("Select a species before adding variety.");
      return;
    }

    setSavingVariety(true);

    try{
      const res=await fetch(`/api/species/${speciesId}/variety`,{
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({variety:cleanVarietyList(varietyDraft)})
      });

      const data=await res.json();

      if(!res.ok){
        alert(data.message || "Failed to update variety");
        return;
      }

      if(onSpeciesUpdated){
        await onSpeciesUpdated(data);
      }

      const savedVariety=Array.isArray(data.variety) ? data.variety : [];
      setVarietyDraft(savedVariety.length ? savedVariety : [""]);
      setEditingVariety(false);
    }catch(error){
      alert(error.message || "Server error");
    }finally{
      setSavingVariety(false);
    }
  };

  const createSpecies=async()=>{
    try{
      const payload={
        family:newSpecies.family,
        genus:newSpecies.genus,
        species:newSpecies.species,
        botanicalName:newSpecies.botanicalName,
        commonName:newSpecies.commonName,
        description:newSpecies.description,
        synonyms:(newSpecies.synonyms || []).map(item=>item.trim()).filter(Boolean),
        variety:(newSpecies.variety || []).map(item=>item.trim()).filter(Boolean)
      };

      const res=await fetch("/api/species",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });

      const data=await res.json();

      if(!res.ok){
        alert(data.message || "Failed to create species");
        return;
      }

      if(onSpeciesCreated){
        onSpeciesCreated(data);
      }

      updateField("species",getId(data));

      setShowSpeciesModal(false);
      setNewSpecies({
        family:"",
        genus:"",
        species:"",
        botanicalName:"",
        commonName:"",
        description:"",
        synonyms:[""],
        variety:[""]
      });
    }catch(error){
      alert(error.message || "Server error");
    }
  };

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <Leaf size={22} className="text-success" />
              <h2 className="h5 mb-0">Species Information</h2>
            </div>

            <Button
              type="button"
              variant="success"
              size="sm"
              className="d-inline-flex align-items-center gap-1"
              onClick={()=>{
                loadTaxonomyOptions().catch(error=>console.error(error));
                setShowSpeciesModal(true);
              }}
            >
              <Plus size={14} />
              Add Species
            </Button>
          </div>

          <Row className="g-3">
            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text className="fw-bold">Species</InputGroup.Text>
                <SortedSelect
                  value={getId(formData.species)}
                  onChange={(e)=>handleSpeciesSelect(e.target.value)}
                  options={speciesOptions}
                  getValue={getId}
                  getLabel={getSpeciesLabel}
                  placeholder="Select species"
                />
              </InputGroup>
            </Col>

            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="fw-bold">Family</InputGroup.Text>
                <Form.Control value={getText(selectedSpecies?.family)} readOnly disabled />
              </InputGroup>
            </Col>

            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="fw-bold">Genus</InputGroup.Text>
                <Form.Control value={getText(selectedSpecies?.genus)} readOnly disabled />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text>Species Name</InputGroup.Text>
                <Form.Control value={selectedSpecies?.species || ""} readOnly disabled />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text>Botanical Name</InputGroup.Text>
                <Form.Control value={selectedSpecies?.botanicalName || ""} readOnly disabled />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text>Common Name</InputGroup.Text>
                <Form.Control value={selectedSpecies?.commonName || ""} readOnly disabled />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text>Description</InputGroup.Text>
                <Form.Control as="textarea" rows={2} value={selectedSpecies?.description || ""} readOnly disabled />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text>Synonyms</InputGroup.Text>
                <Form.Control
                  value={Array.isArray(selectedSpecies?.synonyms) && selectedSpecies.synonyms.length ? selectedSpecies.synonyms.join("; ") : ""}
                  readOnly
                  disabled
                />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <Card className="border">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <strong>Variety</strong>

                  <div className="d-flex align-items-center gap-2">
                    {editingVariety && (
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        onClick={cancelSelectedVarietyEdit}
                        disabled={savingVariety}
                      >
                        Cancel
                      </Button>
                    )}

                    {editingVariety && (
                      <Button
                        type="button"
                        variant="success"
                        size="sm"
                        onClick={saveSelectedVariety}
                        disabled={savingVariety || !selectedSpecies}
                      >
                        {savingVariety ? "Saving..." : "Save Variety"}
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline-success"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1"
                      onClick={addSelectedVariety}
                      disabled={!selectedSpecies || savingVariety}
                    >
                      <Plus size={14} />
                      Add Variety
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body>
                  {editingVariety ? (
                    (varietyDraft.length ? varietyDraft : [""]).map((item,index)=>(
                      <InputGroup className="mb-2" key={index}>
                        <InputGroup.Text className="fw-bold">Variety {index+1}</InputGroup.Text>
                        <Form.Control
                          value={item}
                          onChange={(e)=>updateSelectedVariety(index,e.target.value)}
                          disabled={savingVariety}
                        />

                        <Button
                          type="button"
                          variant="outline-danger"
                          onClick={()=>removeSelectedVariety(index)}
                          disabled={savingVariety}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </InputGroup>
                    ))
                  ) : getVariety().length ? (
                    sortItems(getVariety(),item=>item).map((item,index)=>(
                      <InputGroup className="mb-2" key={index}>
                        <InputGroup.Text className="fw-bold">Variety {index+1}</InputGroup.Text>
                        <Form.Control value={item} readOnly disabled />
                      </InputGroup>
                    ))
                  ) : (
                    <div className="text-muted small">No varieties listed.</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Modal
        show={showSpeciesModal}
        onHide={()=>setShowSpeciesModal(false)}
        size="xl"
        centered
        dialogClassName="species-form-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Species</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Card className="border">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <strong>Family</strong>
                  <Button
                    type="button"
                    variant="outline-success"
                    size="sm"
                    className="d-inline-flex align-items-center gap-1"
                    onClick={createFamily}
                    disabled={savingFamily}
                  >
                    <Plus size={14} />
                    {savingFamily ? "Saving..." : "Add Family"}
                  </Button>
                </Card.Header>

                <Card.Body>
                  <Row className="g-2">
                    <Col md={12}>
                      <InputGroup>
                        <InputGroup.Text className="fw-bold">Select Family</InputGroup.Text>
                        <SortedSelect
                          value={newSpecies.family}
                          onChange={(e)=>handleNewFamilySelect(e.target.value)}
                          options={familyOptions}
                          getValue={getId}
                          getLabel={getFamilyLabel}
                          placeholder="Select existing family"
                        />
                      </InputGroup>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        value={newFamily.name}
                        onChange={(e)=>setNewFamily(prev=>({...prev,name:e.target.value}))}
                        placeholder="New family name"
                      />
                    </Col>
                    <Col md={8}>
                      <Form.Control
                        value={newFamily.description}
                        onChange={(e)=>setNewFamily(prev=>({...prev,description:e.target.value}))}
                        placeholder="Family description"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12}>
              <Card className="border">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <strong>Genus</strong>
                  <Button
                    type="button"
                    variant="outline-success"
                    size="sm"
                    className="d-inline-flex align-items-center gap-1"
                    onClick={createGenus}
                    disabled={savingGenus}
                  >
                    <Plus size={14} />
                    {savingGenus ? "Saving..." : "Add Genus"}
                  </Button>
                </Card.Header>

                <Card.Body>
                  <Row className="g-2">
                    <Col md={12}>
                      <InputGroup>
                        <InputGroup.Text className="fw-bold">Select Genus</InputGroup.Text>
                        <SortedSelect
                          value={newSpecies.genus}
                          onChange={(e)=>handleNewGenusSelect(e.target.value)}
                          options={availableGenusOptions}
                          getValue={getId}
                          getLabel={genus=>`${getGenusLabel(genus)}${getText(genus.family) ? ` (${getText(genus.family)})` : ""}`}
                          placeholder="Select existing genus"
                        />
                      </InputGroup>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        value={newGenus.name}
                        onChange={(e)=>setNewGenus(prev=>({...prev,name:e.target.value}))}
                        placeholder="New genus name"
                      />
                    </Col>
                    <Col md={8}>
                      <Form.Control
                        value={newGenus.description}
                        onChange={(e)=>setNewGenus(prev=>({...prev,description:e.target.value}))}
                        placeholder="Genus description"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text className="fw-bold">Species</InputGroup.Text>
                <Form.Control
                  value={newSpecies.species}
                  onChange={(e)=>updateNewSpeciesField("species",e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text className="fw-bold">Botanical Name</InputGroup.Text>
                <Form.Control
                  value={newSpecies.botanicalName}
                  onChange={(e)=>updateNewSpeciesField("botanicalName",e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text className="fw-bold">Common Name</InputGroup.Text>
                <Form.Control
                  value={newSpecies.commonName}
                  onChange={(e)=>updateNewSpeciesField("commonName",e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col xs={12}>
              <InputGroup>
                <InputGroup.Text className="fw-bold">Description</InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newSpecies.description}
                  onChange={(e)=>updateNewSpeciesField("description",e.target.value)}
                />
              </InputGroup>
            </Col>


            <Col xs={12}>
              <Card className="border">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <strong>Synonyms</strong>

                  <Button
                    type="button"
                    variant="outline-success"
                    size="sm"
                    className="d-inline-flex align-items-center gap-1"
                    onClick={addNewSynonym}
                  >
                    <Plus size={14} />
                    Add Synonym
                  </Button>
                </Card.Header>

                <Card.Body>
                  {(newSpecies.synonyms || [""]).map((item,index)=>(
                    <InputGroup className="mb-2" key={index}>
                      <InputGroup.Text className="fw-bold">Synonym {index+1}</InputGroup.Text>
                      <Form.Control
                        value={item}
                        onChange={(e)=>updateNewSynonym(index,e.target.value)}
                      />

                      <Button
                        type="button"
                        variant="outline-danger"
                        onClick={()=>removeNewSynonym(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </InputGroup>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12}>
              <Card className="border">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <strong>Variety</strong>

                  <Button
                    type="button"
                    variant="outline-success"
                    size="sm"
                    className="d-inline-flex align-items-center gap-1"
                    onClick={addNewVariety}
                  >
                    <Plus size={14} />
                    Add Variety
                  </Button>
                </Card.Header>

                <Card.Body>
                  {(newSpecies.variety || [""]).map((item,index)=>(
                    <InputGroup className="mb-2" key={index}>
                      <InputGroup.Text className="fw-bold">Variety {index+1}</InputGroup.Text>
                      <Form.Control
                        value={item}
                        onChange={(e)=>updateNewVariety(index,e.target.value)}
                      />

                      <Button
                        type="button"
                        variant="outline-danger"
                        onClick={()=>removeNewVariety(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </InputGroup>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={()=>setShowSpeciesModal(false)}>
            Cancel
          </Button>

          <Button type="button" variant="success" onClick={createSpecies}>
            Save Species
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
