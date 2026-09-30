import { useEffect, useState } from "react";
import { Container, Card, ListGroup, Image, Button, Modal, Form, InputGroup } from "react-bootstrap";
import { BookOpen, Plus, Search, X } from "lucide-react";
import "../../styles/SeedPage.css";
import seedHeaderImage from "../../images/seed header.png";
import SortedList from "../../components/SortedList.jsx";

import SeedFormPage from "../forms/seeds/SeedFormPage";
import SeedHeader from "./components/SeedHeader";
import SpeciesSelect from "./components/SeedSpecies";
import SeedLifecycle from "./components/SeedLifecycle";
import SeedGrowthInfo from "./components/SeedGrowthInfo";
import SeedGrowingConditions from "./components/SeedGrowingConditions";
import SeedStressRisk from "./components/SeedStressRisk";
import SeedPlantingInfo from "./components/SeedPlantingInfo";
import SeedPestDisease from "./components/SeedPestDisease";
import SeedPropagationHarvestStorage from "./components/SeedPropagationHarvestStorage";
import SeedUsesBenefits from "./components/SeedUsesBenefits";
import SeedEnvironmentalFeatures from "./components/SeedEnvironmentalFeatures";
import SeedHistory from "./components/SeedHistory";
import SeedResources from "./components/SeedResources";

