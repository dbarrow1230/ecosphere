// src/pages/forms/seeds/tabs/SeedGrowthTab.jsx
import { Card, Row, Col, Form, OverlayTrigger, Tooltip, InputGroup } from "react-bootstrap";
import SortedSelect from "../../../../components/SortedSelect.jsx";

export default function SeedGrowthTab({
  formData,
  updateField,
  growthRates = [],
  plantingDepths = [],
  plantSpacings = [],
  usdaZones = []
}) {
  const data=formData.growthInformation || {};
  const germinationTime=data.germinationTime || {};
  const size=data.matureSize || {};
  const height=size.height || {};
  const width=size.width || {};

  const parseZone=(item)=>{
    const match=String(item?.zone || item || "").match(/^(\d+)([ab])?$/i);
    if(!match)return {number:999,letter:"z",score:99999};

    const number=Number(match[1]);
    const letter=(match[2] || "").toLowerCase();
    const letterScore=letter === "a" ? 0 : letter === "b" ? 1 : -1;

    return {
      number,
      letter,
      score:number * 10 + letterScore
    };
  };

  const sortedUsdaZones=[...usdaZones].sort((a,b)=>{
    const zoneA=parseZone(a);
    const zoneB=parseZone(b);

    if(zoneA.number !== zoneB.number)return zoneA.number-zoneB.number;
    return zoneA.letter.localeCompare(zoneB.letter);
  });

  const getUsdaZoneValue=(item)=>item?._id || item?.id || item?.zone || "";

  const normalizeSelectedZoneValue=(value)=>{
    if(!value)return "";

    if(typeof value === "string")return value;

    if(typeof value === "object"){
      return value._id || value.id || value.zone || "";
    }

    return String(value);
  };

  const selectedUsdaZoneValues=Array.isArray(data.usdaZones)
    ? data.usdaZones.map(normalizeSelectedZoneValue).filter(Boolean)
    : [];

  const formatStates=(states)=>{
    if(!states) return "";
    if(Array.isArray(states)) return states.filter(Boolean).join(", ");
    return String(states);
  };

  const formatUsdaZoneOption=(item)=>{
    return `${item.zone || ""}${item.region ? ` - ${item.region}` : ""}`;
  };

  const formatUsdaZoneSummary=(item)=>{
    const statesText=formatStates(item.states);
    return `${item.zone || ""}${item.region ? ` - ${item.region}` : ""}${statesText ? `: ${statesText}` : ""}`;
  };

  const formatUsdaZoneTooltipLines=(item)=>{
    return [
      `${item.zone || ""}${item.region ? ` - ${item.region}` : ""}`,
      formatStates(item.states) ? `States: ${formatStates(item.states)}` : "",
      item.temperatureRange?.fahrenheit ? `Fahrenheit: ${item.temperatureRange.fahrenheit.min}°F to ${item.temperatureRange.fahrenheit.max}°F` : "",
      item.temperatureRange?.celsius ? `Celsius: ${item.temperatureRange.celsius.min}°C to ${item.temperatureRange.celsius.max}°C` : "",
      item.description ? `Description: ${item.description}` : "",
      item.avgFrostDates?.lastSpringFrost ? `Last Spring Frost: ${item.avgFrostDates.lastSpringFrost}` : "",
      item.avgFrostDates?.firstFallFrost ? `First Fall Frost: ${item.avgFrostDates.firstFallFrost}` : "",
      item.plantingWindows?.indoorStart ? `Indoor Start: ${item.plantingWindows.indoorStart}` : "",
      item.plantingWindows?.transplantOutside ? `Transplant Outside: ${item.plantingWindows.transplantOutside}` : "",
      item.plantingWindows?.directSow ? `Direct Sow: ${item.plantingWindows.directSow}` : "",
      item.plantingWindows?.harvestWindow ? `Harvest Window: ${item.plantingWindows.harvestWindow}` : ""
    ].filter(Boolean);
  };

  const buildSelectedUsdaZoneDetails=(selectedValues)=>{
    return sortedUsdaZones
      .filter((item)=>{
        const value=getUsdaZoneValue(item);
        return selectedValues.includes(value) || selectedValues.includes(item._id) || selectedValues.includes(item.zone);
      })
      .map((item)=>({
        zone:item.zone || "",
        region:item.region || "",
        states:Array.isArray(item.states) ? item.states : [],
        temperatureRange:item.temperatureRange || {},
        description:item.description || "",
        avgFrostDates:item.avgFrostDates || {},
        plantingWindows:item.plantingWindows || {}
      }));
  };

  const selectedUsdaZoneDetails=buildSelectedUsdaZoneDetails(selectedUsdaZoneValues);

  const getOptionValue=(item)=>item?._id || item?.id || item?.value || "";
  const getOptionLabel=(item)=>item?.name || item?.title || item?.label || item?.rate || item?.depth || item?.spacing || "";
  const formatNumber=value=>{
    const number=Number(value);
    if(!Number.isFinite(number))return "";
    return Number.isInteger(number) ? String(number) : String(number).replace(/0+$/,"").replace(/\.$/,"");
  };

  const getMeasurementLabel=item=>{
    const label=getOptionLabel(item);
    const inches=formatNumber(item?.inches);
    const centimeters=formatNumber(item?.centimeters);
    const measurements=[
      inches ? `${inches} in` : "",
      centimeters ? `${centimeters} cm` : ""
    ].filter(Boolean).join(" / ");

    return measurements ? `${label} (${measurements})` : label;
  };

  const roundMeasurement=(value)=>Math.round((value + Number.EPSILON) * 100) / 100;

  const displayMeasurementValue=(value)=>{
    return value === undefined || value === null || value === 0 ? "" : value;
  };

  const toNumber=(value)=>{
    const numericValue=Number(value);
    return Number.isFinite(numericValue) ? numericValue : "";
  };

  const inchesToCentimeters=(value)=>{
    const numericValue=toNumber(value);
    return numericValue === "" ? "" : roundMeasurement(numericValue * 2.54);
  };

  const centimetersToInches=(value)=>{
    const numericValue=toNumber(value);
    return numericValue === "" ? "" : roundMeasurement(numericValue / 2.54);
  };

  const updateMatureSize=(path,value)=>{
    if(value === ""){
      updateField(`growthInformation.matureSize.${path}`,"");

      if(path === "height.minIn") updateField("growthInformation.matureSize.height.minCm","");
      if(path === "height.minCm") updateField("growthInformation.matureSize.height.minIn","");
      if(path === "height.maxIn") updateField("growthInformation.matureSize.height.maxCm","");
      if(path === "height.maxCm") updateField("growthInformation.matureSize.height.maxIn","");
      if(path === "width.minIn") updateField("growthInformation.matureSize.width.minCm","");
      if(path === "width.minCm") updateField("growthInformation.matureSize.width.minIn","");
      if(path === "width.maxIn") updateField("growthInformation.matureSize.width.maxCm","");
      if(path === "width.maxCm") updateField("growthInformation.matureSize.width.maxIn","");

      return;
    }

    const numericValue=toNumber(value);

    updateField(`growthInformation.matureSize.${path}`,numericValue);

    if(path === "height.minIn") updateField("growthInformation.matureSize.height.minCm",inchesToCentimeters(value));
    if(path === "height.minCm") updateField("growthInformation.matureSize.height.minIn",centimetersToInches(value));
    if(path === "height.maxIn") updateField("growthInformation.matureSize.height.maxCm",inchesToCentimeters(value));
    if(path === "height.maxCm") updateField("growthInformation.matureSize.height.maxIn",centimetersToInches(value));
    if(path === "width.minIn") updateField("growthInformation.matureSize.width.minCm",inchesToCentimeters(value));
    if(path === "width.minCm") updateField("growthInformation.matureSize.width.minIn",centimetersToInches(value));
    if(path === "width.maxIn") updateField("growthInformation.matureSize.width.maxCm",inchesToCentimeters(value));
    if(path === "width.maxCm") updateField("growthInformation.matureSize.width.maxIn",centimetersToInches(value));
  };

  const getRangeBoundaryScore=(zoneText,isEnd)=>{
    const match=String(zoneText || "").trim().match(/^(\d+)([ab])?$/i);

    if(!match)return null;

    const number=Number(match[1]);
    const letter=(match[2] || "").toLowerCase();

    if(letter === "a")return number * 10;
    if(letter === "b")return number * 10 + 1;

    return isEnd ? number * 10 + 1 : number * 10;
  };

  const parseUsdaZoneRange=(value)=>{
    const text=String(value || "").trim();

    if(!text)return null;

    const rangeMatch=text.match(/^(\d+[ab]?)\s*(?:-|–|—|to)\s*(\d+[ab]?)$/i);

    if(rangeMatch){
      const startScore=getRangeBoundaryScore(rangeMatch[1],false);
      const endScore=getRangeBoundaryScore(rangeMatch[2],true);

      if(startScore === null || endScore === null)return null;

      return {
        min:Math.min(startScore,endScore),
        max:Math.max(startScore,endScore)
      };
    }

    const singleScoreStart=getRangeBoundaryScore(text,false);
    const singleScoreEnd=getRangeBoundaryScore(text,true);

    if(singleScoreStart === null || singleScoreEnd === null)return null;

    return {
      min:singleScoreStart,
      max:singleScoreEnd
    };
  };

  const updateUsdaZoneRange=(value)=>{
    updateField("growthInformation.usdaZoneRange",value);

    const range=parseUsdaZoneRange(value);

    if(!range){
      if(value === ""){
        updateField("growthInformation.usdaZones",[]);
        updateField("growthInformation.hardinessZonesWithCorrespondingRegionsStates",[]);
      }

      return;
    }

    const selectedValues=sortedUsdaZones
      .filter((item)=>{
        const zone=parseZone(item);
        return zone.score >= range.min && zone.score <= range.max;
      })
      .map((item)=>getUsdaZoneValue(item))
      .filter(Boolean);

    updateField("growthInformation.usdaZones",selectedValues);
    updateField("growthInformation.hardinessZonesWithCorrespondingRegionsStates",buildSelectedUsdaZoneDetails(selectedValues));
  };

  const handleUsdaZonesChange=(e)=>{
    const selectedValues=Array.from(e.target.selectedOptions).map(option=>option.value);
    const selectedDetails=buildSelectedUsdaZoneDetails(selectedValues);

    updateField("growthInformation.usdaZones",selectedValues);
    updateField("growthInformation.hardinessZonesWithCorrespondingRegionsStates",selectedDetails);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Growth Information</h5>

        <Row className="g-3">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Germination Min</InputGroup.Text>
              <Form.Control
                value={germinationTime.min || ""}
                onChange={(e)=>updateField("growthInformation.germinationTime.min",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Germination Max</InputGroup.Text>
              <Form.Control
                value={germinationTime.max || ""}
                onChange={(e)=>updateField("growthInformation.germinationTime.max",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Growth Rate</InputGroup.Text>
              <SortedSelect
                value={data.growthRate || ""}
                onChange={(e)=>updateField("growthInformation.growthRate",e.target.value)}
                options={growthRates}
                getValue={getOptionValue}
                getLabel={getOptionLabel}
                placeholder="Select growth rate"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Bulb Size</InputGroup.Text>
              <Form.Control
                value={data.bulbSize || ""}
                onChange={(e)=>updateField("growthInformation.bulbSize",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col xs={12}>
            <h6 className="mt-3 mb-2">Mature Size</h6>
          </Col>

          <Col md={6}>
            <Card className="border h-100">
              <Card.Header className="bg-white fw-bold">Height</Card.Header>

              <Card.Body>
                <Row className="g-2">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Min In</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(height.minIn)}
                        onChange={(e)=>updateMatureSize("height.minIn",e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Min Cm</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(height.minCm)}
                        onChange={(e)=>updateMatureSize("height.minCm",e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Max In</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(height.maxIn)}
                        onChange={(e)=>updateMatureSize("height.maxIn",e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Max Cm</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(height.maxCm)}
                        onChange={(e)=>updateMatureSize("height.maxCm",e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border h-100">
              <Card.Header className="bg-white fw-bold">Width</Card.Header>

              <Card.Body>
                <Row className="g-2">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Min In</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(width.minIn)}
                        onChange={(e)=>updateMatureSize("width.minIn",e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Min Cm</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(width.minCm)}
                        onChange={(e)=>updateMatureSize("width.minCm",e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Max In</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(width.maxIn)}
                        onChange={(e)=>updateMatureSize("width.maxIn",e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>Max Cm</InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={displayMeasurementValue(width.maxCm)}
                        onChange={(e)=>updateMatureSize("width.maxCm",e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Planting Depth</InputGroup.Text>
              <SortedSelect
                value={data.plantingDepth || ""}
                onChange={(e)=>updateField("growthInformation.plantingDepth",e.target.value)}
                options={plantingDepths}
                getValue={getOptionValue}
                getLabel={getMeasurementLabel}
                placeholder="Select planting depth"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Plant Spacing</InputGroup.Text>
              <SortedSelect
                value={data.plantSpacing || ""}
                onChange={(e)=>updateField("growthInformation.plantSpacing",e.target.value)}
                options={plantSpacings}
                getValue={getOptionValue}
                getLabel={getMeasurementLabel}
                placeholder="Select plant spacing"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Sunlight</InputGroup.Text>
              <Form.Control
                value={data.sunlightRequirements || ""}
                onChange={(e)=>updateField("growthInformation.sunlightRequirements",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">USDA Zone Range</InputGroup.Text>
              <Form.Control
                value={data.usdaZoneRange || ""}
                placeholder="Example: 5-9"
                onChange={(e)=>updateUsdaZoneRange(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">USDA Zones</InputGroup.Text>
              <SortedSelect
                multiple
                value={selectedUsdaZoneValues}
                onChange={handleUsdaZonesChange}
                options={usdaZones}
                getValue={getUsdaZoneValue}
                getLabel={formatUsdaZoneOption}
                customSort={(a,b)=>{
                  const zoneA=parseZone(a);
                  const zoneB=parseZone(b);

                  if(zoneA.number !== zoneB.number)return zoneA.number-zoneB.number;
                  return zoneA.letter.localeCompare(zoneB.letter);
                }}
                includePlaceholder={false}
              />
            </InputGroup>
            <div className="small text-muted mt-1">Enter a range like 5-9 to select all matching zones, or hold Ctrl/Cmd to select manually.</div>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Zones/Regions</InputGroup.Text>
              <div className="form-control" style={{minHeight:"205px",overflowY:"auto"}}>
                {selectedUsdaZoneDetails.length ? selectedUsdaZoneDetails.map((item,index)=>(
                  <div key={`${getUsdaZoneValue(item)}-${index}`} className={index < selectedUsdaZoneDetails.length-1 ? "mb-2" : ""}>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`usda-zone-tooltip-${getUsdaZoneValue(item)}-${index}`}>
                          {formatUsdaZoneTooltipLines(item).map((line,lineIndex)=>(
                            <div key={lineIndex}>{line}</div>
                          ))}
                        </Tooltip>
                      }
                    >
                      <span style={{cursor:"help"}}>
                        {formatUsdaZoneSummary(item)}
                      </span>
                    </OverlayTrigger>
                  </div>
                )) : ""}
              </div>
            </InputGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
