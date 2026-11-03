import ResourcePage from "./ResourcePageBase";

const FoodAndPantry=()=>{
	return (
		<ResourcePage
			title="Food & Pantry"
			categoryKey="food-and-pantry"
			description="This page helps users find food pantries and food support resources available in the system."
			howToUse="Use the search box to find a program by name, address, phone, or description. Use the dropdown filters to narrow results by location and borough. The table lists all matching food and pantry resources."
		/>
	);
};

export default FoodAndPantry;