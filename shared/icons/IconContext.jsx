// E:\React-Projects\shared\icons\IconContext.jsx
import React,{createContext,useContext} from "react";
import {WiDaySunny,WiRain,WiSnow} from "weather-icons-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {AiFillAlert} from "react-icons/ai";
import {FaHome,FaAddressCard,FaPhoneAlt,FaEnvelope,FaCompass as ReactCompass,FaArrowUp as ReactArrowUp,FaArrowDown as ReactArrowDown,FaArrowLeft as ReactArrowLeft,FaArrowRight as ReactArrowRight} from "react-icons/fa";
import {WiDaySunny as ReactSunny,WiRain as ReactRain,WiSnow as ReactSnow,WiCloud as ReactCloud,WiStrongWind as ReactWind,WiHumidity as ReactHumidity} from "react-icons/wi";
import { NotebookPen, Clock3, Plus, ChartColumnStacked, Network, Archive, FileText, Star, HeartPulse, Brain, Sparkles, UsersRound, HeartHandshake, BriefcaseBusiness, GraduationCap,
 WalletCards, House, Palette, TrendingUp, Building2, Utensils, Cpu, Plane, Gamepad2, Target, TriangleAlert, ListChecks, BookOpen, CalendarCheck, Smile, CalendarDays,
 Bell, Repeat, StickyNote, ClipboardCheck, Flag, Images, Tags, Layers, Map, CheckCircle2, Activity, CircleDot, AlertCircle, Flame, PauseCircle, XCircle, Timer,
 CalendarRange, Ban, CheckSquare, Square, CalendarClock, CalendarPlus, CalendarHeart, Circle, Gauge, ShieldCheck} from "lucide-react";
import {library} from "@fortawesome/fontawesome-svg-core";

import {
 faCompass,faSun,faQuestion,faUsersCog,faList,faUndo,faArrowUp,faArrowRight,faArrowDown,faArrowLeft,
 faAddressCard,faPhone,faHome,faEnvelope,faBookOpen,faUserShield,faUser,faRightToBracket,faRightFromBracket,faCircleUser,faBook,faSearch,faLanguage,
 faTags,faLayerGroup,faParagraph,faEye,faCheck,faClockRotateLeft,faColumns,faLink,faHeart,faBookBible,faCircleQuestion,faFileContract,faUserSecret,
 faCalendarDays,faUsers,faClipboardList,faBoxesStacked,faChartLine,faPenNib
} from "@fortawesome/free-solid-svg-icons";

import {faFacebookF,faInstagram,faXTwitter,faLinkedinIn} from "@fortawesome/free-brands-svg-icons";

export const IconContext=createContext();

library.add(
 faCompass,faSun,faQuestion,faUsersCog,faList,faUndo,faArrowUp,faArrowRight,faArrowDown,faArrowLeft,
 faAddressCard,faPhone,faHome,faEnvelope,faBookOpen,faUserShield,faUser,
 faRightToBracket,faRightFromBracket,faCircleUser,faBook,faSearch,faLanguage,
 faTags,faLayerGroup,faParagraph,faEye,faCheck,faClockRotateLeft,faColumns,
 faLink,faHeart,faBookBible,faCircleQuestion,faFileContract,faUserSecret,
 faCalendarDays,faUsers,faClipboardList,faBoxesStacked,faChartLine,faPenNib,
 faFacebookF,faInstagram,faXTwitter,faLinkedinIn
);

const faIcon=(icon,size="1x",style)=>(
 <FontAwesomeIcon icon={["fas",icon]} size={size} style={style}/>
);

const faDirectionIcon=(direction)=>{
 switch(direction){
  case "N": return faIcon("arrow-up");
  case "NNE": return faIcon("arrow-up","1x",{transform:"rotate(22.5deg)"});
  case "NE": return faIcon("arrow-up","1x",{transform:"rotate(45deg)"});
  case "ENE": return faIcon("arrow-up","1x",{transform:"rotate(67.5deg)"});
  case "E": return faIcon("arrow-right");
  case "ESE": return faIcon("arrow-up","1x",{transform:"rotate(112.5deg)"});
  case "SE": return faIcon("arrow-up","1x",{transform:"rotate(135deg)"});
  case "SSE": return faIcon("arrow-up","1x",{transform:"rotate(157.5deg)"});
  case "S": return faIcon("arrow-down");
  case "SSW": return faIcon("arrow-up","1x",{transform:"rotate(202.5deg)"});
  case "SW": return faIcon("arrow-up","1x",{transform:"rotate(225deg)"});
  case "WSW": return faIcon("arrow-up","1x",{transform:"rotate(247.5deg)"});
  case "W": return faIcon("arrow-left");
  case "WNW": return faIcon("arrow-up","1x",{transform:"rotate(292.5deg)"});
  case "NW": return faIcon("arrow-up","1x",{transform:"rotate(-45deg)"});
  case "NNW": return faIcon("arrow-up","1x",{transform:"rotate(337.5deg)"});
  default: return faIcon("question");
 }
};

