import ResourcePage from "./ResourcePageBase";

const Medical=()=>{
	return (
		<ResourcePage
			title="Medical"
			categoryKey="medical"
			description="This page helps users find medical and health-related community resources."
			howToUse="Use the search box to find a service by name, address, phone, or description. Use the dropdown filters to narrow results by location and borough. The table lists all matching medical resources."
		/>
	);
};

export default Medical;