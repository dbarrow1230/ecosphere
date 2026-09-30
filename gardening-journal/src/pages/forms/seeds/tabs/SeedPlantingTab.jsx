// src/pages/forms/seeds/tabs/SeedPlantingTab.jsx
import { useEffect, useState } from "react";
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";
import SortedSelect from "../../../../components/SortedSelect.jsx";
import {sortItems} from "../../../../utils/sortItems.js";

export default function SeedPlantingTab({
  formData,
  updateField,
  plantingSeasons = [],
  seeds = []
}) {
  const [loadedSeeds,setLoadedSeeds]=useState([]);
  const data=formData.plantingInformation || {};
  const startIndoors=data.startIndoors || {};
  const directSow=data.directSowOutdoors || {};
  const availableSeeds=Array.isArray(seeds) && seeds.length ? seeds : loadedSeeds;
  const plantingSeasonValue=Array.isArray(data.plantingSeasons) ? data.plantingSeasons[0] || "" : data.plantingSeasons || "";
  const materialsNeeded=Array.isArray(startIndoors.materialsNeeded) ? startIndoors.materialsNeeded : [];
  const careTips=Array.isArray(startIndoors.careTips) ? startIndoors.careTips : [];
  const companionPlants=Array.isArray(data.companionPlants) ? data.companionPlants : [];
  const coverCrops=Array.isArray(data.coverCrops) ? data.coverCrops : [];
  const trapCrops=Array.isArray(data.trapCrops) ? data.trapCrops : [];
  const guidelines=Array.isArray(directSow.guidelines) ? directSow.guidelines : [];
  const growingFromScraps=Array.isArray(data.growingFromScraps) ? data.growingFromScraps : [];
  const apartmentGardening=Array.isArray(data.apartmentGardening) ? data.apartmentGardening : [];

  useEffect(()=>{
    if(Array.isArray(seeds) && seeds.length)return;

    let active=true;

    const loadSeeds=async()=>{
      try{
        const res=await fetch("/api/seeds");
        const data=await res.json();

        if(!res.ok){
          throw new Error(data.message || "Failed to load seeds");
        }

        if(active){
          setLoadedSeeds(Array.isArray(data) ? data : data.seeds || []);
        }
      }catch(error){
        console.error(error.message);
      }
    };

    loadSeeds();

    return ()=>{
      active=false;
    };
  },[]);

  const getLabel=(item)=>{
    return item.plantName || item.name || item.title || item.label || item.season || "";
  };

  const monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const getMonthName=value=>{
    const month=Number(value);
    if(!Number.isInteger(month)||month<1||month>12)return "";
    return monthNames[month-1];
  };

  const getPlantingSeasonLabel=item=>{
    const name=getLabel(item);
    const seasonName=typeof item?.season==="object" ? getLabel(item.season) : "";
    const monthRange=[
      getMonthName(item?.startMonth),
      getMonthName(item?.endMonth)
    ].filter(Boolean).join("-");
    const windows=[
      item?.indoorStartWeeksBeforeLastFrost!==undefined&&item?.indoorStartWeeksBeforeLastFrost!==null ? `Indoor ${item.indoorStartWeeksBeforeLastFrost}w before frost` : "",
      item?.transplantWeeksAfterLastFrost!==undefined&&item?.transplantWeeksAfterLastFrost!==null ? `Transplant ${item.transplantWeeksAfterLastFrost}w after frost` : "",
      item?.directSowWeeksBeforeLastFrost!==undefined&&item?.directSowWeeksBeforeLastFrost!==null ? `Direct sow ${item.directSowWeeksBeforeLastFrost}w before frost` : "",
      item?.directSowWeeksAfterLastFrost!==undefined&&item?.directSowWeeksAfterLastFrost!==null ? `Direct sow ${item.directSowWeeksAfterLastFrost}w after frost` : "",
      item?.fallPlantingWeeksBeforeFirstFrost!==undefined&&item?.fallPlantingWeeksBeforeFirstFrost!==null ? `Fall ${item.fallPlantingWeeksBeforeFirstFrost}w before frost` : ""
    ].filter(Boolean);
    const details=[seasonName,monthRange,...windows].filter(Boolean).join(" • ");

    return details ? `${name} (${details})` : name;
  };

  const getSeedValue=(item)=>{
    return item?._id || item?.id || item || "";
  };

  const getSelectedValues=(list)=>{
    return list.map(item=>getSeedValue(item)).filter(Boolean);
  };

  const toggleSeed=(path,list,seedId)=>{
    const selectedValues=getSelectedValues(list);

    updateField(
      path,
      selectedValues.includes(seedId)
        ? selectedValues.filter(id=>id!==seedId)
        : [...selectedValues,seedId]
    );
  };

  const addArrayItem=(path,list)=>{
    updateField(path,[...list,""]);
  };

  const updateArrayItem=(path,list,index,value)=>{
    const updated=[...list];
    updated[index]=value;
    updateField(path,updated);
  };

  const removeArrayItem=(path,list,index)=>{
    const updated=[...list];
    updated.splice(index,1);
    updateField(path,updated);
  };

  const renderArrayCard=(title,buttonLabel,itemLabel,path,list)=>{
    return (
      <Card className="border seed-guide-editor-card">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <strong>{title}</strong>

          <Button
            type="button"
            variant="outline-success"
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={()=>addArrayItem(path,list)}
          >
            <Plus size={15} />
            {buttonLabel}
          </Button>
        </Card.Header>

        <Card.Body>
          {list.length === 0 ? (
            <div className="text-muted small">No {title.toLowerCase()} added.</div>
          ) : (
            <Row className="g-2 seed-guide-editor-list">
              {list.map((item,index)=>(
                <Col xs={12} key={index}>
                  <InputGroup className="seed-guide-editor-row">
                    <InputGroup.Text className="fw-bold">{itemLabel} {index+1}</InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={item || ""}
                      onChange={(e)=>updateArrayItem(path,list,index,e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline-danger"
                      className="d-inline-flex align-items-center"
                      onClick={()=>removeArrayItem(path,list,index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </InputGroup>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderSeedCheckboxCard=(title,path,list)=>{
    const selectedValues=getSelectedValues(list);

    return (
      <Card className="border">
        <Card.Header className="bg-white">
          <strong>{title}</strong>
        </Card.Header>

        <Card.Body style={{maxHeight:"330px",overflowY:"auto"}}>
          {availableSeeds.length === 0 ? (
            <div className="text-muted small">No seeds loaded.</div>
          ) : (
            <Row className="g-2">
              {sortItems(availableSeeds,getLabel).map((seed)=>(
                <Col xs={12} key={getSeedValue(seed)}>
                  <Form.Check
                    type="checkbox"
                    id={`${path}-${getSeedValue(seed)}`}
                    label={getLabel(seed)}
                    checked={selectedValues.includes(getSeedValue(seed))}
                    onChange={()=>toggleSeed(path,list,getSeedValue(seed))}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h3 className="mb-3">Planting Information</h3>

        <Row className="g-3">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Planting Seasons</InputGroup.Text>
              <SortedSelect
                value={plantingSeasonValue}
                onChange={(e)=>updateField("plantingInformation.plantingSeasons",e.target.value)}
                options={plantingSeasons}
                getValue={getSeedValue}
                getLabel={getPlantingSeasonLabel}
                placeholder="Select planting season"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <div className="h-100 d-flex align-items-start pt-2">
              <Form.Check
                type="checkbox"
                label="Hydroponic Growth"
                checked={!!data.hydroponicGrowth}
                onChange={(e)=>updateField("plantingInformation.hydroponicGrowth",e.target.checked)}
              />
            </div>
          </Col>

          <Col xs={12}>
            <h5 className="mt-3 mb-0">Start Indoors</h5>
          </Col>

          <Col xs={12}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Timing</InputGroup.Text>
              <Form.Control
                value={startIndoors.timing || ""}
                onChange={(e)=>updateField("plantingInformation.startIndoors.timing",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            {renderArrayCard("Materials Needed","Add Material","Material","plantingInformation.startIndoors.materialsNeeded",materialsNeeded)}
          </Col>

          <Col md={6}>
            {renderArrayCard("Care Tips","Add Tip","Tip","plantingInformation.startIndoors.careTips",careTips)}
          </Col>

          <Col xs={12}>
            <h5 className="mt-3 mb-0">Companion, Cover, and Trap Crops</h5>
          </Col>

          <Col md={4}>
            {renderSeedCheckboxCard("Companion Plants","plantingInformation.companionPlants",companionPlants)}
          </Col>

          <Col md={4}>
            {renderSeedCheckboxCard("Cover Crops","plantingInformation.coverCrops",coverCrops)}
          </Col>

          <Col md={4}>
            {renderSeedCheckboxCard("Trap Crops","plantingInformation.trapCrops",trapCrops)}
          </Col>

          <Col xs={12}>
            <h5 className="mt-3 mb-0">Direct Sow Outdoors</h5>
          </Col>

          <Col xs={12}>
            {renderArrayCard("Guidelines","Add Guideline","Guideline","plantingInformation.directSowOutdoors.guidelines",guidelines)}
          </Col>

          <Col xs={12}>
            {renderArrayCard("Growing From Scraps","Add Item","Item","plantingInformation.growingFromScraps",growingFromScraps)}
          </Col>

          <Col xs={12}>
            {renderArrayCard("Apartment Gardening","Add Item","Item","plantingInformation.apartmentGardening",apartmentGardening)}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
