// src/components/SeedBannerTemplate.jsx
import "./seedBanner.css";

export default function SeedBannerTemplate({
  name,
  description,
  sun,
  water,
  soil,
  climate,
  image
}) {
  return (
    <div className="seed-banner">
      <img src={image} alt="" className="seed-banner-img" />

      <div className="seed-banner-content">
        <div className="seed-banner-topline">
          Track • Grow • Harvest
        </div>

        <h2 className="seed-banner-title">
          {name || "Unnamed Seed"}
        </h2>

        <p className="seed-banner-description">
          {description || "No description listed."}
        </p>

        <div className="seed-banner-bottom">
          <div className="seed-stat seed-sun">
            <span>Sun</span>
            <strong>{sun || "Not listed"}</strong>
          </div>

          <div className="seed-stat seed-water">
            <span>Water</span>
            <strong>{water || "Not listed"}</strong>
          </div>

          <div className="seed-stat seed-soil">
            <span>Soil</span>
            <strong>{soil || "Not listed"}</strong>
          </div>

          <div className="seed-stat seed-climate">
            <span>Climate</span>
            <strong>{climate || "Not listed"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
