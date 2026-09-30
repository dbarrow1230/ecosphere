import React from "react";
import {
  Wine,
  Beef,
  Fish,
  Flame,
  CircleDashed,
  MapPin,
  Sparkles,
  GlassWater,
  UtensilsCrossed,
  Soup,
  BadgeInfo
} from "lucide-react";

export default function WinePairingReference() {
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "56px", height: "56px" }}
                >
                  <Wine size={28} />
                </div>
                <div>
                  <h1 className="h2 mb-1">Wine Pairing Reference Guide</h1>
                  <p className="text-muted mb-0">
                    A BOH quick-reference page for matching wine with food by intensity, flavor, texture, and regional style.
                  </p>
                </div>
              </div>

              <div className="alert alert-light border mb-0">
                <div className="d-flex gap-2 align-items-start">
                  <BadgeInfo size={18} className="mt-1 flex-shrink-0" />
                  <p className="mb-0">
                    Wine pairing is about balancing body, acidity, sweetness, tannin, and flavor intensity so the dish and wine enhance each other instead of competing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <UtensilsCrossed size={20} />
                    <h2 className="h5 mb-0">1. Match Intensity</h2>
                  </div>
                  <ul className="mb-0 ps-3">
                    <li className="mb-2">
                      <strong>Light dishes</strong> like salads, seafood, and simple chicken preparations pair well with <strong>lighter wines</strong> such as Sauvignon Blanc, Pinot Grigio, or Rosé.
                    </li>
                    <li className="mb-2">
                      <strong>Rich or bold dishes</strong> like steak, braised meats, and hearty stews pair better with <strong>full-bodied wines</strong> such as Cabernet Sauvignon, Syrah, or Merlot.
                    </li>
                    <li className="mb-0">
                      Match <strong>light with light</strong> and <strong>rich with rich</strong> whenever possible.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Sparkles size={20} />
                    <h2 className="h5 mb-0">2. Balance Flavor Profiles</h2>
                  </div>
                  <ul className="mb-0 ps-3">
                    <li className="mb-2">
                      <strong>Spicy foods</strong> pair well with <strong>slightly sweet wines</strong> like Riesling or Gewürztraminer.
                    </li>
                    <li className="mb-2">
                      <strong>Acidic foods</strong> such as tomato-based or citrus-heavy dishes work well with <strong>high-acid wines</strong> like Sauvignon Blanc.
                    </li>
                    <li className="mb-2">
                      <strong>Salty foods</strong> can pair nicely with wines that have a touch of sweetness.
                    </li>
                    <li className="mb-0">
                      <strong>Umami-rich dishes</strong> such as mushrooms, aged cheese, or grilled meats often work well with reds that have structure and depth.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <CircleDashed size={20} />
                    <h2 className="h5 mb-0">3. Consider Texture</h2>
                  </div>
                  <ul className="mb-0 ps-3">
                    <li className="mb-2">
                      <strong>Creamy or buttery dishes</strong> benefit from wines with <strong>acidity</strong> to cut through richness.
                    </li>
                    <li className="mb-2">
                      <strong>Fatty meats</strong> pair well with <strong>tannic red wines</strong> because tannins help cleanse the palate.
                    </li>
                    <li className="mb-0">
                      <strong>Fried foods</strong> often pair well with <strong>sparkling wines</strong> because the bubbles refresh the palate.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <GlassWater size={20} />
                    <h2 className="h5 mb-0">4. Complement or Contrast</h2>
                  </div>
                  <div className="mb-3">
                    <h3 className="h6 mb-1">Complementary Pairing</h3>
                    <p className="mb-0 text-muted">
                      Match similar qualities. Example: buttery lobster with oaky Chardonnay.
                    </p>
                  </div>
                  <div>
                    <h3 className="h6 mb-1">Contrasting Pairing</h3>
                    <p className="mb-0 text-muted">
                      Balance opposites. Example: sweet Moscato with salty blue cheese.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <MapPin size={20} />
                    <h2 className="h5 mb-0">5. Regional Pairing</h2>
                  </div>
                  <p className="mb-3">
                    Foods and wines from the same region often work naturally together.
                  </p>
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <div className="border rounded p-3 h-100">
                        <p className="fw-semibold mb-1">Italian Cuisine</p>
                        <p className="mb-0 text-muted">
                          Pair with Italian wines such as Chianti, Barbera, or Pinot Grigio.
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="border rounded p-3 h-100">
                        <p className="fw-semibold mb-1">French Cuisine</p>
                        <p className="mb-0 text-muted">
                          Pair with French wines based on the region and preparation.
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="border rounded p-3 h-100">
                        <p className="fw-semibold mb-1">Spanish Dishes</p>
                        <p className="mb-0 text-muted">
                          Pair with Spanish wines such as Rioja, Albariño, or Cava.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Wine size={20} />
                    <h2 className="h5 mb-0">6. Quick Reference Pairings</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-striped align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Dish Type</th>
                          <th>Suggested Wine Styles</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Fish size={16} />
                              Seafood
                            </div>
                          </td>
                          <td>Sauvignon Blanc, Pinot Grigio, Rosé</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Soup size={16} />
                              Creamy Pasta
                            </div>
                          </td>
                          <td>Chardonnay, Sauvignon Blanc</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Beef size={16} />
                              Steak
                            </div>
                          </td>
                          <td>Cabernet Sauvignon, Syrah</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Flame size={16} />
                              Spicy Foods
                            </div>
                          </td>
                          <td>Riesling, Gewürztraminer</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Sparkles size={16} />
                              Fried Foods
                            </div>
                          </td>
                          <td>Champagne, sparkling wine</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <UtensilsCrossed size={16} />
                              Tomato-Based Dishes
                            </div>
                          </td>
                          <td>Chianti, Sauvignon Blanc</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <BadgeInfo size={20} />
                    <h2 className="h5 mb-0">7. Practical Tips</h2>
                  </div>
                  <ul className="mb-3 ps-3">
                    <li className="mb-2">
                      Identify the <strong>dominant flavor</strong> of the dish first.
                    </li>
                    <li className="mb-2">
                      Pair the <strong>sauce</strong> before the protein when needed.
                    </li>
                    <li className="mb-2">
                      Use acidity as a reset when the dish is rich, fatty, or creamy.
                    </li>
                    <li className="mb-0">
                      When in doubt, choose a wine with <strong>good acidity</strong> because it is often the most versatile.
                    </li>
                  </ul>
                  <div className="alert alert-warning mb-0">
                    <strong>Note:</strong> These are guidelines, not rigid rules. Personal preference still matters, and the best pairing is the one that works for the guest and the dish.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}