export default function SeedsPage({ user }) {
  const [seeds,setSeeds]=useState([]);
  const [selectedSeed,setSelectedSeed]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [showSeedForm,setShowSeedForm]=useState(false);
  const [formMode,setFormMode]=useState("add");
  const [editingSeed,setEditingSeed]=useState(null);
  const [seedSearch,setSeedSearch]=useState("");
  const [seedLetter,setSeedLetter]=useState("all");
  const [guideOpen,setGuideOpen]=useState(false);
  const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const getSpeciesText=(species)=>{
    if(!species)return "Species not listed";

    const family=species.family?.name || "";
    const genus=species.genus?.name || "";
    const speciesName=species.species || "";

    return [family,genus,speciesName].filter(Boolean).join(" • ") || "Species not listed";
  };

  const getText=(value)=>{
    if(value===undefined || value===null)return "";
    if(typeof value==="string")return value;
    if(typeof value==="number")return String(value);
    if(Array.isArray(value))return value.map(getText).filter(Boolean).join(", ");
    if(typeof value==="object")return value.name || value.title || value.label || value.description || value.type || value.zone || "";
    return "";
  };

  const getSpacingText=(growthInformation={})=>{
    const spacing=getText(growthInformation.plantSpacing);
    const width=growthInformation.matureSize?.width || {};
    const min=width.minIn || "";
    const max=width.maxIn || "";

    if(spacing)return spacing;
    if(min || max)return `${min || "?"}-${max || "?"} in wide`;
    return "Not listed";
  };

  const getGuideRows=(seed={})=>[
    {label:"Crop Rotation Group",value:getSpeciesText(seed.species)},
    {label:"Soil",value:getText(seed.growingConditionsAndRequirements?.soilType) || seed.growingConditionsAndRequirements?.phRequirements || "Not listed"},
    {label:"Position",value:getText(seed.growthInformation?.sunlightRequirements) || getText(seed.growingConditionsAndRequirements?.lightRequirements) || "Not listed"},
    {label:"Frost / Hardiness",value:seed.lifecycleInformation?.hardiness || "Not listed"},
    {label:"Feeding",value:getText(seed.growingConditionsAndRequirements?.seasonalCareTips?.fertilizing) || "Not listed"},
    {label:"Companions",value:getText(seed.plantingInformation?.companionPlants) || "Not listed"},
    {label:"Spacing",value:getSpacingText(seed.growthInformation)},
    {label:"Sow and Plant",value:getText(seed.plantingInformation?.directSowOutdoors?.guidelines) || seed.plantingInformation?.startIndoors?.timing || "Not listed"}
  ];

  const getPlantingWindowRows=(seed={})=>[
    {label:"Indoor Start",value:seed.plantingInformation?.startIndoors?.timing || "Not listed"},
    {label:"Direct Sow",value:getText(seed.plantingInformation?.directSowOutdoors?.guidelines) || "Not listed"},
    {label:"Germination",value:[seed.growthInformation?.germinationTime?.min,seed.growthInformation?.germinationTime?.max].filter(Boolean).join("-") || "Not listed"},
    {label:"Harvest",value:seed.harvestingInformation?.harvestTime || seed.harvestingInformation?.harvestTimeAfterGermination || "Not listed"}
  ];

  const getSeedSearchText=(seed={})=>[
    seed.plantName,
    seed.commonName,
    seed.variety,
    seed.cultivar,
    seed.category,
    getSpeciesText(seed.species),
    getText(seed.species),
    getText(seed.tags),
    getText(seed.lifecycleInformation),
    getText(seed.growthInformation)
  ].map(getText).filter(Boolean).join(" ").toLowerCase();

  const getSeedInitial=(seed={})=>{
    const initial=String(seed.plantName || seed.commonName || "").trim().charAt(0).toUpperCase();
    return /^[A-Z]$/.test(initial) ? initial : "";
  };

  const fetchSeeds=async()=>{
    try{
      setLoading(true);
      setError("");

      const res=await fetch("/api/seeds");
      const data=await res.json();

      if(!res.ok)throw new Error(data.message || "Failed to fetch seeds");

      const seedList=Array.isArray(data) ? data : [];
      setSeeds(seedList);
      setSelectedSeed(prev=>{
        if(prev?._id){
          return seedList.find(seed=>seed._id===prev._id) || seedList[0] || null;
        }

        return seedList[0] || null;
      });
    }catch(err){
      setError(err.message || "Unable to load seeds");
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchSeeds();
  },[]);

  const openAddSeedForm=()=>{
    setFormMode("add");
    setEditingSeed(null);
    setShowSeedForm(true);
  };

  const openEditSeedForm=()=>{
    if(!selectedSeed)return;

    setFormMode("edit");
    setEditingSeed(selectedSeed);
    setShowSeedForm(true);
  };

  const closeSeedForm=()=>{
    setShowSeedForm(false);
    setEditingSeed(null);
    setFormMode("add");
  };

  const handleSeedSaved=(savedSeed)=>{
    if(!savedSeed?._id){
      closeSeedForm();
      fetchSeeds();
      return;
    }

    setSeeds(prev=>{
      const exists=prev.some(seed=>seed._id===savedSeed._id);

      if(exists){
        return prev.map(seed=>seed._id===savedSeed._id ? savedSeed : seed);
      }

      return [savedSeed,...prev];
    });

    setSelectedSeed(savedSeed);
    closeSeedForm();
  };

  const normalizedSeedSearch=seedSearch.trim().toLowerCase();
  const availableSeedLetters=new Set(seeds.map(getSeedInitial).filter(Boolean));
  const activeSeedLetter=seedLetter === "all" || availableSeedLetters.has(seedLetter) ? seedLetter : "all";
  const searchFilteredSeeds=normalizedSeedSearch
    ? seeds.filter(seed=>getSeedSearchText(seed).includes(normalizedSeedSearch))
    : seeds;
  const filteredSeeds=activeSeedLetter === "all"
    ? searchFilteredSeeds
    : searchFilteredSeeds.filter(seed=>getSeedInitial(seed) === activeSeedLetter);
  const selectedSeedIndex=selectedSeed?._id ? filteredSeeds.findIndex(seed=>seed._id===selectedSeed._id) : -1;
  const canGoPrevious=selectedSeedIndex>0;
  const canGoNext=selectedSeedIndex>=0 && selectedSeedIndex<filteredSeeds.length-1;
  const selectSeedAtIndex=(index)=>{
    const seed=filteredSeeds[index];
    if(seed){
      setSelectedSeed(seed);
    }
  };

  if(loading){
    return (
      <Container className="py-4">
        <Card body>Loading seed data...</Card>
      </Container>
    );
  }

  if(error){
    return (
      <Container className="py-4">
        <Card body className="text-danger">
          {error}
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 seed-page">
      <div className="seed-page-header">
        <Image src={seedHeaderImage} alt="Seeds" className="seed-page-header-image" />
      </div>

      <div className="seed-profile-layout">
        <aside className="seed-profile-sidebar">
          <Card className="seed-sidebar-card">
            <Card.Header className="fw-bold d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Seed List</h2>

              <Button
                type="button"
                variant="success"
                size="sm"
                className="d-inline-flex align-items-center gap-1"
                onClick={openAddSeedForm}
              >
                <Plus size={15} />
                Add
              </Button>
            </Card.Header>

            <div className="seed-list-search">
              <InputGroup size="sm">
                <InputGroup.Text>
                  <Search size={15} aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  value={seedSearch}
                  onChange={event=>setSeedSearch(event.target.value)}
                  placeholder="Search seeds"
                  aria-label="Search seeds"
                />
                {seedSearch && (
                  <Button
                    type="button"
                    variant="outline-secondary"
                    aria-label="Clear seed search"
                    onClick={()=>setSeedSearch("")}
                  >
                    <X size={14} aria-hidden="true" />
                  </Button>
                )}
              </InputGroup>
            </div>

            <div className="seed-alpha-tabs" aria-label="Filter seeds by first letter">
              <Button
                type="button"
                variant="outline-success"
                size="sm"
                className={activeSeedLetter === "all" ? "active" : ""}
                aria-pressed={activeSeedLetter === "all"}
                onClick={()=>setSeedLetter("all")}
              >
                All
              </Button>

              {alphabet.map(letter=>(
                <Button
                  key={letter}
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className={activeSeedLetter === letter ? "active" : ""}
                  aria-pressed={activeSeedLetter === letter}
                  disabled={!availableSeedLetters.has(letter)}
                  onClick={()=>setSeedLetter(letter)}
                >
                  {letter}
                </Button>
              ))}
            </div>

            <SortedList
              as={ListGroup}
              variant="flush"
              items={filteredSeeds}
              getKey={(seed)=>seed._id}
              getLabel={(seed)=>seed.plantName || "Unnamed Seed"}
              wrapItems={false}
              renderItem={(seed)=>(
                <ListGroup.Item
                  action
                  className={`seed-scroll-list-item${selectedSeed?._id===seed._id ? " seed-scroll-list-item-selected" : ""}`}
                  aria-current={selectedSeed?._id===seed._id ? "true" : undefined}
                  onClick={()=>setSelectedSeed(seed)}
                >
                  <strong className="seed-list-name">{seed.plantName || "Unnamed Seed"}</strong>
                  <div className="seed-list-species">{getSpeciesText(seed.species)}</div>
                </ListGroup.Item>
              )}
            >
              {seeds.length === 0 && <ListGroup.Item>No seeds found.</ListGroup.Item>}
              {seeds.length > 0 && filteredSeeds.length === 0 && (
                <ListGroup.Item className="seed-list-empty">No seeds match the current filter.</ListGroup.Item>
              )}
            </SortedList>
          </Card>
        </aside>

        <main className="seed-profile-main">
          {!selectedSeed ? (
            <Card body>No seed selected.</Card>
          ) : (
            <div className="seed-selected-summary">
              <SeedHeader
                seed={selectedSeed}
                onEdit={openEditSeedForm}
                onFirst={()=>selectSeedAtIndex(0)}
                onPrevious={()=>selectSeedAtIndex(selectedSeedIndex-1)}
                onNext={()=>selectSeedAtIndex(selectedSeedIndex+1)}
                onLast={()=>selectSeedAtIndex(filteredSeeds.length-1)}
                canGoFirst={canGoPrevious}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                canGoLast={canGoNext}
              />

              <section className={`seed-guide-drawer${guideOpen ? " seed-guide-drawer-open" : ""}`}>
                <Button
                  type="button"
                  variant="success"
                  className="seed-guide-drawer-tab"
                  aria-expanded={guideOpen}
                  onClick={()=>setGuideOpen(value=>!value)}
                >
                  <BookOpen size={16} />
                  <span>Growing Guide</span>
                </Button>

                {!guideOpen && (
                  <div className="seed-guide-drawer-hint">
                    <BookOpen size={20} aria-hidden="true" />
                    <div>
                      <strong>Growing Guide</strong>
                      <span>Open the tab for crop rotation, soil, spacing, sowing windows, and seed resources.</span>
                    </div>
                  </div>
                )}

                {guideOpen && (
                  <div className="seed-guide-drawer-panel">
                    <div className="seed-guide-details-grid">
                      <section className="seed-reference-guide">
                        <div>
                          <p className="seed-reference-kicker">Growing Guide</p>
                          <h2>{selectedSeed?.plantName || "Select a seed"}</h2>

                          <div className="seed-guide-row-grid">
                            {getGuideRows(selectedSeed||{}).map(row=>(
                              <div key={row.label} className="seed-guide-row">
                                <span>{row.label}</span>
                                <strong>{row.value}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        <aside className="seed-more-for-you">
                          <h3>More For You</h3>

                          {(selectedSeed?.resourcesAndLinks?.notableReferenceLinks||selectedSeed?.resourcesAndLinks?.suggestedSeedLinks||[]).slice(0,4).map((link,index)=>(
                            <a key={`${link}-${index}`} href={link} target="_blank" rel="noreferrer">
                              {link}
                            </a>
                          ))}

                          {!selectedSeed?.resourcesAndLinks?.notableReferenceLinks?.length&&!selectedSeed?.resourcesAndLinks?.suggestedSeedLinks?.length&&(
                            <p>No reference links added yet.</p>
                          )}
                        </aside>
                      </section>

                      <section className="seed-calendar-guide">
                        <div>
                          <p className="seed-reference-kicker">Planting Windows</p>
                          <h2>Favorites, timing, and planting windows</h2>
                        </div>

                        <div className="seed-window-list">
                          {getPlantingWindowRows(selectedSeed||{}).map(row=>(
                            <div key={row.label} className="seed-window-row">
                              <span>{row.label}</span>
                              <strong>{row.value}</strong>
                              <div className="seed-window-bar"><i /></div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {selectedSeed && (
        <div className="seed-detail-flow">
          <section className="seed-detail-overview-grid" aria-label="Seed overview details">
            <SpeciesSelect species={selectedSeed.species} />
            <SeedLifecycle data={selectedSeed.lifecycleInformation} />
            <SeedGrowthInfo growthInformation={selectedSeed.growthInformation} />
            <SeedGrowingConditions data={selectedSeed.growingConditionsAndRequirements} />
          </section>

          <SeedStressRisk data={selectedSeed.stressRisk} />

          <SeedPlantingInfo data={selectedSeed.plantingInformation} />

          <SeedPestDisease
            pestManagement={selectedSeed.pestManagement}
            diseaseManagement={selectedSeed.diseaseManagement}
          />

          <section className="seed-detail-trio">
            <SeedPropagationHarvestStorage
              propagationMethods={selectedSeed.propagationMethods}
              pollinationInformation={selectedSeed.pollinationInformation}
              attractingPollinators={selectedSeed.attractingPollinators}
              harvestingInformation={selectedSeed.harvestingInformation}
              harvestingTechniques={selectedSeed.harvestingTechniques}
              storageTips={selectedSeed.storageTips}
            />

            <SeedUsesBenefits
              data={selectedSeed.usesAndBenefits}
              nutritionalInformation={selectedSeed.nutritionalInformation}
            />

            <SeedEnvironmentalFeatures
              environmentalImpact={selectedSeed.environmentalImpact}
              specialFeatures={selectedSeed.specialFeatures}
              apartmentGardening={selectedSeed.plantingInformation?.apartmentGardening}
              plantingInformation={selectedSeed.plantingInformation}
            />
          </section>

          <section className="seed-detail-pair seed-detail-reference-row">
            <SeedHistory
              data={selectedSeed.historicalInformation}
              culturalInformation={selectedSeed.culturalInformation}
            />

            <SeedResources
              data={selectedSeed.resourcesAndLinks}
              medicalDisclaimer={selectedSeed.medicalDisclaimer}
            />
          </section>
        </div>
      )}

      <Modal show={showSeedForm} onHide={closeSeedForm} size="xl" fullscreen="lg-down" scrollable className="seed-form-modal">
        <Modal.Header closeButton>
          <Modal.Title>{formMode === "edit" ? "Edit Seed" : "Add Seed"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <SeedFormPage
            mode={formMode}
            initialSeed={editingSeed}
            embedded
            user={user}
            onSaved={handleSeedSaved}
            onCancel={closeSeedForm}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}
