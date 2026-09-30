// src/pages/seeds/components/SeedHeader.jsx
import { useState } from "react";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";
import Barcode from "react-barcode";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil } from "lucide-react";
import SeedBannerTemplate from "../../../components/SeedBannerTemplate.jsx";
import seedBannerBg from "../../../images/template dark.png";
import resolveUploadUrl from "../../../utils/resolveUploadUrl.js";

export default function SeedHeader({
  seed,
  onEdit,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  canGoFirst=false,
  canGoPrevious=false,
  canGoNext=false,
  canGoLast=false
}) {
  const [showImageHover,setShowImageHover]=useState(false);

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
    if(typeof value==="boolean")return value ? "Yes" : "No";

    if(Array.isArray(value)){
      return value.map(item=>getText(item)).filter(Boolean).join(", ");
    }

    if(typeof value==="object"){
      if(typeof value.name==="string")return value.name;
      if(typeof value.companyName==="string")return value.companyName;
      if(typeof value.title==="string")return value.title;
      if(typeof value.label==="string")return value.label;
      if(typeof value.username==="string")return value.username;
      if(typeof value.email==="string")return value.email;
      if(typeof value.website==="string")return value.website;
      if(typeof value.description==="string")return value.description;
      if(typeof value.requirement==="string")return value.requirement;
      if(typeof value.type==="string")return value.type;
      if(typeof value.zone==="string")return value.zone;

      const id=getId(value);
      return id || "";
    }

    return "";
  };

  const getArrayText=value=>{
    if(Array.isArray(value))return value.map(item=>getText(item)).filter(Boolean).join(", ");
    return getText(value);
  };

  const getVendorText=value=>{
    if(!value)return "No vendor listed.";

    if(Array.isArray(value)){
      const names=value
        .map(item=>{
          if(!item)return "";

          if(typeof item==="object"){
            return item.name || item.companyName || item.title || item.label || "";
          }

          return getText(item);
        })
        .filter(Boolean);

      return names.length ? names.join(", ") : "No vendor listed.";
    }

    if(typeof value==="object"){
      return value.name || value.companyName || value.title || value.label || getText(value) || "No vendor listed.";
    }

    const text=getText(value);
    return text || "No vendor listed.";
  };

  const getBannerValue=value=>{
    const text=getText(value);
    return text || "Not listed";
  };

  const getBarcodeValue=()=>{
    return getId(seed?._id || seed?.id) || "NO-ID";
  };

  const imageUrl=resolveUploadUrl(seed?.coverImage,"seed");
  const plantName=getText(seed?.plantName) || "Unnamed Seed";
  const description=getText(seed?.description) || "No description listed.";
  const context=getText(seed?.context);
  const taste=getArrayText(seed?.taste);
  const aroma=getArrayText(seed?.aroma);
  const mouthfeel=getArrayText(seed?.mouthfeel);
  const vendorText=getVendorText(seed?.vendor);
  const barcodeValue=getBarcodeValue();

  const growingConditions=seed?.growingConditionsAndRequirements || {};
  const growthInformation=seed?.growthInformation || {};

  const bannerSun=getBannerValue(
    growthInformation.sunlightRequirements ||
    growingConditions.lightRequirements
  );

  const bannerWater=getBannerValue(
    growingConditions.watering ||
    growingConditions.wateringRequirements
  );

  const bannerSoil=getBannerValue(growingConditions.soilType);
  const bannerClimate=getBannerValue(growingConditions.climateTolerance);

  return (
    <Card className="seed-detail-card seed-header-card shadow-sm">
      <Card.Body className="seed-header-body">
        <Row className="g-4 align-items-start">
          <Col xs={12}>
            <div className="seed-header-title-row">
              <div>
                <h1 className="seed-title mb-1">{plantName}</h1>
                <div className="seed-product-code mb-2" aria-label={`Seed product code ${barcodeValue}`}>
                  <span className="seed-product-code-label">Seed Code</span>
                  <Barcode
                    value={barcodeValue}
                    format="CODE128"
                    width={1.1}
                    height={32}
                    margin={0}
                    displayValue={false}
                    background="transparent"
                    lineColor="currentColor"
                  />
                  <span className="seed-product-code-value">{barcodeValue}</span>
                </div>
              </div>

              <div className="seed-header-actions">
                <div className="seed-header-nav" aria-label="Seed navigation">
                  <Button type="button" variant="outline-success" size="sm" aria-label="First seed" disabled={!canGoFirst} onClick={onFirst}>
                    <ChevronsLeft size={16} />
                  </Button>
                  <Button type="button" variant="outline-success" size="sm" aria-label="Previous seed" disabled={!canGoPrevious} onClick={onPrevious}>
                    <ChevronLeft size={16} />
                  </Button>
                  <Button type="button" variant="outline-success" size="sm" aria-label="Next seed" disabled={!canGoNext} onClick={onNext}>
                    <ChevronRight size={16} />
                  </Button>
                  <Button type="button" variant="outline-success" size="sm" aria-label="Last seed" disabled={!canGoLast} onClick={onLast}>
                    <ChevronsRight size={16} />
                  </Button>
                </div>

                {onEdit && (
                  <Button
                    type="button"
                    variant="outline-success"
                    size="sm"
                    className="seed-header-edit-button d-inline-flex align-items-center gap-1"
                    onClick={onEdit}
                  >
                    <Pencil size={15} />
                    Edit Seed
                  </Button>
                )}
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div
              className="seed-image-frame"
              style={{
                backgroundImage:imageUrl ? `url("${imageUrl}")` : "none",
              }}
              onMouseEnter={()=>setShowImageHover(true)}
              onMouseLeave={()=>setShowImageHover(false)}
            >
              {!imageUrl && (
                <div className="seed-image-placeholder">No image</div>
              )}
            </div>
          </Col>

          <Col md={9}>
            <p className="mb-3">{description}</p>

            {context && (
              <p className="mb-3 text-muted">{context}</p>
            )}

            <div className="seed-meta-list">
              {taste && (
                <div>
                  <strong>Taste:</strong> {taste}
                </div>
              )}

              {aroma && (
                <div>
                  <strong>Aroma:</strong> {aroma}
                </div>
              )}

              {mouthfeel && (
                <div>
                  <strong>Mouthfeel:</strong> {mouthfeel}
                </div>
              )}

              <div>
                <strong>Vendors:</strong> {vendorText}
              </div>
            </div>

            {seed?.isPublic && (
              <div className="mt-3">
                <Badge bg="success">Public</Badge>
              </div>
            )}
          </Col>
        </Row>

        {showImageHover && (
          <div className="seed-header-hover-preview">
            <SeedBannerTemplate
              name={plantName}
              description={description}
              sun={bannerSun}
              water={bannerWater}
              soil={bannerSoil}
              climate={bannerClimate}
              image={seedBannerBg}
            />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

