export const formulaSections=[
 {
  title:"Ingredient Purchase Costing",
  formulas:[
   {name:"Cost Per Purchase Unit",formula:"Package Cost ÷ Package Quantity",example:"$9.29 ÷ 2.5 lb = $3.716 per lb",use:"Calculates the cost of one pound, ounce, gallon, item, or other purchase unit."},
   {name:"Total Recipe Units in Package",formula:"Package Quantity × Conversion Rate",example:"10.5 oz × 2.88 tbsp per oz = 30.24 tbsp",use:"Converts the entire purchased package into the unit used by the recipe."},
   {name:"Cost Per Recipe Unit",formula:"Package Cost ÷ Total Recipe Units",example:"$5.76 ÷ 30.24 tbsp = $0.1905 per tbsp",use:"Calculates the cost of one recipe unit after conversion."},
   {name:"Ingredient AP Cost",formula:"Amount Needed × Cost Per Recipe Unit",example:"6 tbsp × $0.1905 = $1.14",use:"Calculates the as-purchased cost of the ingredient used in the recipe."},
   {name:"Packages Required",formula:"Amount Needed ÷ Package Quantity",example:"5 lb ÷ 2.5 lb per bag = 2 bags",use:"Calculates how many packages must be purchased."},
   {name:"Whole Package Purchase Cost",formula:"Packages Required Rounded Up × Package Cost",example:"ROUNDUP(5 lb ÷ 2.5 lb) × $9.29 = $18.58",use:"Calculates the actual cash needed when ingredients can only be purchased as whole packages."},
   {name:"Partial Package Cost",formula:"Amount Used ÷ Package Quantity × Package Cost",example:"1 lb ÷ 2.5 lb × $9.29 = $3.72",use:"Calculates the cost of only the portion used."}
  ]
 },
 {
  title:"Unit Conversion",
  formulas:[
   {name:"Weight Conversion",formula:"Original Quantity × Conversion Factor",example:"2 lb × 16 oz per lb = 32 oz",use:"Converts between pounds, ounces, grams, kilograms, and other weight units."},
   {name:"Volume Conversion",formula:"Original Quantity × Conversion Factor",example:"2 cups × 8 fl oz per cup = 16 fl oz",use:"Converts between gallons, quarts, pints, cups, fluid ounces, tablespoons, and teaspoons."},
   {name:"Count Conversion",formula:"Package Count × Units Per Item",example:"2 dozen × 12 eggs per dozen = 24 eggs",use:"Converts packages, cases, dozens, trays, or sleeves into individual units."},
   {name:"Weight-to-Volume Conversion",formula:"Package Weight ÷ Weight Per Recipe Unit",example:"283.5 g ÷ 9.84 g per tbsp = 28.81 tbsp",use:"Converts dry ingredients purchased by weight into recipe volume units."},
   {name:"Volume-to-Weight Conversion",formula:"Recipe Volume × Weight Per Volume Unit",example:"3 tbsp × 9.84 g per tbsp = 29.52 g",use:"Converts recipe volume into weight when ingredient density is known."},
   {name:"Conversion Rate",formula:"Target Units ÷ Source Units",example:"30.24 tbsp ÷ 10.5 oz = 2.88 tbsp per oz",use:"Calculates a custom conversion rate for a specific ingredient."}
  ]
 },
 {
  title:"Yield and Edible Portion Costing",
  formulas:[
   {name:"Yield Percentage",formula:"Edible Portion Weight ÷ As-Purchased Weight × 100",example:"8 lb usable ÷ 10 lb purchased × 100 = 80%",use:"Calculates the percentage remaining after trim, cooking, cleaning, or waste."},
   {name:"Waste Percentage",formula:"Waste Weight ÷ As-Purchased Weight × 100",example:"2 lb waste ÷ 10 lb purchased × 100 = 20%",use:"Calculates the percentage lost during preparation."},
   {name:"Waste Weight",formula:"As-Purchased Weight − Edible Portion Weight",example:"10 lb − 8 lb = 2 lb waste",use:"Calculates total trim or preparation loss."},
   {name:"Edible Portion Quantity",formula:"As-Purchased Quantity × Yield Percentage",example:"10 lb × 80% = 8 lb EP",use:"Calculates the usable amount after preparation."},
   {name:"As-Purchased Quantity Required",formula:"Edible Portion Quantity Needed ÷ Yield Percentage",example:"8 lb EP needed ÷ 80% = 10 lb AP",use:"Calculates how much must be purchased to produce the required usable quantity."},
   {name:"Edible Portion Unit Cost",formula:"As-Purchased Unit Cost ÷ Yield Percentage",example:"$3.00 per lb ÷ 80% = $3.75 per usable lb",use:"Calculates the real cost per usable unit after waste."},
   {name:"Yield Factor",formula:"1 ÷ Yield Percentage",example:"1 ÷ 80% = 1.25",use:"Multiplier used to convert edible portion requirements into purchase requirements."},
   {name:"Cost of Waste",formula:"Waste Quantity × As-Purchased Unit Cost",example:"2 lb × $3.00 per lb = $6.00",use:"Calculates the value of trim, spoilage, or discarded product."}
  ]
 },
 {
  title:"Recipe Costing",
  formulas:[
   {name:"Total Ingredient Cost",formula:"Sum of All Ingredient Costs",example:"$18.58 + $1.14 + $0.34 = $20.06",use:"Calculates the complete food cost of the recipe."},
   {name:"Sub-Recipe Unit Cost",formula:"Total Sub-Recipe Cost ÷ Total Sub-Recipe Yield",example:"$12.00 ÷ 48 fl oz = $0.25 per fl oz",use:"Calculates the cost per unit of a sauce, dough, seasoning blend, stock, or other sub-recipe."},
   {name:"Sub-Recipe Cost Used",formula:"Sub-Recipe Amount Used × Sub-Recipe Unit Cost",example:"8 fl oz × $0.25 = $2.00",use:"Calculates the cost of the amount of a sub-recipe used in another recipe."},
   {name:"Recipe Cost Including Sub-Recipes",formula:"Direct Ingredient Cost + Sub-Recipe Cost",example:"$22.00 + $3.50 = $25.50",use:"Combines direct ingredients and prepared components."},
   {name:"Adjusted Recipe Cost",formula:"Total Ingredient Cost + Waste + Labor + Overhead + Packaging",example:"$25 + $2 + $15 + $5 + $3 = $50",use:"Calculates the broader production cost beyond ingredients."},
   {name:"Recipe Cost With Contingency",formula:"Recipe Cost × (1 + Contingency Percentage)",example:"$50 × 1.05 = $52.50",use:"Adds a buffer for price fluctuations, minor waste, and calculation uncertainty."}
  ]
 },
 {
  title:"Portion and Serving Costing",
  formulas:[
   {name:"Cost Per Portion",formula:"Total Recipe Cost ÷ Number of Portions",example:"$48 ÷ 12 portions = $4.00 per portion",use:"Calculates the ingredient cost of one serving."},
   {name:"Portion Cost by Weight",formula:"Portion Weight × Recipe Cost Per Weight Unit",example:"8 oz × $0.40 per oz = $3.20",use:"Calculates portion cost when servings are controlled by weight."},
   {name:"Recipe Cost Per Weight Unit",formula:"Total Recipe Cost ÷ Finished Recipe Weight",example:"$48 ÷ 120 oz = $0.40 per oz",use:"Calculates cost per ounce, gram, pound, or kilogram of finished food."},
   {name:"Recipe Cost Per Volume Unit",formula:"Total Recipe Cost ÷ Finished Recipe Volume",example:"$24 ÷ 96 fl oz = $0.25 per fl oz",use:"Calculates cost per cup, fluid ounce, quart, or gallon."},
   {name:"Portions Produced",formula:"Finished Yield ÷ Portion Size",example:"120 oz ÷ 8 oz = 15 portions",use:"Calculates the number of servings a finished recipe produces."},
   {name:"Portion Variance",formula:"Actual Portion Size − Standard Portion Size",example:"8.5 oz − 8 oz = 0.5 oz over",use:"Measures over-portioning or under-portioning."},
   {name:"Over-Portion Cost",formula:"Portion Variance × Cost Per Weight Unit × Portions Sold",example:"0.5 oz × $0.40 × 100 = $20",use:"Calculates the financial impact of inconsistent portioning."}
  ]
 },
 {
  title:"Recipe Scaling",
  formulas:[
   {name:"Recipe Conversion Factor",formula:"Desired Yield ÷ Original Yield",example:"30 portions ÷ 12 portions = 2.5",use:"Calculates the multiplier needed to scale a recipe."},
   {name:"Scaled Ingredient Quantity",formula:"Original Ingredient Quantity × Conversion Factor",example:"4 lb × 2.5 = 10 lb",use:"Calculates the new ingredient quantity for the desired yield."},
   {name:"Scaled Recipe Cost",formula:"Original Recipe Cost × Conversion Factor",example:"$48 × 2.5 = $120",use:"Estimates the cost of a proportionally scaled recipe."},
   {name:"New Yield From Ingredient Quantity",formula:"Available Ingredient Quantity ÷ Original Ingredient Quantity × Original Yield",example:"10 lb ÷ 4 lb × 12 portions = 30 portions",use:"Calculates how many portions can be made from an available ingredient amount."},
   {name:"Batch Count Required",formula:"Required Quantity ÷ Yield Per Batch",example:"100 portions ÷ 24 portions per batch = 4.17 batches",use:"Calculates the number of recipe batches required."},
   {name:"Whole Batches Required",formula:"Round Up Required Quantity ÷ Yield Per Batch",example:"ROUNDUP(100 ÷ 24) = 5 batches",use:"Calculates the number of complete batches needed."}
  ]
 },
 {
  title:"Labor Costing",
  formulas:[
   {name:"Labor Cost Per Minute",formula:"Hourly Wage ÷ 60",example:"$18 per hour ÷ 60 = $0.30 per minute",use:"Calculates labor cost for each minute worked."},
   {name:"Direct Labor Cost",formula:"Labor Time in Hours × Hourly Wage",example:"1.5 hours × $18 = $27",use:"Calculates labor directly assigned to recipe production."},
   {name:"Labor Cost Using Minutes",formula:"Labor Minutes ÷ 60 × Hourly Wage",example:"35 minutes ÷ 60 × $17 = $9.92",use:"Calculates labor cost when production time is recorded in minutes."},
   {name:"Loaded Labor Rate",formula:"Hourly Wage × (1 + Payroll Burden Percentage)",example:"$18 × 1.25 = $22.50 per hour",use:"Includes taxes, insurance, benefits, and other employer labor expenses."},
   {name:"Loaded Labor Cost",formula:"Labor Hours × Loaded Labor Rate",example:"1.5 hours × $22.50 = $33.75",use:"Calculates the complete labor expense rather than wages alone."},
   {name:"Labor Cost Per Portion",formula:"Total Labor Cost ÷ Portions Produced",example:"$27 ÷ 12 = $2.25 per portion",use:"Allocates production labor across each serving."},
   {name:"Labor Percentage",formula:"Labor Cost ÷ Sales Revenue × 100",example:"$2,500 ÷ $10,000 × 100 = 25%",use:"Measures labor expense as a percentage of sales."}
  ]
 },
 {
  title:"Overhead and Utility Costing",
  formulas:[
   {name:"Overhead Rate Per Hour",formula:"Total Period Overhead ÷ Total Productive Hours",example:"$6,000 ÷ 400 hours = $15 per hour",use:"Calculates an hourly rate for allocating indirect operating costs."},
   {name:"Recipe Overhead Cost",formula:"Production Hours × Overhead Rate Per Hour",example:"1.5 hours × $15 = $22.50",use:"Allocates indirect costs to a recipe or batch."},
   {name:"Overhead Percentage Allocation",formula:"Direct Cost × Overhead Percentage",example:"$50 × 15% = $7.50",use:"Adds overhead as a percentage when hourly allocation is unavailable."},
   {name:"Utility Cost Per Minute",formula:"Equipment Cost Per Hour ÷ 60",example:"$1.20 per hour ÷ 60 = $0.02 per minute",use:"Calculates the operating cost of equipment by minute."},
   {name:"Equipment Utility Cost",formula:"Equipment Minutes × Utility Cost Per Minute",example:"45 minutes × $0.02 = $0.90",use:"Calculates utility cost for ovens, mixers, fryers, refrigeration, or other equipment."},
   {name:"Electric Equipment Cost",formula:"Kilowatts × Hours Used × Electricity Rate",example:"3 kW × 1.5 hours × $0.20 = $0.90",use:"Calculates electricity cost from equipment power consumption."},
   {name:"Gas Equipment Cost",formula:"Gas Usage × Gas Rate",example:"1.2 therms × $1.50 = $1.80",use:"Calculates natural gas or propane operating cost."},
   {name:"Overhead Cost Per Portion",formula:"Total Overhead Allocated ÷ Portions Produced",example:"$22.50 ÷ 15 = $1.50 per portion",use:"Allocates overhead expense to each serving."}
  ]
 },
 {
  title:"Packaging and Service Costing",
  formulas:[
   {name:"Packaging Cost Per Portion",formula:"Sum of Packaging Items Per Portion",example:"Container $0.42 + lid $0.12 + label $0.06 = $0.60",use:"Calculates packaging expense for one serving or product."},
   {name:"Total Packaging Cost",formula:"Packaging Cost Per Portion × Portions",example:"$0.60 × 100 = $60",use:"Calculates packaging expense for an entire batch or order."},
   {name:"Disposable Service Cost",formula:"Sum of Napkins + Utensils + Cups + Other Disposables",example:"$0.04 + $0.08 + $0.15 = $0.27",use:"Calculates disposable service materials supplied with an order."},
   {name:"Delivery Cost Per Order",formula:"Labor + Mileage + Tolls + Parking + Delivery Supplies",example:"$12 + $8 + $3 + $2 = $25",use:"Calculates direct delivery expense."},
   {name:"Mileage Cost",formula:"Miles Driven × Cost Per Mile",example:"20 miles × $0.70 = $14",use:"Calculates vehicle cost allocated to delivery or purchasing."},
   {name:"Packaging Percentage",formula:"Packaging Cost ÷ Selling Price × 100",example:"$0.60 ÷ $12 × 100 = 5%",use:"Measures packaging cost as a percentage of sales."}
  ]
 },
 {
  title:"Food Cost and Pricing",
  formulas:[
   {name:"Food Cost Percentage",formula:"Food Cost ÷ Selling Price × 100",example:"$4 ÷ $16 × 100 = 25%",use:"Measures ingredient cost as a percentage of selling price."},
   {name:"Selling Price From Food Cost Percentage",formula:"Food Cost ÷ Target Food Cost Percentage",example:"$4 ÷ 25% = $16",use:"Calculates a selling price based on a target food cost."},
   {name:"Food Cost Allowance",formula:"Selling Price × Target Food Cost Percentage",example:"$16 × 25% = $4",use:"Calculates the maximum food cost allowed at a target percentage."},
   {name:"Cost Multiplier",formula:"1 ÷ Target Food Cost Percentage",example:"1 ÷ 25% = 4",use:"Calculates the multiplier applied to food cost to determine selling price."},
   {name:"Selling Price Using Cost Multiplier",formula:"Food Cost × Cost Multiplier",example:"$4 × 4 = $16",use:"Calculates selling price using the target food cost multiplier."},
   {name:"Prime Cost",formula:"Food Cost + Direct Labor Cost",example:"$4 food + $2.25 labor = $6.25",use:"Combines the two largest direct operating costs."},
   {name:"Prime Cost Percentage",formula:"Prime Cost ÷ Sales Revenue × 100",example:"$6.25 ÷ $16 × 100 = 39.06%",use:"Measures food and direct labor cost as a percentage of sales."},
   {name:"Full Cost Per Portion",formula:"Food + Labor + Overhead + Packaging + Other Direct Costs",example:"$4 + $2.25 + $1.50 + $0.60 = $8.35",use:"Calculates the complete cost of producing one portion."},
   {name:"Selling Price From Full Cost",formula:"Full Cost ÷ Target Total Cost Percentage",example:"$8.35 ÷ 60% = $13.92",use:"Calculates price using all allocated production costs."}
  ]
 },
 {
  title:"Markup, Margin, and Profit",
  formulas:[
   {name:"Markup Amount",formula:"Selling Price − Cost",example:"$16 − $4 = $12",use:"Calculates the dollar amount added above cost."},
   {name:"Markup Percentage",formula:"Profit ÷ Cost × 100",example:"$12 ÷ $4 × 100 = 300%",use:"Measures profit as a percentage of cost."},
   {name:"Selling Price From Markup",formula:"Cost × (1 + Markup Percentage)",example:"$4 × 4 = $16",use:"Calculates selling price from a markup percentage."},
   {name:"Gross Profit",formula:"Selling Price − Cost of Goods Sold",example:"$16 − $4 = $12",use:"Calculates revenue remaining after direct product cost."},
   {name:"Gross Margin Percentage",formula:"Gross Profit ÷ Selling Price × 100",example:"$12 ÷ $16 × 100 = 75%",use:"Measures gross profit as a percentage of selling price."},
   {name:"Selling Price From Margin",formula:"Cost ÷ (1 − Desired Margin Percentage)",example:"$4 ÷ (1 − 75%) = $16",use:"Calculates selling price using a desired gross margin."},
   {name:"Contribution Margin",formula:"Selling Price − Variable Cost",example:"$16 − $6 = $10",use:"Calculates the amount available to cover fixed costs and profit."},
   {name:"Contribution Margin Percentage",formula:"Contribution Margin ÷ Selling Price × 100",example:"$10 ÷ $16 × 100 = 62.5%",use:"Measures contribution margin as a percentage of sales."},
   {name:"Net Profit",formula:"Revenue − All Expenses",example:"$10,000 − $8,000 = $2,000",use:"Calculates profit after all direct and indirect expenses."},
   {name:"Net Profit Margin",formula:"Net Profit ÷ Revenue × 100",example:"$2,000 ÷ $10,000 × 100 = 20%",use:"Measures final profit as a percentage of sales."}
  ]
 },
 {
  title:"Discounts, Tax, and Fees",
  formulas:[
   {name:"Discount Amount",formula:"Original Price × Discount Percentage",example:"$20 × 10% = $2",use:"Calculates the dollar value of a discount."},
   {name:"Discounted Price",formula:"Original Price − Discount Amount",example:"$20 − $2 = $18",use:"Calculates the price after a discount."},
   {name:"Price Before Discount",formula:"Discounted Price ÷ (1 − Discount Percentage)",example:"$18 ÷ 90% = $20",use:"Calculates the original price before a percentage discount."},
   {name:"Sales Tax",formula:"Taxable Selling Price × Tax Rate",example:"$20 × 8.875% = $1.78",use:"Calculates tax added to a taxable sale."},
   {name:"Price Including Tax",formula:"Selling Price × (1 + Tax Rate)",example:"$20 × 1.08875 = $21.78",use:"Calculates the final customer price including tax."},
   {name:"Pre-Tax Price From Tax-Inclusive Price",formula:"Tax-Inclusive Price ÷ (1 + Tax Rate)",example:"$21.78 ÷ 1.08875 = $20",use:"Separates the base selling price from a tax-inclusive total."},
   {name:"Platform Fee",formula:"Selling Price × Platform Fee Percentage",example:"$20 × 30% = $6",use:"Calculates commissions charged by delivery or marketplace platforms."},
   {name:"Net Revenue After Fees",formula:"Selling Price − Discounts − Platform Fees − Transaction Fees",example:"$20 − $2 − $4 − $0.60 = $13.40",use:"Calculates revenue retained after selling-related deductions."},
   {name:"Required Platform Price",formula:"Target Net Revenue ÷ (1 − Platform Fee Percentage)",example:"$16 ÷ 70% = $22.86",use:"Calculates the listed platform price needed to retain a desired net amount."}
  ]
 },
 {
  title:"Inventory Costing",
  formulas:[
   {name:"Beginning Inventory",formula:"Value of Inventory at Start of Period",example:"Beginning inventory = $4,500",use:"Records the opening food and supply inventory value."},
   {name:"Ending Inventory",formula:"Value of Inventory at End of Period",example:"Ending inventory = $3,800",use:"Records the closing food and supply inventory value."},
   {name:"Cost of Goods Sold",formula:"Beginning Inventory + Purchases − Ending Inventory",example:"$4,500 + $8,000 − $3,800 = $8,700",use:"Calculates the cost of inventory consumed during a period."},
   {name:"Actual Food Cost Percentage",formula:"Cost of Goods Sold ÷ Food Sales × 100",example:"$8,700 ÷ $30,000 × 100 = 29%",use:"Measures actual food usage against food revenue."},
   {name:"Inventory Usage",formula:"Beginning Inventory + Purchases − Ending Inventory",example:"$4,500 + $8,000 − $3,800 = $8,700",use:"Calculates the value of inventory used."},
   {name:"Average Inventory",formula:"(Beginning Inventory + Ending Inventory) ÷ 2",example:"($4,500 + $3,800) ÷ 2 = $4,150",use:"Calculates average inventory held during a period."},
   {name:"Inventory Turnover",formula:"Cost of Goods Sold ÷ Average Inventory",example:"$8,700 ÷ $4,150 = 2.10 turns",use:"Measures how frequently inventory is used and replaced."},
   {name:"Days of Inventory",formula:"Days in Period ÷ Inventory Turnover",example:"30 days ÷ 2.10 = 14.29 days",use:"Estimates how many days inventory remains on hand."},
   {name:"Theoretical Food Cost",formula:"Sum of Item Quantity Sold × Standard Item Food Cost",example:"100 meals × $4 standard cost = $400",use:"Calculates expected food cost based on sales and standard recipes."},
   {name:"Food Cost Variance",formula:"Actual Food Cost − Theoretical Food Cost",example:"$450 − $400 = $50 unfavorable",use:"Identifies losses from waste, theft, over-portioning, or inaccurate recipes."}
  ]
 },
 {
  title:"Purchasing and Supplier Comparison",
  formulas:[
   {name:"Normalized Supplier Unit Cost",formula:"Supplier Package Cost ÷ Standardized Package Quantity",example:"$36 ÷ 10 lb = $3.60 per lb",use:"Converts supplier offers into the same comparison unit."},
   {name:"Case Cost Per Unit",formula:"Case Cost ÷ Units Per Case",example:"$48 ÷ 24 cans = $2 per can",use:"Calculates the cost of each item inside a case."},
   {name:"Case Cost Per Weight Unit",formula:"Case Cost ÷ Total Case Weight",example:"$60 ÷ 20 lb = $3 per lb",use:"Calculates case cost by pound, ounce, gram, or kilogram."},
   {name:"Supplier Price Difference",formula:"Higher Unit Cost − Lower Unit Cost",example:"$3.80 − $3.60 = $0.20 per lb",use:"Calculates the unit price difference between suppliers."},
   {name:"Supplier Savings",formula:"Price Difference × Quantity Purchased",example:"$0.20 × 100 lb = $20 savings",use:"Calculates the dollar savings from choosing the lower-cost supplier."},
   {name:"Supplier Savings Percentage",formula:"Price Difference ÷ Original Unit Cost × 100",example:"$0.20 ÷ $3.80 × 100 = 5.26%",use:"Measures supplier savings as a percentage."},
   {name:"Delivered Unit Cost",formula:"(Product Cost + Freight + Delivery Fees) ÷ Total Units",example:"($100 + $15) ÷ 25 units = $4.60",use:"Calculates the true unit cost after delivery charges."},
   {name:"Minimum Order Cost",formula:"Minimum Order Quantity × Unit Cost",example:"50 units × $3 = $150",use:"Calculates the minimum purchase required by a supplier."}
  ]
 },
 {
  title:"Production and Catering",
  formulas:[
   {name:"Guest Count With Buffer",formula:"Expected Guests × (1 + Buffer Percentage)",example:"100 guests × 1.10 = 110 portions",use:"Adds extra portions for unexpected attendance or service loss."},
   {name:"Total Portions Required",formula:"Guest Count × Portions Per Guest",example:"100 guests × 1.25 portions = 125 portions",use:"Calculates production quantity for catered service."},
   {name:"Total Food Quantity Required",formula:"Portions Required × Portion Size",example:"125 × 6 oz = 750 oz",use:"Calculates the total food quantity required."},
   {name:"Catering Food Cost",formula:"Cost Per Portion × Portions Required",example:"$4 × 125 = $500",use:"Calculates food expense for an event."},
   {name:"Catering Labor Cost",formula:"Number of Staff × Hours Worked × Hourly Rate",example:"4 staff × 6 hours × $20 = $480",use:"Calculates event staffing expense."},
   {name:"Catering Total Cost",formula:"Food + Labor + Rentals + Transportation + Supplies + Overhead",example:"$500 + $480 + $200 + $100 + $75 = $1,355",use:"Calculates the complete cost of producing an event."},
   {name:"Catering Price Per Guest",formula:"Total Selling Price ÷ Guest Count",example:"$2,500 ÷ 100 = $25 per guest",use:"Calculates the customer charge per guest."},
   {name:"Required Catering Price",formula:"Total Event Cost ÷ Target Cost Percentage",example:"$1,355 ÷ 60% = $2,258.33",use:"Calculates event pricing from a target total cost percentage."},
   {name:"Catering Profit",formula:"Event Revenue − Total Event Cost",example:"$2,500 − $1,355 = $1,145",use:"Calculates event profit."},
   {name:"Catering Profit Per Guest",formula:"Catering Profit ÷ Guest Count",example:"$1,145 ÷ 100 = $11.45 per guest",use:"Calculates event profit allocated to each guest."}
  ]
 },
 {
  title:"Break-Even and Sales Planning",
  formulas:[
   {name:"Break-Even Units",formula:"Fixed Costs ÷ Contribution Margin Per Unit",example:"$5,000 ÷ $10 = 500 units",use:"Calculates how many units must be sold to cover fixed costs."},
   {name:"Break-Even Sales Revenue",formula:"Fixed Costs ÷ Contribution Margin Percentage",example:"$5,000 ÷ 62.5% = $8,000",use:"Calculates the revenue needed to break even."},
   {name:"Units Required for Target Profit",formula:"(Fixed Costs + Target Profit) ÷ Contribution Margin Per Unit",example:"($5,000 + $2,000) ÷ $10 = 700 units",use:"Calculates sales volume needed to reach a profit goal."},
   {name:"Sales Required for Target Profit",formula:"(Fixed Costs + Target Profit) ÷ Contribution Margin Percentage",example:"($5,000 + $2,000) ÷ 62.5% = $11,200",use:"Calculates revenue needed to reach a profit goal."},
   {name:"Daily Sales Target",formula:"Monthly Sales Goal ÷ Operating Days",example:"$30,000 ÷ 25 days = $1,200 per day",use:"Converts a monthly sales goal into a daily target."},
   {name:"Required Transactions",formula:"Sales Target ÷ Average Check",example:"$1,200 ÷ $24 = 50 transactions",use:"Calculates the number of customer transactions needed."},
   {name:"Average Check",formula:"Total Sales ÷ Number of Transactions",example:"$10,000 ÷ 400 = $25",use:"Calculates average revenue per transaction."},
   {name:"Sales Mix Percentage",formula:"Item Sales ÷ Total Sales × 100",example:"$3,000 ÷ $10,000 × 100 = 30%",use:"Measures each item or category as a share of total sales."}
  ]
 },
 {
  title:"Menu Engineering",
  formulas:[
   {name:"Item Contribution Margin",formula:"Menu Price − Item Food Cost",example:"$16 − $4 = $12",use:"Calculates the dollar contribution from each menu item sold."},
   {name:"Item Popularity Percentage",formula:"Item Quantity Sold ÷ Total Items Sold × 100",example:"120 ÷ 500 × 100 = 24%",use:"Measures the sales popularity of a menu item."},
   {name:"Menu Mix Percentage",formula:"Item Sales Count ÷ Total Category Sales Count × 100",example:"120 ÷ 400 × 100 = 30%",use:"Measures an item's share within its menu category."},
   {name:"Popularity Threshold",formula:"100 ÷ Number of Menu Items × 70%",example:"100 ÷ 10 × 70% = 7%",use:"Calculates the menu engineering popularity benchmark."},
   {name:"Average Contribution Margin",formula:"Total Menu Contribution Margin ÷ Total Items Sold",example:"$5,000 ÷ 500 = $10",use:"Calculates the profitability benchmark for menu engineering."},
   {name:"Menu Engineering Star",formula:"High Popularity + High Contribution Margin",example:"Popularity above threshold and margin above average",use:"Identifies popular and profitable items."},
   {name:"Menu Engineering Plowhorse",formula:"High Popularity + Low Contribution Margin",example:"Popularity above threshold and margin below average",use:"Identifies popular items with weaker profitability."},
   {name:"Menu Engineering Puzzle",formula:"Low Popularity + High Contribution Margin",example:"Popularity below threshold and margin above average",use:"Identifies profitable items that sell poorly."},
   {name:"Menu Engineering Dog",formula:"Low Popularity + Low Contribution Margin",example:"Popularity below threshold and margin below average",use:"Identifies items with weak popularity and profitability."}
  ]
 },
 {
  title:"Waste, Spoilage, and Variance",
  formulas:[
   {name:"Waste Cost",formula:"Waste Quantity × Unit Cost",example:"4 lb × $3.50 = $14",use:"Calculates the value of discarded food."},
   {name:"Waste Percentage of Purchases",formula:"Waste Cost ÷ Purchase Cost × 100",example:"$200 ÷ $5,000 × 100 = 4%",use:"Measures waste relative to food purchases."},
   {name:"Waste Percentage of Sales",formula:"Waste Cost ÷ Food Sales × 100",example:"$200 ÷ $15,000 × 100 = 1.33%",use:"Measures waste relative to food revenue."},
   {name:"Spoilage Cost",formula:"Spoiled Quantity × Unit Cost",example:"10 units × $2.50 = $25",use:"Calculates product value lost to expiration or improper storage."},
   {name:"Production Variance",formula:"Actual Production − Planned Production",example:"110 portions − 100 portions = 10 overproduced",use:"Measures differences between planned and actual output."},
   {name:"Usage Variance",formula:"Actual Ingredient Usage − Standard Ingredient Usage",example:"55 lb − 50 lb = 5 lb unfavorable",use:"Measures excess or reduced ingredient consumption."},
   {name:"Usage Variance Cost",formula:"Usage Variance × Standard Unit Cost",example:"5 lb × $3 = $15 unfavorable",use:"Calculates the financial impact of ingredient usage differences."},
   {name:"Price Variance",formula:"(Actual Unit Cost − Standard Unit Cost) × Actual Quantity",example:"($3.20 − $3.00) × 100 lb = $20 unfavorable",use:"Calculates the financial impact of supplier price changes."}
  ]
 }
];
