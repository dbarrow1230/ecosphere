// src/pages/forms/seeds/tabs/SeedPestDiseaseTab.jsx
import { useEffect, useState } from "react";
import { Alert, Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2, Pencil } from "lucide-react";
import PestForm from "../../pest/pestform.jsx";
import DiseaseForm from "../../diseases/diseaseForm.jsx";

export default function SeedPestDiseaseTab({
  formData,
  updateField,
  pests = [],
  diseases = [],
  user = null
}) {
  const [loadedPests,setLoadedPests]=useState([]);
  const [loadedDiseases,setLoadedDiseases]=useState([]);
  const [showPestForm,setShowPestForm]=useState(false);
  const [showDiseaseForm,setShowDiseaseForm]=useState(false);
  const [editingPest,setEditingPest]=useState(null);
  const [editingDisease,setEditingDisease]=useState(null);
  const [pendingPestIndex,setPendingPestIndex]=useState(null);
  const [pendingDiseaseIndex,setPendingDiseaseIndex]=useState(null);
  const [sectionMessage,setSectionMessage]=useState(null);

  const getId=(item)=>{
    if(!item)return "";
    if(typeof item==="string")return item;
    if(typeof item?.$oid==="string")return item.$oid;
    if(typeof item?._id==="string")return item._id;
    if(typeof item?.id==="string")return item.id;
    if(typeof item?._id?.$oid==="string")return item._id.$oid;
    if(typeof item?.id?.$oid==="string")return item.id.$oid;
    return "";
  };

  const getApiArray=data=>{
    if(Array.isArray(data))return data;
    if(Array.isArray(data?.data))return data.data;
    if(Array.isArray(data?.pests))return data.pests;
    if(Array.isArray(data?.diseases))return data.diseases;
    return [];
  };

  const fetchPestById=async(id,fallback)=>{
    if(!id)return fallback;

    try{
      const res=await fetch(`/api/pests/${id}`);
      const data=await res.json();

      if(!res.ok){
        throw new Error(data.message || "Failed to refresh pest");
      }

      return data;
    }catch(error){
      console.error(error.message);
      return fallback;
    }
  };

  const fetchDiseaseById=async(id,fallback)=>{
    if(!id)return fallback;

    try{
      const res=await fetch(`/api/diseases/${id}`);
      const data=await res.json();

      if(!res.ok){
        throw new Error(data.message || "Failed to refresh disease");
      }

      return data;
    }catch(error){
      console.error(error.message);
      return fallback;
    }
  };

  const availablePests=[
    ...(Array.isArray(loadedPests)?loadedPests:[]),
    ...(Array.isArray(pests)?pests:[])
  ].filter((item,index,array)=>getId(item)&&array.findIndex(row=>getId(row)===getId(item))===index);

  const availableDiseases=[
    ...(Array.isArray(loadedDiseases)?loadedDiseases:[]),
    ...(Array.isArray(diseases)?diseases:[])
  ].filter((item,index,array)=>getId(item)&&array.findIndex(row=>getId(row)===getId(item))===index);

  const pestManagement=Array.isArray(formData.pestManagement) ? formData.pestManagement : [];
  const diseaseManagement=Array.isArray(formData.diseaseManagement) ? formData.diseaseManagement : [];

  useEffect(()=>{
    if(Array.isArray(pests) && pests.length){
      setLoadedPests(pests);
      return;
    }

    let active=true;

    const loadPests=async()=>{
      try{
        const res=await fetch("/api/pests");
        const data=await res.json();

        if(!res.ok){
          throw new Error(data.message || "Failed to load pests");
        }

        if(active){
          setLoadedPests(getApiArray(data));
        }
      }catch(error){
        console.error(error.message);
      }
    };

    loadPests();

    return ()=>{
      active=false;
    };
  },[pests]);

  useEffect(()=>{
    if(Array.isArray(diseases) && diseases.length){
      setLoadedDiseases(diseases);
      return;
    }

    let active=true;

    const loadDiseases=async()=>{
      try{
        const res=await fetch("/api/diseases");
        const data=await res.json();

        if(!res.ok){
          throw new Error(data.message || "Failed to load diseases");
        }

        if(active){
          setLoadedDiseases(getApiArray(data));
        }
      }catch(error){
        console.error(error.message);
      }
    };

    loadDiseases();

    return ()=>{
      active=false;
    };
  },[diseases]);

  const getPestLabel=(item)=>{
    return item?.name || item?.title || item?.label || "";
  };

  const getDiseaseLabel=(item)=>{
    return item?.diseaseName || item?.name || item?.title || item?.label || "";
  };

  const getPestTypeText=(value)=>{
    if(!value)return "";
    if(typeof value==="string")return value;
    return value.pest_type || value.name || value.title || value.label || getId(value);
  };

  const getTreatmentItemText=(item)=>{
    if(!item)return "";
    if(typeof item==="string")return item;

    const parts=[
      item.name,
      item.description,
      item.applicationMethod,
      item.dosage,
      item.frequency,
      item.duration
    ].filter(Boolean);

    return parts.join(" - ");
  };

  const getTreatmentText=(value)=>{
    if(!Array.isArray(value))return "";

    return value.map((item)=>{
      return getTreatmentItemText(item);
    }).filter(Boolean).join(", ");
  };

  const getArrayText=(value)=>{
    if(!Array.isArray(value))return "";

    return value.map((item)=>{
      if(typeof item==="string")return item;
      return item.name || item.description || getId(item);
    }).filter(Boolean).join(", ");
  };

  const findPestForRow=(item)=>{
    const rowId=getId(item?.pest) || getId(item?._id) || getId(item?.id);

    if(rowId){
      const byId=availablePests.find(pest=>getId(pest)===rowId);
      if(byId)return byId;
    }

    const rowName=(item?.name || "").trim().toLowerCase();

    if(rowName){
      const byName=availablePests.find(pest=>(pest?.name || "").trim().toLowerCase()===rowName);
      if(byName)return byName;
    }

    return null;
  };

  const findDiseaseForRow=(item)=>{
    const rowId=getId(item?.disease) || getId(item?._id) || getId(item?.id);

    if(rowId){
      const byId=availableDiseases.find(disease=>getId(disease)===rowId);
      if(byId)return byId;
    }

    const rowName=(item?.diseaseName || item?.name || "").trim().toLowerCase();

    if(rowName){
      const byName=availableDiseases.find(disease=>(disease?.diseaseName || disease?.name || "").trim().toLowerCase()===rowName);
      if(byName)return byName;
    }

    return null;
  };

  const getPestRowId=(item)=>{
    const selected=findPestForRow(item);
    return getId(selected) || getId(item?.pest) || "";
  };

  const getDiseaseRowId=(item)=>{
    const selected=findDiseaseForRow(item);
    return getId(selected) || getId(item?.disease) || "";
  };

  const buildPestItem=(selected)=>{
    return {
      pest:getId(selected),
      isNew:false
    };
  };

  const buildDiseaseItem=(selected)=>{
    return {
      disease:getId(selected),
      isNew:false
    };
  };

  const buildPestDisplay=(selected)=>{
    return {
      pest:getId(selected),
      name:selected?.name || "",
      description:selected?.description || "",
      type:getPestTypeText(selected?.type),
      category:selected?.category || "",
      treatment:selected?.treatmentText || getTreatmentText(selected?.treatment),
      prevention:selected?.prevention || "",
      isNew:false
    };
  };

  const buildDiseaseDisplay=(selected)=>{
    return {
      disease:getId(selected),
      diseaseName:selected?.diseaseName || "",
      scientificName:selected?.scientificName || "",
      diseaseType:selected?.diseaseType || selected?.type || "",
      category:selected?.category || "",
      description:selected?.description || "",
      cause:selected?.cause || "",
      symptoms:getArrayText(selected?.symptoms),
      affectedParts:getArrayText(selected?.affectedParts),
      spreadMethod:selected?.spreadMethod || "",
      favorableConditions:selected?.favorableConditions || "",
      prevention:getArrayText(selected?.prevention),
      treatments:selected?.treatment || getTreatmentText(selected?.treatments),
      organicTreatment:getArrayText(selected?.organicTreatment),
      chemicalTreatment:getArrayText(selected?.chemicalTreatment),
      severity:selected?.severity || "moderate",
      isContagious:!!selected?.isContagious,
      isNew:false
    };
  };

  const getPestRowDisplay=(item)=>{
    const selected=findPestForRow(item);

    if(selected && !item.isNew){
      return buildPestDisplay(selected);
    }

    return {
      pest:getId(item?.pest) || "",
      name:item?.name || "",
      description:item?.description || "",
      type:item?.type || "",
      category:item?.category || "",
      treatment:item?.treatment || "",
      prevention:item?.prevention || "",
      isNew:!!item?.isNew
    };
  };

  const getDiseaseRowDisplay=(item)=>{
    const selected=findDiseaseForRow(item);

    if(selected && !item.isNew){
      return buildDiseaseDisplay(selected);
    }

    return {
      disease:getId(item?.disease) || "",
      diseaseName:item?.diseaseName || "",
      scientificName:item?.scientificName || "",
      diseaseType:item?.diseaseType || item?.type || "",
      category:item?.category || "",
      description:item?.description || "",
      cause:item?.cause || "",
      symptoms:item?.symptoms || "",
      affectedParts:item?.affectedParts || "",
      spreadMethod:item?.spreadMethod || "",
      favorableConditions:item?.favorableConditions || "",
      prevention:item?.prevention || "",
      treatments:item?.treatments || "",
      organicTreatment:item?.organicTreatment || "",
      chemicalTreatment:item?.chemicalTreatment || "",
      severity:item?.severity || "moderate",
      isContagious:!!item?.isContagious,
      isNew:!!item?.isNew
    };
  };

  const addPest=()=>{
    setSectionMessage(null);
    updateField("pestManagement",[...pestManagement,{pest:"",name:"",description:"",type:"",category:"",treatment:"",prevention:"",isNew:false}]);
  };

  const addDisease=()=>{
    setSectionMessage(null);
    updateField("diseaseManagement",[...diseaseManagement,{disease:"",diseaseName:"",scientificName:"",diseaseType:"",category:"",description:"",cause:"",symptoms:"",affectedParts:"",spreadMethod:"",favorableConditions:"",prevention:"",treatments:"",organicTreatment:"",chemicalTreatment:"",severity:"moderate",isContagious:false,isNew:false}]);
  };

  const updatePest=(index,key,value)=>{
    const list=[...pestManagement];
    list[index]={...(list[index] || {}),[key]:value};
    updateField("pestManagement",list);
  };

  const updateDisease=(index,key,value)=>{
    const list=[...diseaseManagement];
    list[index]={...(list[index] || {}),[key]:value};
    updateField("diseaseManagement",list);
  };

  const removePest=(index)=>{
    const list=[...pestManagement];
    list.splice(index,1);
    updateField("pestManagement",list);
  };

  const removeDisease=(index)=>{
    const list=[...diseaseManagement];
    list.splice(index,1);
    updateField("diseaseManagement",list);
  };

  const selectPest=(index,value)=>{
    setSectionMessage(null);
    const list=[...pestManagement];

    if(value==="new"){
      setPendingPestIndex(index);
      setEditingPest(null);
      setShowPestForm(true);
      return;
    }

    if(!value){
      list[index]={pest:"",name:"",description:"",type:"",category:"",treatment:"",prevention:"",isNew:false};
      updateField("pestManagement",list);
      return;
    }

    const selected=availablePests.find(item=>getId(item)===value);

    list[index]=selected ? buildPestItem(selected) : {
      pest:value,
      name:"",
      description:"",
      type:"",
      category:"",
      treatment:"",
      prevention:"",
      isNew:false
    };

    updateField("pestManagement",list);
  };

  const selectDisease=(index,value)=>{
    setSectionMessage(null);
    const list=[...diseaseManagement];

    if(value==="new"){
      setPendingDiseaseIndex(index);
      setEditingDisease(null);
      setShowDiseaseForm(true);
      return;
    }

    if(!value){
      list[index]={disease:"",diseaseName:"",scientificName:"",diseaseType:"",category:"",description:"",cause:"",symptoms:"",affectedParts:"",spreadMethod:"",favorableConditions:"",prevention:"",treatments:"",organicTreatment:"",chemicalTreatment:"",severity:"moderate",isContagious:false,isNew:false};
      updateField("diseaseManagement",list);
      return;
    }

    const selected=availableDiseases.find(item=>getId(item)===value);

    list[index]=selected ? buildDiseaseItem(selected) : {
      disease:value,
      diseaseName:"",
      scientificName:"",
      diseaseType:"",
      category:"",
      description:"",
      cause:"",
      symptoms:"",
      affectedParts:"",
      spreadMethod:"",
      favorableConditions:"",
      prevention:"",
      treatments:"",
      organicTreatment:"",
      chemicalTreatment:"",
      severity:"moderate",
      isContagious:false,
      isNew:false
    };

    updateField("diseaseManagement",list);
  };

  const openPestEditor=(item)=>{
    const selected=findPestForRow(item);

    if(!selected)return;

    setEditingPest(selected);
    setPendingPestIndex(null);
    setSectionMessage(null);
    setShowPestForm(true);
  };

  const openDiseaseEditor=(item)=>{
    const selected=findDiseaseForRow(item);

    if(!selected)return;

    setEditingDisease(selected);
    setPendingDiseaseIndex(null);
    setSectionMessage(null);
    setShowDiseaseForm(true);
  };

  const handlePestSaved=async(saved)=>{
    if(!saved)return;

    const savedId=getId(saved);
    const refreshed=await fetchPestById(savedId,saved);
    const updatedRow=buildPestItem(refreshed);

    setShowPestForm(false);
    setEditingPest(null);

    setLoadedPests(prev=>{
      const list=Array.isArray(prev)?[...prev]:[];
      const index=list.findIndex(item=>getId(item)===savedId);

      if(index>=0){
        list[index]=refreshed;
      }else{
        list.unshift(refreshed);
      }

      return list;
    });

    const index=pendingPestIndex !== null ? pendingPestIndex : pestManagement.findIndex(item=>{
      const itemId=getId(item?.pest) || getId(item?._id) || getId(item?.id);
      const itemName=(item?.name || "").trim().toLowerCase();
      const savedName=(refreshed?.name || "").trim().toLowerCase();

      return itemId===savedId || (!!itemName && itemName===savedName);
    });

    if(index>=0){
      const list=[...pestManagement];
      list[index]=updatedRow;
      updateField("pestManagement",list);
    }

    setPendingPestIndex(null);
    setSectionMessage({
      variant:"success",
      text:editingPest ? "Pest updated. Pest management refreshed." : "Pest created and attached to this seed."
    });
  };

  const handleDiseaseSaved=async(saved)=>{
    if(!saved)return;

    const savedId=getId(saved);
    const refreshed=await fetchDiseaseById(savedId,saved);
    const updatedRow=buildDiseaseItem(refreshed);

    setShowDiseaseForm(false);
    setEditingDisease(null);

    setLoadedDiseases(prev=>{
      const list=Array.isArray(prev)?[...prev]:[];
      const index=list.findIndex(item=>getId(item)===savedId);

      if(index>=0){
        list[index]=refreshed;
      }else{
        list.unshift(refreshed);
      }

      return list;
    });

    const index=pendingDiseaseIndex !== null ? pendingDiseaseIndex : diseaseManagement.findIndex(item=>{
      const itemId=getId(item?.disease) || getId(item?._id) || getId(item?.id);
      const itemName=(item?.diseaseName || item?.name || "").trim().toLowerCase();
      const savedName=(refreshed?.diseaseName || refreshed?.name || "").trim().toLowerCase();

      return itemId===savedId || (!!itemName && itemName===savedName);
    });

    if(index>=0){
      const list=[...diseaseManagement];
      list[index]=updatedRow;
      updateField("diseaseManagement",list);
    }

    setPendingDiseaseIndex(null);
    setSectionMessage({
      variant:"success",
      text:editingDisease ? "Disease updated. Disease management refreshed." : "Disease created and attached to this seed."
    });
  };

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="mb-3">Pest and Disease Management</h5>

          {sectionMessage && (
            <Alert
              variant={sectionMessage.variant}
              dismissible
              onClose={()=>setSectionMessage(null)}
              className="mb-3"
            >
              {sectionMessage.text}
            </Alert>
          )}

          <Row className="g-3">
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Pest Management</h6>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addPest}
                >
                  <Plus size={15} />
                  Add Pest
                </Button>
              </div>

              {pestManagement.length === 0 ? (
                <div className="text-muted small">No pest management items added.</div>
              ) : (
                <Row className="g-2">
                  {pestManagement.map((item,index)=>{
                    const display=getPestRowDisplay(item);
                    const selectedPest=findPestForRow(item);

                    return (
                      <Col xs={12} key={index}>
                        <Card className="border">
                          <Card.Body>
                            <Row className="g-2">
                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Pest</InputGroup.Text>
                                  <Form.Select
                                    value={item.isNew ? "new" : getPestRowId(item)}
                                    onChange={(e)=>selectPest(index,e.target.value)}
                                  >
                                    <option value="">Select pest</option>
                                    {availablePests.map((pest)=>(
                                      <option key={getId(pest)} value={getId(pest)}>
                                        {getPestLabel(pest)}
                                      </option>
                                    ))}
                                    <option value="new">Create New Reusable Pest</option>
                                  </Form.Select>
                                </InputGroup>
                              </Col>

                              {!item.isNew && (
                                <Col xs={12}>
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline-primary"
                                      size="sm"
                                      className="d-inline-flex align-items-center gap-1"
                                      disabled={!selectedPest}
                                      onClick={()=>openPestEditor(item)}
                                    >
                                      <Pencil size={15} />
                                      Edit Pest
                                    </Button>
                                  </div>
                                </Col>
                              )}

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Name</InputGroup.Text>
                                  <Form.Control
                                    value={display.name || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updatePest(index,"name",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Type</InputGroup.Text>
                                  <Form.Control
                                    value={display.type || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updatePest(index,"type",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Category</InputGroup.Text>
                                  <Form.Control
                                    value={display.category || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updatePest(index,"category",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Treatment</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.treatment || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updatePest(index,"treatment",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Prevention</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.prevention || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updatePest(index,"prevention",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Description</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.description || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updatePest(index,"description",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  className="d-inline-flex align-items-center gap-1"
                                  onClick={()=>removePest(index)}
                                >
                                  <Trash2 size={15} />
                                  Remove
                                </Button>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Col>

            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Disease Management</h6>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addDisease}
                >
                  <Plus size={15} />
                  Add Disease
                </Button>
              </div>

              {diseaseManagement.length === 0 ? (
                <div className="text-muted small">No disease management items added.</div>
              ) : (
                <Row className="g-2">
                  {diseaseManagement.map((item,index)=>{
                    const display=getDiseaseRowDisplay(item);
                    const selectedDisease=findDiseaseForRow(item);

                    return (
                      <Col xs={12} key={index}>
                        <Card className="border">
                          <Card.Body>
                            <Row className="g-2">
                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Disease</InputGroup.Text>
                                  <Form.Select
                                    value={item.isNew ? "new" : getDiseaseRowId(item)}
                                    onChange={(e)=>selectDisease(index,e.target.value)}
                                  >
                                    <option value="">Select disease</option>
                                    {availableDiseases.map((disease)=>(
                                      <option key={getId(disease)} value={getId(disease)}>
                                        {getDiseaseLabel(disease)}
                                      </option>
                                    ))}
                                    <option value="new">Create New Reusable Disease</option>
                                  </Form.Select>
                                </InputGroup>
                              </Col>

                              {!item.isNew && (
                                <Col xs={12}>
                                  <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline-primary"
                                      size="sm"
                                      className="d-inline-flex align-items-center gap-1"
                                      disabled={!selectedDisease}
                                      onClick={()=>openDiseaseEditor(item)}
                                    >
                                      <Pencil size={15} />
                                      Edit Disease
                                    </Button>
                                  </div>
                                </Col>
                              )}

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Disease Name</InputGroup.Text>
                                  <Form.Control
                                    value={display.diseaseName || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"diseaseName",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Scientific Name</InputGroup.Text>
                                  <Form.Control
                                    value={display.scientificName || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"scientificName",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Disease Type</InputGroup.Text>
                                  <Form.Control
                                    value={display.diseaseType || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"diseaseType",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Category</InputGroup.Text>
                                  <Form.Control
                                    value={display.category || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"category",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Description</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.description || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"description",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Cause</InputGroup.Text>
                                  <Form.Control
                                    value={display.cause || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"cause",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Symptoms</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.symptoms || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"symptoms",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Affected Parts</InputGroup.Text>
                                  <Form.Control
                                    value={display.affectedParts || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"affectedParts",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Spread Method</InputGroup.Text>
                                  <Form.Control
                                    value={display.spreadMethod || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"spreadMethod",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Favorable Conditions</InputGroup.Text>
                                  <Form.Control
                                    value={display.favorableConditions || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"favorableConditions",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Prevention</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.prevention || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"prevention",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Treatments</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.treatments || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"treatments",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Organic Treatment</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.organicTreatment || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"organicTreatment",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Chemical Treatment</InputGroup.Text>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={display.chemicalTreatment || ""}
                                    readOnly={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"chemicalTreatment",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col md={6}>
                                <InputGroup>
                                  <InputGroup.Text className="fw-bold">Severity</InputGroup.Text>
                                  <Form.Select
                                    value={display.severity || "moderate"}
                                    disabled={!item.isNew}
                                    onChange={(e)=>updateDisease(index,"severity",e.target.value)}
                                  >
                                    <option value="low">Low</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="high">High</option>
                                    <option value="severe">Severe</option>
                                  </Form.Select>
                                </InputGroup>
                              </Col>

                              <Col md={6}>
                                <Form.Check
                                  type="checkbox"
                                  label="Contagious"
                                  checked={!!display.isContagious}
                                  disabled={!item.isNew}
                                  onChange={(e)=>updateDisease(index,"isContagious",e.target.checked)}
                                />
                              </Col>

                              <Col xs={12}>
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  className="d-inline-flex align-items-center gap-1"
                                  onClick={()=>removeDisease(index)}
                                >
                                  <Trash2 size={15} />
                                  Remove
                                </Button>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <PestForm
        show={showPestForm}
        onHide={()=>{
          setShowPestForm(false);
          setEditingPest(null);
          setPendingPestIndex(null);
        }}
        onSuccess={handlePestSaved}
        editId={editingPest?._id || null}
        initialData={editingPest}
        mode={editingPest ? "edit" : "add"}
        user={user}
      />

      <DiseaseForm
        show={showDiseaseForm}
        onHide={()=>{
          setShowDiseaseForm(false);
          setEditingDisease(null);
          setPendingDiseaseIndex(null);
        }}
        onSuccess={handleDiseaseSaved}
        editId={editingDisease?._id || null}
        initialData={editingDisease}
        mode={editingDisease ? "edit" : "add"}
      />
    </>
  );
}
