// src/pages/forms/seeds/tabs/SeedAdminTab.jsx
import { useState } from "react";
import { Card, Row, Col, Form, Button, Image, Spinner, InputGroup } from "react-bootstrap";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import resolveUploadUrl from "../../../../utils/resolveUploadUrl.js";

export default function SeedAdminTab({ formData, updateField }) {
  const [uploadingIndex,setUploadingIndex]=useState(null);

  const getArrayText=(value)=>{
    return Array.isArray(value) ? value.join("\n") : "";
  };

  const setArrayText=(path,value)=>{
    updateField(path,value.split("\n").map(item=>item.trim()).filter(Boolean));
  };

  const getImageUrl=image=>resolveUploadUrl(image,"seed");

  const addImage=()=>{
    updateField("images",[...(formData.images || []),{stage:"",filename:"",url:"",relativePath:"",alt:"",caption:""}]);
  };

  const updateImage=(index,key,value)=>{
    const list=[...(formData.images || [])];
    list[index]={...(list[index] || {}),[key]:value};
    updateField("images",list);
  };

  const removeImage=(index)=>{
    const list=[...(formData.images || [])];
    list.splice(index,1);
    updateField("images",list);
  };

  const uploadStageImage=async(e,index)=>{
    const file=e.target.files?.[0];
    if(!file)return;

    const list=[...(formData.images || [])];
    const current=list[index] || {};
    const stage=current.stage || "other";

    setUploadingIndex(index);

    const form=new FormData();
    form.append("file",file);
    form.append("imageType","stage");
    form.append("stage",stage);
    form.append("plantName",formData.plantName || "");

    try{
      const res=await fetch("/api/upload/seed",{
        method:"POST",
        body:form
      });

      const data=await res.json();

      if(!res.ok){
        throw new Error(data.message || "Upload failed");
      }

      list[index]={
        ...current,
        filename:data.filename || "",
        url:"",
        relativePath:""
      };

      updateField("images",list);
    }catch(error){
      alert(error.message);
    }finally{
      setUploadingIndex(null);
    }
  };

  const images=Array.isArray(formData.images) ? formData.images : [];

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Seed Packet / Admin Details</h5>

        <Row className="g-3">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Lot Number</InputGroup.Text>
              <Form.Control
                value={formData.lotNumber || ""}
                onChange={(e)=>updateField("lotNumber",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Date Collected</InputGroup.Text>
              <Form.Control
                type="date"
                value={formData.dateCollected || ""}
                onChange={(e)=>updateField("dateCollected",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Packed For</InputGroup.Text>
              <Form.Control
                value={formData.packedFor || ""}
                onChange={(e)=>updateField("packedFor",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Plant Stage Images</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addImage}
                >
                  <Plus size={15} />
                  Add Image
                </Button>
              </Card.Header>

              <Card.Body>
                {images.length === 0 ? (
                  <div className="text-muted small">No plant stage images added.</div>
                ) : (
                  images.map((image,index)=>(
                    <Card className="mb-3" key={index}>
                      <Card.Body>
                        <Row className="g-3 align-items-start">
                          <Col md={2}>
                            <div className="border rounded text-center p-2">
                              {getImageUrl(image) ? (
                                <Image
                                  src={getImageUrl(image)}
                                  alt={image.alt || ""}
                                  fluid
                                  rounded
                                  style={{maxHeight:120,objectFit:"contain"}}
                                />
                              ) : (
                                <div className="text-muted py-4">
                                  <ImagePlus size={32} />
                                </div>
                              )}
                            </div>

                            <Form.Control
                              type="file"
                              accept="image/*"
                              size="sm"
                              className="mt-2"
                              onChange={(e)=>uploadStageImage(e,index)}
                              disabled={uploadingIndex===index}
                            />

                            {uploadingIndex===index && (
                              <div className="small text-muted mt-2 d-flex align-items-center gap-2">
                                <Spinner animation="border" size="sm" />
                                Uploading...
                              </div>
                            )}
                          </Col>

                          <Col md={10}>
                            <Row className="g-2">
                              <Col md={6}>
                                <InputGroup>
                                  <InputGroup.Text>Stage</InputGroup.Text>
                                  <Form.Select
                                    value={image.stage || ""}
                                    onChange={(e)=>updateImage(index,"stage",e.target.value)}
                                  >
                                    <option value="">Select stage</option>
                                    <option value="seed">Seed</option>
                                    <option value="germination">Germination</option>
                                    <option value="seedling">Seedling</option>
                                    <option value="youngPlant">Young Plant</option>
                                    <option value="adultPlant">Adult Plant</option>
                                    <option value="flowering">Flowering</option>
                                    <option value="harvest">Harvest</option>
                                    <option value="other">Other</option>
                                  </Form.Select>
                                </InputGroup>
                              </Col>

                              <Col md={6}>
                                <InputGroup>
                                  <InputGroup.Text>Filename</InputGroup.Text>
                                  <Form.Control
                                    value={image.filename || ""}
                                    onChange={(e)=>updateImage(index,"filename",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col md={6}>
                                <InputGroup>
                                  <InputGroup.Text>Alt Text</InputGroup.Text>
                                  <Form.Control
                                    value={image.alt || ""}
                                    onChange={(e)=>updateImage(index,"alt",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col md={6}>
                                <InputGroup>
                                  <InputGroup.Text>Caption</InputGroup.Text>
                                  <Form.Control
                                    value={image.caption || ""}
                                    onChange={(e)=>updateImage(index,"caption",e.target.value)}
                                  />
                                </InputGroup>
                              </Col>

                              <Col xs={12}>
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  className="d-inline-flex align-items-center gap-1"
                                  onClick={()=>removeImage(index)}
                                >
                                  <Trash2 size={15} />
                                  Remove
                                </Button>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Tags</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={4}
                value={getArrayText(formData.tags)}
                onChange={(e)=>setArrayText("tags",e.target.value)}
                placeholder="One tag per line"
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <div className="h-100 d-flex align-items-start pt-2">
              <Form.Check
                type="checkbox"
                label="Public Status"
                checked={!!formData.isPublic}
                onChange={(e)=>updateField("isPublic",e.target.checked)}
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
