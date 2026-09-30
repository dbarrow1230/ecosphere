// src/utils/dashboard/dashboardApi.js
export const getDashboardData=async(fetcher)=>{
 if(typeof fetcher!=="function") throw new Error("A fetcher function is required");
 return await fetcher();
};

export const getDashboardModuleData=async(fetcher)=>{
 if(typeof fetcher!=="function") throw new Error("A fetcher function is required");
 return await fetcher();
};