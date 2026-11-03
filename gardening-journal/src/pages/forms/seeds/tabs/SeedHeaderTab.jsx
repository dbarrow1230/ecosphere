// src/pages/forms/seeds/SeedHeader.jsx
import { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, Image, Spinner, InputGroup, Alert } from "react-bootstrap";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import resolveUploadUrl from "../../../../utils/resolveUploadUrl.js";

export default function SeedHeader({
  formData,
  updateField,
  seedVendors = [],
  refreshSeedVendors
}) {
  const [preview,setPreview]=useState("");
  const [uploading,setUploading]=useState(false);
  const [localVendors,setLocalVendors]=useState(seedVendors);
  const [showAddVendor,setShowAddVendor]=useState(false);
  const [vendorName,setVendorName]=useState("");
  const [vendorWebsite,setVendorWebsite]=useState("");
  const [vendorNotes,setVendorNotes]=useState("");
  const [savingVendor,setSavingVendor]=useState(false);
  const [vendorError,setVendorError]=useState("");


  useEffect(()=>{
    queueMicrotask(()=>setLocalVendors(seedVendors));
  },[seedVendors]);

  const getCoverImageUrl=()=>resolveUploadUrl(formData.coverImage,"seed");

  const getVendorId=(vendor)=>vendor?._id || vendor?.id || "";

  const toggleVendor=(vendorId)=>{
    const current=Array.isArray(formData.vendor) ? formData.vendor : [];

    updateField(
      "vendor",
      current.includes(vendorId)
        ? current.filter((id)=>id !== vendorId)
        : [...current,vendorId]
    );
  };

  const selectVendor=(vendorId)=>{
    if(!vendorId) return;

    const current=Array.isArray(formData.vendor) ? formData.vendor : [];

    if(!current.includes(vendorId)){
      updateField("vendor",[...current,vendorId]);
    }
  };

  const resetVendorForm=()=>{
    setVendorName("");
    setVendorWebsite("");
    setVendorNotes("");
    setVendorError("");
  };

  const handleCreateVendor=async()=>{
    const name=vendorName.trim();

    if(!name){
      setVendorError("Vendor name is required.");
      return;
    }

    setSavingVendor(true);
    setVendorError("");

    try{
      const res=await fetch("/api/seed-vendors",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          name,
          website:vendorWebsite.trim(),
          notes:vendorNotes.trim()
        })
      });

      const data=await res.json();

      if(!res.ok){
        throw new Error(data.message || "Vendor could not be created.");
      }

      const createdVendor=data.vendor || data;
      const createdVendorId=getVendorId(createdVendor);

      if(refreshSeedVendors){
        const refreshedVendors=await refreshSeedVendors();

        if(Array.isArray(refreshedVendors)){
          setLocalVendors(refreshedVendors);
        }
      }else{
        setLocalVendors((current)=>{
          const exists=current.some((vendor)=>getVendorId(vendor) === createdVendorId);
          return exists ? current : [...current,createdVendor];
        });
      }

      selectVendor(createdVendorId);
      resetVendorForm();
      setShowAddVendor(false);
    }catch(error){
      setVendorError(error.message);
    }finally{
      setSavingVendor(false);
    }
  };

  const handleImageUpload=async(e)=>{
    const file=e.target.files?.[0];
    if(!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const form=new FormData();
    form.append("file",file);
    form.append("imageType","seed-packet");
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

      // The seed record stores only the filename. The display adds /seed/.
      updateField("coverImage",data.filename || file.name);
    }catch(error){
      alert(error.message);
    }finally{
      setUploading(false);
    }
  };

  const removeImage=()=>{
    updateField("coverImage","");
    setPreview("");
  };

  const currentImage=preview || getCoverImageUrl();

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <Row className="g-4 align-items-start">
          <Col xs={12}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Plant Name</InputGroup.Text>
              <Form.Control
                size="lg"
                className="fw-bold"
                value={formData.plantName || ""}
                onChange={(e)=>updateField("plantName",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <div className="fw-bold mb-2">Seed Packet Image</div>

            <div className="seed-cover-image-editor">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={formData.plantName || "Seed packet image"}
                  className="seed-cover-image-preview"
                />
              ) : (
                <div className="seed-cover-image-placeholder">
                  <ImagePlus size={42} />
                </div>
              )}
            </div>

            <Form.Control
              type="file"
              accept="image/*"
              className="mt-3"
              onChange={handleImageUpload}
              disabled={uploading}
            />

            {uploading && (
              <div className="small text-muted mt-2 d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                Uploading...
              </div>
            )}

            {currentImage && (
              <Button
                type="button"
                variant="outline-danger"
                size="sm"
                className="mt-2 d-inline-flex align-items-center gap-1"
                onClick={removeImage}
              >
                <Trash2 size={15} />
                Remove
              </Button>
            )}
          </Col>

          <Col md={9}>
            <InputGroup className="mb-3">
              <InputGroup.Text className="fw-bold">Description</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description || ""}
                onChange={(e)=>updateField("description",e.target.value)}
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text className="fw-bold">Context</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.context || ""}
                onChange={(e)=>updateField("context",e.target.value)}
              />
            </InputGroup>

            <Card className="border">
              <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
                <span>Vendors</span>

                <Button
                  type="button"
                  variant={showAddVendor ? "outline-secondary" : "outline-success"}
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={()=>{
                    setShowAddVendor((current)=>!current);
                    setVendorError("");
                  }}
                >
                  {showAddVendor ? <X size={15} /> : <Plus size={15} />}
                  {showAddVendor ? "Cancel" : "Add Vendor"}
                </Button>
              </Card.Header>

              <Card.Body className="p-3">
                {showAddVendor && (
                  <Card className="border mb-3">
                    <Card.Body className="p-3">
                      {vendorError && (
                        <Alert variant="danger" className="py-2 mb-3">
                          {vendorError}
                        </Alert>
                      )}

                      <Row className="g-2">
                        <Col md={4}>
                          <InputGroup>
                            <InputGroup.Text className="fw-bold">Name</InputGroup.Text>
                            <Form.Control
                              value={vendorName}
                              onChange={(e)=>setVendorName(e.target.value)}
                              disabled={savingVendor}
                            />
                          </InputGroup>
                        </Col>

                        <Col md={4}>
                          <InputGroup>
                            <InputGroup.Text className="fw-bold">Website</InputGroup.Text>
                            <Form.Control
                              value={vendorWebsite}
                              onChange={(e)=>setVendorWebsite(e.target.value)}
                              disabled={savingVendor}
                            />
                          </InputGroup>
                        </Col>

                        <Col md={4}>
                          <InputGroup>
                            <InputGroup.Text className="fw-bold">Notes</InputGroup.Text>
                            <Form.Control
                              value={vendorNotes}
                              onChange={(e)=>setVendorNotes(e.target.value)}
                              disabled={savingVendor}
                            />
                          </InputGroup>
                        </Col>

                        <Col xs={12}>
                          <Button
                            type="button"
                            variant="success"
                            size="sm"
                            className="d-inline-flex align-items-center gap-1"
                            onClick={handleCreateVendor}
                            disabled={savingVendor}
                          >
                            {savingVendor ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <Plus size={15} />
                            )}
                            Save Vendor
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {localVendors.length === 0 ? (
                  <div className="text-muted small">No vendors loaded.</div>
                ) : (
                  localVendors.map((vendor)=> {
                    const vendorId=getVendorId(vendor);

                    return (
                      <Form.Check
                        inline
                        key={vendorId}
                        type="checkbox"
                        id={`seed-vendor-${vendorId}`}
                        label={vendor.name}
                        checked={(formData.vendor || []).includes(vendorId)}
                        onChange={()=>toggleVendor(vendorId)}
                      />
                    );
                  })
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
