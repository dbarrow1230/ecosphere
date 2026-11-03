
import React, { useState } from 'react';
import { BookOpen, Calculator, Users, Utensils, Wine, ClipboardCheck, Info, ExternalLink, Scale, Clock, CheckCircle2, RotateCcw } from 'lucide-react';

const CateringQuantityReference = () => {
    const [guests, setGuests] = useState(50);
    const [hours, setHours] = useState(3);
    const [service, setService] = useState('plated');
    const [yieldPercent, setYieldPercent] = useState(75);
    const [firstHourDrinks, setFirstHourDrinks] = useState(2);
    const [checked, setChecked] = useState([]);

    const portions = [
        { category: 'Appetizers', item: 'Before a meal', amount: '2–3 pieces', basis: 'Per guest, per hour', note: 'Served before the main course' },
        { category: 'Appetizers', item: 'Appetizer-only event', amount: '8–10 pieces', basis: 'Per guest', note: 'Adjust for event duration' },
        { category: 'Protein', item: 'Main protein', amount: '8 oz / 227 g', basis: 'Per guest', note: 'Source-specific portion estimate' },
        { category: 'Sides', item: 'Vegetables', amount: '2 oz / 57 g', basis: 'Per guest', note: 'Plated service estimate' },
        { category: 'Sides', item: 'Potatoes', amount: '4 oz / 113 g', basis: 'Per guest', note: 'Plated service estimate' },
        { category: 'Sides', item: 'Rice', amount: '1 oz / 28 g', basis: 'Per guest', note: 'Cooked or dry basis unspecified' },
        { category: 'Soup', item: 'Soup', amount: '1.25 cups / 296 mL', basis: 'Per guest', note: 'Approximately 20 tablespoons' },
        { category: 'Cheese', item: 'Cheese', amount: '1 oz / 28 g', basis: 'Per guest', note: 'Adjust for menu composition' },
        { category: 'Salads', item: 'Vegetarian main salad', amount: '5–6 oz / 142–170 g', basis: 'Per guest', note: 'Main-course serving' },
        { category: 'Desserts', item: 'Plated dessert', amount: '1 serving', basis: 'Per guest', note: 'Following a full meal' },
        { category: 'Desserts', item: 'Dessert-only event', amount: '4–6 miniature portions', basis: 'Per guest', note: 'Small individual portions' },
        { category: 'Beverages', item: 'First hour', amount: '1–2 drinks', basis: 'Per guest', note: 'Plan water separately' },
        { category: 'Beverages', item: 'Additional hours', amount: '1 drink', basis: 'Per guest, per hour', note: 'Adjust for weather and service' }
    ];

    const checklist = [
        'Confirm expected guest count',
        'Verify service style and event duration',
        'Establish the menu and number of courses',
        'Identify dietary restrictions and allergies',
        'Determine portions for every menu component',
        'Calculate total edible food requirements',
        'Apply preparation and cooking yields',
        'Calculate purchasing quantities',
        'Estimate beverages and desserts',
        'Review food costs against the budget',
        'Confirm final quantities before ordering'
    ];

    const safeGuests = Math.max(0, Number(guests) || 0);
    const safeHours = Math.max(1, Number(hours) || 1);
    const safeYield = Math.min(100, Math.max(1, Number(yieldPercent) || 1));
    const protein = safeGuests * 8 / 16;
    const vegetables = safeGuests * 2 / 16;
    const potatoes = safeGuests * 4 / 16;
    const appetizers = service === 'cocktail' ? safeGuests * 10 : safeGuests * 3 * safeHours;
    const drinks = safeGuests * (Number(firstHourDrinks) + Math.max(0, safeHours - 1));
    const purchaseProtein = protein / (safeYield / 100);
    const format = (value, decimals = 2) => Number(value.toFixed(decimals)).toLocaleString();

    const toggleCheck = index => {
        setChecked(previous => previous.includes(index) ? previous.filter(item => item !== index) : [...previous, index]);
    };

    const reset = () => {
        setGuests(50);
        setHours(3);
        setService('plated');
        setYieldPercent(75);
        setFirstHourDrinks(2);
        setChecked([]);
    };

    return (
        <div className="px-3 px-lg-4 py-4">
            <header className="mb-4">
                <h1 className="h2 fw-bold mb-0">Catering Food Quantity & Portion Planning</h1>
            </header>

            <section className="mb-5">
                <h2 className="h4 fw-bold mb-3"><Users size={22} className="me-2" />Essential Planning Factors</h2>
                <div className="row g-3">
                    {[
                        ['Guest Count', 'Confirm attendance using RSVPs or reliable estimates.'],
                        ['Service Style', 'Plated, buffet, cocktail, or family-style service.'],
                        ['Meal Type', 'Appetizers, complete meals, desserts, or combinations.'],
                        ['Event Duration', 'Longer events may increase food and beverage demand.'],
                        ['Dietary Requirements', 'Account for allergies and dietary preferences.'],
                        ['Cuisine & Menu', 'Evaluate courses, richness, variety, and portions.'],
                        ['Budget', 'Establish food cost limitations before purchasing.'],
                        ['Additional Servings', 'Consider second portions and guest selection rates.']
                    ].map(([title, description]) => (
                        <div className="col-md-6 col-xl-3" key={title}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h3 className="h6 fw-bold">{title}</h3>
                                    <p className="small text-body-secondary mb-0">{description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-5">
                <h2 className="h4 fw-bold mb-3"><Utensils size={22} className="me-2" />Portion Reference Table</h2>
                <div className="card shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th scope="col" className="ps-3">Category</th>
                                    <th scope="col">Food / Item</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Basis</th>
                                    <th scope="col">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portions.map((portion, index) => (
                                    <tr key={index}>
                                        <td className="ps-3 fw-semibold">{portion.category}</td>
                                        <td>{portion.item}</td>
                                        <td className="text-nowrap">{portion.amount}</td>
                                        <td>{portion.basis}</td>
                                        <td className="small text-body-secondary">{portion.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="mb-5" id="catering-calculator">
                <h2 className="h4 fw-bold mb-3"><Calculator size={22} className="me-2" />Interactive Quantity Calculator</h2>
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <label htmlFor="guest-count" className="form-label fw-semibold">Guest Count</label>
                                <input id="guest-count" type="number" min="0" className="form-control" value={guests} onChange={e => setGuests(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="event-hours" className="form-label fw-semibold">Event Duration (hours)</label>
                                <input id="event-hours" type="number" min="1" step="1" className="form-control" value={hours} onChange={e => setHours(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="service-style" className="form-label fw-semibold">Service Style</label>
                                <select id="service-style" className="form-select" value={service} onChange={e => setService(e.target.value)}>
                                    <option value="plated">Plated</option>
                                    <option value="buffet">Buffet</option>
                                    <option value="cocktail">Appetizer Only</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="yield-percent" className="form-label fw-semibold">Protein Yield (%)</label>
                                <input id="yield-percent" type="number" min="1" max="100" className="form-control" value={yieldPercent} onChange={e => setYieldPercent(e.target.value)} />
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            {[
                                { label: 'Main Protein', value: `${format(protein)} lb`, detail: '8 oz per guest', icon: Scale },
                                { label: 'Vegetables', value: `${format(vegetables)} lb`, detail: '2 oz per guest', icon: Utensils },
                                { label: 'Potatoes', value: `${format(potatoes)} lb`, detail: '4 oz per guest', icon: Utensils },
                                { label: 'Dessert Servings', value: format(safeGuests, 0), detail: '1 per guest', icon: Users }
                            ].map(({ label, value, detail, icon: Icon }) => (
                                <div className="col-sm-6 col-xl-3" key={label}>
                                    <div className="border rounded p-3 h-100">
                                        <div className="d-flex align-items-center gap-2 text-body-secondary small mb-2"><Icon size={17} />{label}</div>
                                        <div className="fs-3 fw-bold">{value}</div>
                                        <div className="small text-body-secondary">{detail}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <h3 className="h6 fw-semibold">Appetizer Estimate</h3>
                                    <div className="fs-4 fw-bold">{format(appetizers, 0)} pieces</div>
                                    <p className="small text-body-secondary mb-0">{service === 'cocktail' ? '10 pieces per guest for an appetizer-only event; adjust for duration.' : '3 pieces per guest per hour before a meal.'}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <h3 className="h6 fw-semibold">Raw Protein Purchasing Estimate</h3>
                                    <div className="fs-4 fw-bold">{format(purchaseProtein)} lb</div>
                                    <p className="small text-body-secondary mb-0">Required edible protein ÷ {format(safeYield)}% combined yield.</p>
                                </div>
                            </div>
                        </div>

                        {service === 'buffet' && (
                            <div className="alert alert-warning">
                                <strong>Buffet planning:</strong> These base quantities do not account for second servings or menu selection rates. Calculate each buffet item separately according to projected demand.
                            </div>
                        )}

                        <div className="d-flex justify-content-end">
                            <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={reset}><RotateCcw size={16} /> Reset Calculator</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-5">
                <h2 className="h4 fw-bold mb-3"><Scale size={22} className="me-2" />Calculation Formulas</h2>
                <div className="row g-3">
                    {[
                        ['Food Quantity', 'Guest Count × Portion Size', '50 guests × 8 oz = 400 oz = 25 lb'],
                        ['Appetizers Before a Meal', 'Guests × Pieces per Hour × Hours', '50 × 3 × 2 = 300 pieces'],
                        ['Buffet Servings', 'Guests × Planned Servings per Guest', '50 × 1.5 = 75 servings'],
                        ['As-Purchased Quantity', 'Required Edible Portion ÷ Yield Decimal', '25 lb ÷ 0.75 = 33.33 lb']
                    ].map(([title, formula, example]) => (
                        <div className="col-md-6" key={title}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h3 className="h6 fw-bold">{title}</h3>
                                    <div className="bg-body-tertiary rounded p-3 font-monospace small mb-2">{formula}</div>
                                    <p className="small text-body-secondary mb-0"><strong>Example:</strong> {example}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-5">
                <h2 className="h4 fw-bold mb-3"><Wine size={22} className="me-2" />Beverage Planning</h2>
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <div className="row g-4 align-items-end">
                            <div className="col-md-4">
                                <label htmlFor="first-hour-drinks" className="form-label fw-semibold">Drinks per Guest (First Hour)</label>
                                <select id="first-hour-drinks" className="form-select" value={firstHourDrinks} onChange={e => setFirstHourDrinks(Number(e.target.value))}>
                                    <option value={1}>1 drink</option>
                                    <option value={2}>2 drinks</option>
                                </select>
                            </div>
                            <div className="col-md-8">
                                <div className="border rounded p-3">
                                    <div className="small text-body-secondary mb-1">Estimated Beverage Servings</div>
                                    <div className="fs-3 fw-bold">{format(drinks, 0)} drinks</div>
                                    <div className="small text-body-secondary">{safeGuests} guests × ({firstHourDrinks} first-hour + {Math.max(0, safeHours - 1)} additional-hour drinks)</div>
                                </div>
                            </div>
                        </div>
                        <div className="alert alert-light border mt-3 mb-0 d-flex gap-2">
                            <Info size={18} className="flex-shrink-0 mt-1" />
                            <span className="small">Estimate water separately. Convert drink servings into bottles, cans, or bulk beverage volumes based on actual serving sizes.</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-5">
                <h2 className="h4 fw-bold mb-3"><Clock size={22} className="me-2" />Service Style Considerations</h2>
                <div className="row g-3">
                    {[
                        ['Plated Service', 'Calculate the planned portion for each menu component. Account for entrée choices and dietary substitutions.'],
                        ['Buffet Service', 'Consider return visits, popular dishes, menu variety, and individual item selection rates.'],
                        ['Cocktail Reception', 'Increase appetizer quantities when small bites replace a full meal.'],
                        ['Dessert Reception', 'Offer smaller individual portions and calculate total consumption across all dessert selections.']
                    ].map(([title, description]) => (
                        <div className="col-md-6" key={title}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h3 className="h6 fw-bold">{title}</h3>
                                    <p className="text-body-secondary mb-0">{description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-5">
                <h2 className="h4 fw-bold mb-3"><ClipboardCheck size={22} className="me-2" />Final Planning Checklist</h2>
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-semibold">Planning Progress</span>
                            <span className="small text-body-secondary">{checked.length} / {checklist.length} completed</span>
                        </div>
                        <div className="progress mb-4" role="progressbar" aria-label="Planning checklist progress" aria-valuenow={checked.length} aria-valuemin="0" aria-valuemax={checklist.length}>
                            <div className="progress-bar" style={{ width: `${checked.length / checklist.length * 100}%` }}></div>
                        </div>
                        <div className="row g-3">
                            {checklist.map((item, index) => (
                                <div className="col-md-6" key={index}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id={`planning-${index}`} checked={checked.includes(index)} onChange={() => toggleCheck(index)} />
                                        <label className={`form-check-label ${checked.includes(index) ? 'text-decoration-line-through text-body-secondary' : ''}`} htmlFor={`planning-${index}`}>{item}</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {checked.length === checklist.length && <div className="alert alert-success mt-4 mb-0 d-flex align-items-center gap-2"><CheckCircle2 size={18} /> All planning checklist items completed.</div>}
                    </div>
                </div>
            </section>

            <section className="mb-4">
                <h2 className="h4 fw-bold mb-3"><BookOpen size={22} className="me-2" />Source & Reference Notes</h2>
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h3 className="h6 fw-bold">Primary Source</h3>
                        <p className="mb-2">CMJJ Gourmet — <em>How to Calculate Food Quantities for Catering</em></p>
                        <a href="https://cmjjgourmet.com/blog/how-to-calculate-food-quantities-for-catering/" target="_blank" rel="noopener noreferrer" className="d-inline-flex align-items-center gap-2">
                            View Original Article <ExternalLink size={15} />
                        </a>
                        <hr />
                        <h3 className="h6 fw-bold">Reference Limitations</h3>
                        <p className="small text-body-secondary mb-2">The source's portion recommendations are general catering estimates. Some weights are not explicitly defined as raw or cooked. The calculator treats protein portions as edible yield and assumes the specified yield percentage represents combined preparation and cooking losses.</p>
                        <p className="small text-body-secondary mb-0">The purchasing formulas and worked calculations are supplemental reference tools. Validate quantities using standardized recipes, tested yields, dietary requirements, and historical catering consumption records.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CateringQuantityReference;
