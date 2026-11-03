import usePublicBusiness,{assetUrl} from '@shared/public/usePublicBusiness.js';
import {getRuntimeAppKey} from './currentBusiness.js';
export default function useBusinessLogo(){const {business}=usePublicBusiness(getRuntimeAppKey());return assetUrl(business?.logo);}
