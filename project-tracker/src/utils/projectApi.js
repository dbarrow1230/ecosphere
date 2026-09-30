export const unwrapList=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:[];

export const loadTrackerData=async()=>{
 const [projectsResponse,tasksResponse]=await Promise.all([fetch("/api/projects"),fetch("/api/tasks")]);
 if(!projectsResponse.ok||!tasksResponse.ok)throw new Error("Unable to load project tracker data");
 return{projects:unwrapList(await projectsResponse.json()),tasks:unwrapList(await tasksResponse.json())};
};

export const formatDate=value=>{
 if(!value)return "No date";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"No date":date.toLocaleDateString();
};

export const getStoredUser=()=>{
 for(const storage of [localStorage,sessionStorage]){
  for(const key of ["userInfo","user","authUser","currentUser"]){
   try{const value=JSON.parse(storage.getItem(key)||"null");if(value)return value.user||value.data||value;}catch{/* Ignore invalid legacy values. */}
  }
 }
 return null;
};
