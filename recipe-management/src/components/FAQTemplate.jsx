const faqTemplate={
 eyebrow:"Recipe Management FAQ",
 title:"Frequently Asked Questions",
 lead:"Detailed questions about creating, organizing, updating, and managing recipes, ingredients, measurements, categories, methods, and kitchen reference records.",
 faqs:[
  {
   question:"What is this recipe management application?",
   answer:"This application is designed to manage recipes as structured records instead of loose notes. It helps store recipe names, descriptions, ingredients, measurements, preparation steps, cooking methods, categories, notes, and related kitchen reference data in one organized system."
  },
  {
   question:"What kind of recipes can I manage?",
   answer:"You can manage different types of recipes such as appetizers, entrees, side dishes, sauces, soups, baked goods, desserts, beverages, marinades, spice blends, prep recipes, base recipes, and menu components."
  },
  {
   question:"Can I organize recipes by category?",
   answer:"Yes. Recipes can be organized by categories such as breakfast, lunch, dinner, baking, desserts, sauces, soups, salads, beverages, seafood, poultry, beef, vegetarian, vegan, gluten-free, or custom categories created for your kitchen or business workflow."
  },
  {
   question:"Can I manage ingredients separately from recipes?",
   answer:"Yes. Ingredients can be managed as reusable reference records so the same ingredient can be used across multiple recipes without being recreated each time. This helps keep ingredient naming, spelling, and organization consistent."
  },
  {
   question:"Can recipes include ingredient quantities?",
   answer:"Yes. Recipes can include ingredient quantities using units such as teaspoons, tablespoons, cups, ounces, pounds, grams, kilograms, milliliters, liters, each, bunches, cloves, slices, cans, packs, or custom measurement units."
  },
  {
   question:"Can I manage measurement units?",
   answer:"Yes. Measurement units can be managed as reference data so recipes use consistent units throughout the application. This helps avoid duplicate or inconsistent entries such as tbsp, tablespoon, tablespoons, or Tablespoon being treated as separate values."
  },
  {
   question:"Can I add preparation instructions?",
   answer:"Yes. Each recipe can include preparation instructions, cooking steps, mixing directions, baking instructions, cooling steps, plating notes, storage notes, and service instructions."
  },
  {
   question:"Can recipes have multiple steps?",
   answer:"Yes. Recipes can be written with multiple ordered steps so the process is easier to follow from prep to finish. This is useful for recipes with stages such as marinating, mixing, resting, cooking, reducing, cooling, or garnishing."
  },
  {
   question:"Can I track cooking methods?",
   answer:"Yes. Recipes can include cooking methods such as baking, roasting, grilling, sauteing, frying, steaming, boiling, simmering, braising, poaching, smoking, broiling, chilling, blending, or no-cook preparation."
  },
  {
   question:"Can I add prep time and cook time?",
   answer:"Yes. Recipes can include prep time, cook time, rest time, chill time, total time, or other timing notes depending on how the recipe needs to be tracked."
  },
  {
   question:"Can I track servings or yield?",
   answer:"Yes. Recipes can include serving size, number of portions, batch yield, pan yield, container yield, or production quantity. This helps identify how much a recipe produces before it is used for planning or service."
  },
  {
   question:"Can I add notes to a recipe?",
   answer:"Yes. Recipes can include notes for substitutions, adjustments, testing results, flavor changes, equipment reminders, plating ideas, storage instructions, reheating guidance, or chef observations."
  },
  {
   question:"Can I edit a recipe after saving it?",
   answer:"Yes. Recipes can be updated when ingredients change, preparation steps are improved, measurements are corrected, categories are adjusted, or new notes need to be added."
  },
  {
   question:"Can I archive recipes instead of deleting them?",
   answer:"Yes. Recipes can be archived when they are no longer active but should still be kept for reference. This helps preserve old versions, seasonal items, discontinued recipes, or test recipes without cluttering active lists."
  },
  {
   question:"Can I mark recipes as active or inactive?",
   answer:"Yes. Recipes can use status values such as active, inactive, draft, testing, archived, or approved depending on how your recipe workflow is set up."
  },
  {
   question:"Can this application support recipe testing?",
   answer:"Yes. Recipe records can be used to document test versions, ingredient adjustments, method changes, timing notes, and final approval notes so recipes can be developed and refined over time."
  },
  {
   question:"Can I search for recipes?",
   answer:"Yes. Recipes can be searched by name, category, ingredient, method, status, notes, or other available fields depending on how the search and filter tools are configured."
  },
  {
   question:"Can I filter recipes by ingredient?",
   answer:"Yes. Ingredient-based filtering can help locate recipes that use a specific ingredient, which is useful for menu planning, inventory usage, substitutions, or reducing waste."
  },
  {
   question:"Can I filter recipes by category or type?",
   answer:"Yes. Category and type filters make it easier to find recipes for a specific use, such as sauces, desserts, entrees, catering items, prep recipes, seasonal dishes, or menu components."
  },
  {
   question:"Can this app help keep recipe data consistent?",
   answer:"Yes. By using structured fields and reusable reference records, the application helps reduce duplicate entries, inconsistent ingredient names, uneven measurement formatting, and scattered recipe notes."
  },
  {
   question:"Can I use this for professional kitchen records?",
   answer:"Yes. The application can support professional kitchen workflows by organizing recipes, ingredients, prep notes, yields, categories, cooking methods, and reference data in a consistent format."
  },
  {
   question:"Can I use this for personal recipe organization?",
   answer:"Yes. The application can also be used as a personal recipe archive for storing family recipes, tested dishes, baking formulas, sauces, meal ideas, and cooking notes."
  },
  {
   question:"Can recipes be connected to menus later?",
   answer:"Yes. Recipe records can be used as a foundation for menu planning if the larger application later connects recipes to menus, catering packages, events, production sheets, or costing tools."
  },
  {
   question:"Can recipes be connected to inventory later?",
   answer:"Yes. Ingredient records can support future inventory features if the application is expanded to track stock items, purchasing units, usage, waste, or recipe costing."
  },
  {
   question:"Can this app support recipe costing later?",
   answer:"Yes. Since recipes can store ingredients, quantities, units, and yields, the structure can support future costing features if ingredient prices, purchasing units, and conversion logic are added."
  },
  {
   question:"Can I manage reference data inside the app?",
   answer:"Yes. Reference data such as categories, measurement units, cooking methods, ingredient types, statuses, tags, and departments can be managed to keep the recipe system organized."
  },
  {
   question:"Can I assign tags to recipes?",
   answer:"Yes. Tags can be used to label recipes with extra details such as seasonal, catering, prep-ahead, freezer-friendly, spicy, vegetarian, vegan, gluten-free, dairy-free, test batch, or house favorite."
  },
  {
   question:"Can I include allergen or dietary notes?",
   answer:"Yes. Recipes can include notes related to allergens, dietary restrictions, substitutions, or preparation concerns. This can help identify recipes that may contain common allergens such as dairy, eggs, wheat, soy, peanuts, tree nuts, fish, or shellfish."
  },
  {
   question:"Can I store equipment notes?",
   answer:"Yes. Recipes can include equipment notes such as mixer, blender, food processor, sheet pan, stockpot, saute pan, grill, oven, thermometer, scale, mold, ring cutter, or storage containers."
  },
  {
   question:"Can I store storage and shelf-life notes?",
   answer:"Yes. Recipes can include storage instructions such as refrigerate, freeze, hold hot, hold cold, use within a certain number of days, store covered, label and date, or cool before storing."
  },
  {
   question:"Can I keep recipes organized for repeat use?",
   answer:"Yes. The application is built to make recipes easier to find, reuse, update, and maintain so recipe information does not get lost in notebooks, documents, spreadsheets, or scattered files."
  },
  {
   question:"Who is this application for?",
   answer:"This application can be used by chefs, home cooks, caterers, food service teams, culinary students, recipe developers, small food businesses, and anyone who needs a structured way to manage recipe information."
  }
 ]
};

export default faqTemplate;