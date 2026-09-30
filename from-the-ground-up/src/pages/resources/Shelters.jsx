import ResourcePage from "./ResourcePageBase.jsx";

const Shelters=()=>{
	return (
		<ResourcePage
			title="Shelters"
			categoryKey="shelters"
			description="This page helps users find shelter resources and related housing support options in the system."
			howToUse="Use the search box to find a shelter by name, address, phone, or description. Use the dropdown filters to narrow results by location and borough. The table lists all matching shelter resources."
		/>
	);
};

export default Shelters;