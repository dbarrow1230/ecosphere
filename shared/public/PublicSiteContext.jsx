import {createContext,useContext} from "react";

export const PublicSiteContext=createContext(null);
export const usePublicSite=()=>useContext(PublicSiteContext);
