const keys=["userInfo","user","authUser","currentUser","ecosphereUser"];

export const getStoredUser=()=>{
 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   const user=parsed?.user||parsed?.data?.user||parsed?.data||parsed;
   if(user?._id||user?.id||user?.username||user?.email)return user;
  }catch(error){console.error(`Unable to read stored user from ${key}`,error);}
 }
 return null;
};

export const storeUser=user=>{const value=JSON.stringify(user);for(const key of keys){localStorage.setItem(key,value);sessionStorage.setItem(key,value);}};
export const clearStoredUser=()=>{for(const key of [...keys,"token","authToken","accessToken","ecosphereToken"]){localStorage.removeItem(key);sessionStorage.removeItem(key);}};
export const getStoredToken=()=>{for(const key of ["token","authToken","accessToken","ecosphereToken"]){const value=localStorage.getItem(key)||sessionStorage.getItem(key);if(value)return value.replace(/^['"]|['"]$/g,"");}return "";};