export function IconProvider({children}){
 return(
  <IconContext.Provider
   value={{
    WeatherIcons:{
     Sunny:<WiDaySunny size={48}/>,
     Rain:<WiRain size={48}/>,
     Snow:<WiSnow size={48}/>
    },
    FontAwesomeIcons:{
     Home:faIcon("home"),
     About:faIcon("address-card"),
     Contact:faIcon("phone"),
     Email:faIcon("envelope"),
     StudyMethods:faIcon("book-open"),
     Admin:faIcon("user-shield"),
     Profile:faIcon("circle-user"),
     Account:faIcon("user"),
     Login:faIcon("right-to-bracket"),
     Logout:faIcon("right-from-bracket"),
     Book:faIcon("book"),
     Search:faIcon("search"),
     FAQ:faIcon("circle-question"),
     Terms:faIcon("file-contract"),
     Privacy:faIcon("user-secret"),
     Language:faIcon("language"),
     Tags:faIcon("tags"),
     Bible:faIcon("book-bible"),
     LayerGroup:faIcon("layer-group"),
     Paragraph:faIcon("paragraph"),
     Eye:faIcon("eye"),
     Check:faIcon("check"),
     History:faIcon("clock-rotate-left"),
     Columns:faIcon("columns"),
     Link:faIcon("link"),
     Heart:faIcon("heart"),
     Journal:faIcon("pen-nib"),
     Journaling:faIcon("pen-nib"),
     Writing:faIcon("pen-nib"),
     SunDirection:faIcon("compass"),
     SunExposure:faIcon("sun"),
     Reset:faIcon("undo"),
     TemperatureSun:faIcon("question"),
     Userlist:faIcon("list"),
     List:faIcon("list"),
     Dashboard:faIcon("columns"),
     Feedback:faIcon("columns"),
     Calendar:faIcon("calendar-days"),
     Events:faIcon("calendar-days"),
     Clients:faIcon("users"),
     Orders:faIcon("clipboard-list"),
     Inventory:faIcon("boxes-stacked"),
     Reports:faIcon("chart-line"),
     Facebook:<FontAwesomeIcon icon={["fab","facebook-f"]}/>,
     Instagram:<FontAwesomeIcon icon={["fab","instagram"]}/>,
     Twitter:<FontAwesomeIcon icon={["fab","x-twitter"]}/>,
     LinkedIn:<FontAwesomeIcon icon={["fab","linkedin-in"]}/>,
     CardinalN:faIcon("arrow-up"),
     CardinalNNE:faIcon("arrow-up","1x",{transform:"rotate(22.5deg)"}),
     CardinalNE:faIcon("arrow-up","1x",{transform:"rotate(45deg)"}),
     CardinalENE:faIcon("arrow-up","1x",{transform:"rotate(67.5deg)"}),
     CardinalE:faIcon("arrow-right"),
     CardinalESE:faIcon("arrow-up","1x",{transform:"rotate(112.5deg)"}),
     CardinalSE:faIcon("arrow-up","1x",{transform:"rotate(135deg)"}),
     CardinalSSE:faIcon("arrow-up","1x",{transform:"rotate(157.5deg)"}),
     CardinalS:faIcon("arrow-down"),
     CardinalSSW:faIcon("arrow-up","1x",{transform:"rotate(202.5deg)"}),
     CardinalSW:faIcon("arrow-up","1x",{transform:"rotate(225deg)"}),
     CardinalWSW:faIcon("arrow-up","1x",{transform:"rotate(247.5deg)"}),
     CardinalW:faIcon("arrow-left"),
     CardinalWNW:faIcon("arrow-up","1x",{transform:"rotate(292.5deg)"}),
     CardinalNW:faIcon("arrow-up","1x",{transform:"rotate(-45deg)"}),
     CardinalNNW:faIcon("arrow-up","1x",{transform:"rotate(337.5deg)"}),
     WindDirection:direction=>faDirectionIcon(direction)
    },
    LucideIcons:{
     NotebookPen:<NotebookPen size={20}/>,
     Journaling:<NotebookPen size={20}/>,
     Journal:<NotebookPen size={20}/>,
     Clock3:<Clock3 size={20}/>,
     Plus:<Plus size={20}/>,
     ChartColumnStacked:<ChartColumnStacked size={20}/>,
     Network:<Network size={20}/>,
     Archive:<Archive size={20}/>,
     FileText:<FileText size={20}/>,
     Star:<Star size={20}/>,
     Health:<HeartPulse size={20}/>,
     HeartPulse:<HeartPulse size={20}/>,
     Mindfulness:<Brain size={20}/>,
     Brain:<Brain size={20}/>,
     Spirituality:<Sparkles size={20}/>,
     Sparkles:<Sparkles size={20}/>,
     Family:<UsersRound size={20}/>,
     UsersRound:<UsersRound size={20}/>,
     Relationships:<HeartHandshake size={20}/>,
     HeartHandshake:<HeartHandshake size={20}/>,
     Career:<BriefcaseBusiness size={20}/>,
     BriefcaseBusiness:<BriefcaseBusiness size={20}/>,
     Education:<GraduationCap size={20}/>,
     GraduationCap:<GraduationCap size={20}/>,
     Finance:<WalletCards size={20}/>,
     WalletCards:<WalletCards size={20}/>,
     Home:<House size={20}/>,
     House:<House size={20}/>,
     Creativity:<Palette size={20}/>,
     Palette:<Palette size={20}/>,
     PersonalGrowth:<TrendingUp size={20}/>,
     TrendingUp:<TrendingUp size={20}/>,
     Business:<Building2 size={20}/>,
     Building2:<Building2 size={20}/>,
     Culinary:<Utensils size={20}/>,
     Utensils:<Utensils size={20}/>,
     Technology:<Cpu size={20}/>,
     Cpu:<Cpu size={20}/>,
     Travel:<Plane size={20}/>,
     Plane:<Plane size={20}/>,
     Recreation:<Gamepad2 size={20}/>,
     Gamepad2:<Gamepad2 size={20}/>,
     Target:<Target size={20}/>,
     TriangleAlert:<TriangleAlert size={20}/>,
     ListChecks:<ListChecks size={20}/>,
     BookOpen:<BookOpen size={20}/>,
     CalendarCheck:<CalendarCheck size={20}/>,
     Smile:<Smile size={20}/>,
     CalendarDays:<CalendarDays size={20}/>,
     Bell:<Bell size={20}/>,
     Repeat:<Repeat size={20}/>,
     StickyNote:<StickyNote size={20}/>,
     ClipboardCheck:<ClipboardCheck size={20}/>,
     Flag:<Flag size={20}/>,
     Images:<Images size={20}/>,
     Tags:<Tags size={20}/>,
     Layers:<Layers size={20}/>,
     Map:<Map size={20}/>,
     CheckCircle2:<CheckCircle2 size={20}/>,
     Activity:<Activity size={20}/>,
     CircleDot:<CircleDot size={20}/>,
     AlertCircle:<AlertCircle size={20}/>,
     Flame:<Flame size={20}/>,
     PauseCircle:<PauseCircle size={20}/>,
     XCircle:<XCircle size={20}/>,
     Timer:<Timer size={20}/>,
     CalendarRange:<CalendarRange size={20}/>,
     Ban:<Ban size={20}/>,
     CheckSquare:<CheckSquare size={20}/>,
     Square:<Square size={20}/>,
     CalendarClock:<CalendarClock size={20}/>,
     CalendarPlus:<CalendarPlus size={20}/>,
     CalendarHeart:<CalendarHeart size={20}/>,
     Circle:<Circle size={20}/>,
     Gauge:<Gauge size={20}/>,
     ShieldCheck:<ShieldCheck size={20}/>
    },
    ReactIcons:{
     Home:<FaHome size={32}/>,
     About:<FaAddressCard size={32}/>,
     Contact:<FaPhoneAlt size={32}/>,
     Email:<FaEnvelope size={32}/>,
     Compass:<ReactCompass size={32}/>,
     CardinalN:<ReactArrowUp size={32}/>,
     CardinalS:<ReactArrowDown size={32}/>,
     CardinalNW:<ReactArrowUp size={32} style={{transform:"rotate(-45deg)"}}/>,
     Cardinal1:<ReactArrowUp size={32}/>,
     Cardinal2:<ReactArrowDown size={32}/>,
     Cardinal3:<ReactArrowUp size={32} style={{transform:"rotate(-45deg)"}}/>,
     WeatherSunny:<ReactSunny size={32}/>,
     WeatherRain:<ReactRain size={32}/>,
     WeatherSnow:<ReactSnow size={32}/>,
     WeatherCloud:<ReactCloud size={32}/>,
     WeatherWind:<ReactWind size={32}/>,
     WeatherHumidity:<ReactHumidity size={32}/>
    },
    AntDesignIcons:{
     SomeIcon:<AiFillAlert/>
    },
    TitleIcons:{
     "Admin Instructions":faIcon("users-cog"),
     "User List":faIcon("list"),
     "About Instructions":faIcon("address-card"),
     "Contact Instructions":faIcon("phone")
    }
   }}
  >
   {children}
  </IconContext.Provider>
 );
}

export function useIcons(){
 const icons=useContext(IconContext);
 if(!icons){
  throw new Error("useIcons must be used within an IconProvider");
 }
 return icons;
}