// src/pages/forms/PoemForm.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Alert,Button,Col,Form,Modal,Row,Spinner,Image,InputGroup,ButtonGroup,Tab,Tabs} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import {EditorContent,useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {TextStyle} from "@tiptap/extension-text-style";
import {Color} from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import {Extension} from "@tiptap/core";
import AuthorForm from "./AuthorForm.jsx";
import PublisherForm from "./PublisherForm.jsx";

const FontStyle=Extension.create({
 name:"fontStyle",
 addGlobalAttributes(){
  return[
   {
    types:["textStyle"],
    attributes:{
     fontSize:{
      default:null,
      parseHTML:element=>element.style.fontSize||null,
      renderHTML:attributes=>{
       if(!attributes.fontSize)return {};
       return{style:`font-size:${attributes.fontSize}`};
      }
     },
     fontFamily:{
      default:null,
      parseHTML:element=>element.style.fontFamily||null,
      renderHTML:attributes=>{
       if(!attributes.fontFamily)return {};
       return{style:`font-family:${attributes.fontFamily}`};
      }
     }
    }
   }
  ];
 },
 addCommands(){
  return{
   setFontSize:fontSize=>({chain})=>chain().setMark("textStyle",{fontSize}).run(),
   unsetFontSize:()=>({chain})=>chain().setMark("textStyle",{fontSize:null}).removeEmptyTextStyle().run(),
   setFontFamily:fontFamily=>({chain})=>chain().setMark("textStyle",{fontFamily}).run(),
   unsetFontFamily:()=>({chain})=>chain().setMark("textStyle",{fontFamily:null}).removeEmptyTextStyle().run()
  };
 }
});

const BlockStyle=Extension.create({
 name:"blockStyle",
 addGlobalAttributes(){
  return[
   {
    types:["paragraph","heading"],
    attributes:{
     lineHeight:{
      default:null,
      parseHTML:element=>element.style.lineHeight||null,
      renderHTML:attributes=>{
       if(!attributes.lineHeight)return {};
       return{style:`line-height:${attributes.lineHeight}`};
      }
     },
     marginLeft:{
      default:null,
      parseHTML:element=>element.style.marginLeft||null,
      renderHTML:attributes=>{
       if(!attributes.marginLeft)return {};
       return{style:`margin-left:${attributes.marginLeft}`};
      }
     },
     marginRight:{
      default:null,
      parseHTML:element=>element.style.marginRight||null,
      renderHTML:attributes=>{
       if(!attributes.marginRight)return {};
       return{style:`margin-right:${attributes.marginRight}`};
      }
     },
     textIndent:{
      default:null,
      parseHTML:element=>element.style.textIndent||null,
      renderHTML:attributes=>{
       if(!attributes.textIndent)return {};
       return{style:`text-indent:${attributes.textIndent}`};
      }
     }
    }
   }
  ];
 }
});

const formatDateInputValue=value=>{
 if(!value)return "";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"":date.toISOString().split("T")[0];
};

const getTodayInputValue=()=>new Date().toISOString().split("T")[0];

const authorLabel=author=>author?.displayName||`${author?.firstName||""} ${author?.lastName||""}`.trim()||author?.name||"";

const sortByLabel=(items,labeler)=>[...items].sort((a,b)=>labeler(a).localeCompare(labeler(b),undefined,{sensitivity:"base"}));

const normalizeLookupList=(payload,key)=>{
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.[key]))return payload[key];
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 return [];
};

const poemStatusOptions=[
 {value:"draft",label:"Draft"},
 {value:"in-progress",label:"In Progress"},
 {value:"incomplete",label:"Incomplete"},
 {value:"revision",label:"Revision"},
 {value:"finished",label:"Finished"},
 {value:"archived",label:"Archived"}
];

const publishBlockedStatuses=new Set(["draft","incomplete"]);

const publishWhereOptions=[
 {value:"facebook",label:"Facebook"},
 {value:"instagram",label:"Instagram"},
 {value:"threads",label:"Threads"},
 {value:"x",label:"X"},
 {value:"website",label:"Website"},
 {value:"blog",label:"Blog"},
 {value:"journal",label:"Journal"},
 {value:"book",label:"Book"},
 {value:"other",label:"Other"}
];

const normalizePoemStatusValue=value=>{
 const status=String(value||"").trim().toLowerCase();
 if(status==="complete")return "finished";
 return poemStatusOptions.some(option=>option.value===status)?status:"finished";
};

const statusAllowsPublishing=status=>!publishBlockedStatuses.has(normalizePoemStatusValue(status));

const normalizePublishedWhere=value=>{
 if(!Array.isArray(value))return [];
 return value.map(item=>String(item||"").trim()).filter(Boolean);
};

const sameText=(left,right)=>String(left||"").trim().toLowerCase()===String(right||"").trim().toLowerCase();
const isDefaultCollection=value=>sameText(value,"Poems");

const getGenreSections=genre=>Array.isArray(genre?.sections)?genre.sections:[];

const resolveGenreHierarchyFields=({genre,section="",subsection=""})=>{
 const sections=getGenreSections(genre);
 const savedSection=String(section||"").trim();
 const savedSubsection=String(subsection||"").trim();

 if(savedSection){
  const sectionMatch=sections.find(item=>sameText(item?.name,savedSection));
  const subsections=Array.isArray(sectionMatch?.subsections)?sectionMatch.subsections:[];
  const resolvedSubsection=savedSubsection||(subsections.length===1?String(subsections[0]||"").trim():"");
  return {
   section:savedSection,
   subsection:resolvedSubsection
  };
 }

 if(savedSubsection){
  const sectionMatch=sections.find(item=>{
   const subsections=Array.isArray(item?.subsections)?item.subsections:[];
   return subsections.some(candidate=>sameText(candidate,savedSubsection));
  });

  if(sectionMatch){
   return {
    section:String(sectionMatch.name||"").trim(),
    subsection:savedSubsection
   };
  }
 }

 if(sections.length===1){
  const onlySection=sections[0];
  const subsections=Array.isArray(onlySection?.subsections)?onlySection.subsections:[];

  return {
   section:String(onlySection?.name||"").trim(),
   subsection:subsections.length===1?String(subsections[0]||"").trim():""
  };
 }

 return {
  section:"",
  subsection:""
 };
};

function escapeHtml(value){
 return String(value||"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#39;");
}

function preserveSpaces(value){
 return escapeHtml(value).replace(/ /g,"&nbsp;").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");
}

function plainTextToPoemHtml(value){
 const text=String(value||"").replace(/\r\n?/g,"\n");
 const stanzas=text.split(/\n{2,}/);

 return stanzas
  .map(stanza=>{
   const lines=stanza.split("\n").map(line=>preserveSpaces(line));
   return `<p>${lines.join("<br />")||"<br />"}</p>`;
  })
  .join("");
}

function TiptapPoemEditor({value,onChange,isInvalid}){
 const [loadedFontOptions,setLoadedFontOptions]=useState([]);

 const fontSizeOptions=["12px","14px","16px","18px","20px","24px","28px","32px","36px","42px","48px","56px","64px","72px","80px","96px"];

 const fontFamilyOptions=useMemo(()=>{
  const base=[
   {label:"Default",value:""},
   {label:"Theme Heading",value:"var(--heading)"},
   {label:"Theme Body",value:"var(--body)"},
   {label:"Arial",value:"Arial,Helvetica,sans-serif"},
   {label:"Arial Black",value:"Arial Black,Arial,sans-serif"},
   {label:"Bahnschrift",value:"Bahnschrift,Arial,sans-serif"},
   {label:"Calibri",value:"Calibri,Arial,sans-serif"},
   {label:"Cambria",value:"Cambria,Georgia,serif"},
   {label:"Candara",value:"Candara,Arial,sans-serif"},
   {label:"Century Gothic",value:"Century Gothic,Arial,sans-serif"},
   {label:"Consolas",value:"Consolas,Courier New,monospace"},
   {label:"Constantia",value:"Constantia,Georgia,serif"},
   {label:"Corbel",value:"Corbel,Arial,sans-serif"},
   {label:"Courier New",value:"Courier New,monospace"},
   {label:"Franklin Gothic",value:"Franklin Gothic Medium,Arial,sans-serif"},
   {label:"Garamond",value:"Garamond,Georgia,serif"},
   {label:"Georgia",value:"Georgia,serif"},
   {label:"Gill Sans",value:"Gill Sans,Arial,sans-serif"},
   {label:"Impact",value:"Impact,Arial Black,sans-serif"},
   {label:"Lucida Console",value:"Lucida Console,Courier New,monospace"},
   {label:"Lucida Sans",value:"Lucida Sans Unicode,Lucida Grande,Arial,sans-serif"},
   {label:"Palatino",value:"Palatino Linotype,Book Antiqua,Palatino,serif"},
   {label:"Segoe Print",value:"Segoe Print,cursive"},
   {label:"Segoe Script",value:"Segoe Script,cursive"},
   {label:"Segoe UI",value:"Segoe UI,Arial,sans-serif"},
   {label:"Sitka",value:"Sitka Text,Georgia,serif"},
   {label:"Tahoma",value:"Tahoma,Geneva,sans-serif"},
   {label:"Times New Roman",value:"Times New Roman,Times,serif"},
   {label:"Trebuchet MS",value:"Trebuchet MS,Arial,sans-serif"},
   {label:"Verdana",value:"Verdana,Geneva,sans-serif"}
  ];

  const combined=[...base,...loadedFontOptions];
  const seen=new Set();

  return combined.filter(item=>{
   const key=`${item.label}-${item.value}`;
   if(seen.has(key))return false;
   seen.add(key);
   return true;
  });
 },[loadedFontOptions]);

 useEffect(()=>{
  if(typeof document==="undefined"||!document.fonts)return;

  const loadFonts=()=>{
   const fontNames=[...document.fonts]
    .map(font=>String(font.family||"").replace(/^["']|["']$/g,"").trim())
    .filter(Boolean);

   const uniqueFonts=[...new Set(fontNames)]
    .sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:"base"}))
    .map(font=>({label:font,value:`"${font}",serif`}));

   setLoadedFontOptions(uniqueFonts);
  };

  loadFonts();
  document.fonts.ready.then(loadFonts).catch(loadFonts);
 },[]);

 const editor=useEditor({
  extensions:[
   StarterKit.configure({
    heading:{levels:[1,2,3,4,5,6]}
   }),
   Underline,
   Link.configure({
    openOnClick:false,
    autolink:true,
    linkOnPaste:true
   }),
   TextStyle,
   Color,
   TextAlign.configure({
    types:["heading","paragraph"]
   }),
   Typography,
   FontStyle,
   BlockStyle
  ],
  content:value||"",
  parseOptions:{
   preserveWhitespace:"full"
  },
  editorProps:{
   attributes:{
    class:"poem-tiptap-editor"
   },
   handlePaste:(view,event)=>{
    const text=event.clipboardData?.getData("text/plain")||"";
    if(!text)return false;

    event.preventDefault();
    editor?.chain().focus().insertContent(plainTextToPoemHtml(text),{parseOptions:{preserveWhitespace:"full"}}).run();
    return true;
   }
  },
  onUpdate:({editor})=>{
   onChange(editor.getHTML());
  }
 });

 useEffect(()=>{
  if(!editor)return;
  const current=editor.getHTML();
  const next=value||"";
  if(current!==next){
   editor.commands.setContent(next,false,{preserveWhitespace:"full"});
  }
 },[editor,value]);

 if(!editor){
  return(
   <div className={isInvalid?"border border-danger rounded":"border rounded"} style={{minHeight:"300px"}}/>
  );
 }

 const headingValue=[1,2,3,4,5,6].find(level=>editor.isActive("heading",{level}))||"paragraph";
 const fontSizeValue=editor.getAttributes("textStyle").fontSize||"";
 const fontFamilyValue=editor.getAttributes("textStyle").fontFamily||"";
 const colorValue=editor.getAttributes("textStyle").color||"#000000";

 const setLink=()=>{
  const previousUrl=editor.getAttributes("link").href||"";
  const url=window.prompt("Enter link URL",previousUrl);
  if(url===null)return;
  if(url===""){
   editor.chain().focus().extendMarkRange("link").unsetLink().run();
   return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({href:url}).run();
 };

 return(
  <div className={isInvalid?"tiptap-editor-wrap is-invalid border border-danger rounded":"tiptap-editor-wrap border rounded"}>
   <div className="tiptap-toolbar d-flex flex-wrap gap-2 align-items-center p-2 border-bottom">
    <Form.Select
     size="sm"
     style={{width:"140px"}}
     value={headingValue}
     onChange={e=>{
      const value=e.target.value;
      if(value==="paragraph"){
       editor.chain().focus().setParagraph().run();
       return;
      }
      editor.chain().focus().toggleHeading({level:Number(value)}).run();
     }}
    >
     <option value="paragraph">Paragraph</option>
     <option value="1">Heading 1</option>
     <option value="2">Heading 2</option>
     <option value="3">Heading 3</option>
     <option value="4">Heading 4</option>
     <option value="5">Heading 5</option>
     <option value="6">Heading 6</option>
    </Form.Select>

    <Form.Select
     size="sm"
     style={{width:"120px"}}
     value={fontSizeValue}
     onChange={e=>{
      const next=e.target.value;
      if(!next){
       editor.chain().focus().unsetFontSize().run();
       return;
      }
      editor.chain().focus().setFontSize(next).run();
     }}
    >
     <option value="">Size</option>
     {fontSizeOptions.map(size=><option key={size} value={size}>{size}</option>)}
    </Form.Select>

    <Form.Select
     size="sm"
     style={{width:"190px"}}
     value={fontFamilyValue}
     onChange={e=>{
      const next=e.target.value;
      if(!next){
       editor.chain().focus().unsetFontFamily().run();
       return;
      }
      editor.chain().focus().setFontFamily(next).run();
     }}
    >
     {fontFamilyOptions.map(item=><option key={`${item.label}-${item.value}`} value={item.value}>{item.label}</option>)}
    </Form.Select>

    <Form.Control
     type="color"
     size="sm"
     title="Text Color"
     value={colorValue}
     onChange={e=>editor.chain().focus().setColor(e.target.value).run()}
     style={{width:"44px",height:"31px",padding:"3px"}}
    />

    <ButtonGroup size="sm">
     <Button type="button" variant={editor.isActive("bold")?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().toggleBold().run()}>B</Button>
     <Button type="button" variant={editor.isActive("italic")?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().toggleItalic().run()}><em>I</em></Button>
     <Button type="button" variant={editor.isActive("underline")?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().toggleUnderline().run()}><u>U</u></Button>
     <Button type="button" variant={editor.isActive("strike")?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().toggleStrike().run()}><s>S</s></Button>
    </ButtonGroup>

    <ButtonGroup size="sm">
     <Button type="button" variant={editor.isActive({textAlign:"left"})?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().setTextAlign("left").run()}>Left</Button>
     <Button type="button" variant={editor.isActive({textAlign:"center"})?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().setTextAlign("center").run()}>Center</Button>
     <Button type="button" variant={editor.isActive({textAlign:"right"})?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().setTextAlign("right").run()}>Right</Button>
    </ButtonGroup>

    <ButtonGroup size="sm">
     <Button type="button" variant={editor.isActive("bulletList")?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().toggleBulletList().run()}>Bullet</Button>
     <Button type="button" variant={editor.isActive("orderedList")?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().toggleOrderedList().run()}>Number</Button>
     <Button type="button" variant={editor.isActive("blockquote")?"primary":"outline-secondary"} onClick={()=>editor.chain().focus().toggleBlockquote().run()}>Quote</Button>
    </ButtonGroup>

    <ButtonGroup size="sm">
     <Button type="button" variant={editor.isActive("link")?"primary":"outline-secondary"} onClick={setLink}>Link</Button>
     <Button type="button" variant="outline-secondary" onClick={()=>editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</Button>
    </ButtonGroup>
   </div>

   <EditorContent editor={editor}/>
  </div>
 );
}

function PoemForm({isModal=false,onClose,onSaved,poemId=""}){

 const navigate=useNavigate();
 const {id}=useParams();
 const activePoemId=poemId||id||"";
 const isEdit=Boolean(activePoemId);

 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [checkingSlug,setCheckingSlug]=useState(false);
 const [uploadingBackground,setUploadingBackground]=useState(false);
 const [validated,setValidated]=useState(false);
 const [fieldErrors,setFieldErrors]=useState({});
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [slugMessage,setSlugMessage]=useState("");
 const [suggestedSlug,setSuggestedSlug]=useState("");
 const [slugExists,setSlugExists]=useState(false);

 const [authors,setAuthors]=useState([]);
 const [genres,setGenres]=useState([]);
 const [publishers,setPublishers]=useState([]);
 const [showAuthorModal,setShowAuthorModal]=useState(false);
 const [showGenreModal,setShowGenreModal]=useState(false);
 const [showSectionModal,setShowSectionModal]=useState(false);
 const [showSubsectionModal,setShowSubsectionModal]=useState(false);
 const [showPublisherModal,setShowPublisherModal]=useState(false);
 const [newGenreName,setNewGenreName]=useState("");
 const [newSectionName,setNewSectionName]=useState("");
 const [newSubsectionName,setNewSubsectionName]=useState("");
 const [savingGenre,setSavingGenre]=useState(false);
 const [savingSection,setSavingSection]=useState(false);
 const [savingSubsection,setSavingSubsection]=useState(false);
 const [slugTouched,setSlugTouched]=useState(false);
 const collectionTouchedRef=useRef(false);
 const [activeDetailsTab,setActiveDetailsTab]=useState("authorNote");

 const updateCollectionTouched=value=>{
  collectionTouchedRef.current=value;
 };

 const emptyAnalysis={
  formStructure:"",
  theme:[""],
  tone:[""],
  language:[""],
  structure:[""],
  personalInterpretation:[""],
  broaderContextReflection:[""],
  overall:""
 };

 const [formData,setFormData]=useState({
  title:"",
  subtitle:"",
  slug:"",
  author:"",
  genre:"",
  publisher:"",
  collection:"Poems",
  section:"",
  subsection:"",
  status:"draft",
  copyright:"",
  content:"",
  backgroundImage:{
   url:"",
   alt:"",
   caption:"",
   isActive:true
  },
  authorNote:"",
  analysis:emptyAnalysis,
  definitions:[{term:"",meaning:""}],
  isFeatured:false,
  featuredAt:"",
  isPublished:false,
  publishedWhere:[]
 });

 const slugify=value=>{
  return String(value||"")
   .trim()
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-")
   .replace(/^-+|-+$/g,"");
 };

 const stripHtml=value=>{
  return String(value||"")
   .replace(/<[^>]*>/g,"")
   .replace(/&nbsp;/g," ")
   .trim();
 };

 const ensureArray=value=>{
  if(Array.isArray(value)&&value.length)return value.map(item=>String(item||""));
  return [""];
 };

 const cleanArray=value=>{
  if(!Array.isArray(value))return [];
  return value.map(item=>String(item||"").trim()).filter(Boolean);
 };

 const titleSlug=useMemo(()=>slugify(formData.title),[formData.title]);
 const subtitleSlug=useMemo(()=>slugify(formData.subtitle),[formData.subtitle]);
 const selectedGenre=useMemo(()=>{
  return genres.find(genre=>genre?._id===formData.genre)||null;
 },[genres,formData.genre]);
 const suggestedCollection=useMemo(()=>{
  return selectedGenre?.name||"";
 },[selectedGenre]);
 const selectedGenreSections=useMemo(()=>{
  return Array.isArray(selectedGenre?.sections)?selectedGenre.sections:[];
 },[selectedGenre]);
 const selectedGenreSection=useMemo(()=>{
  const sectionName=String(formData.section||"").trim().toLowerCase();
  if(!sectionName)return null;
  return selectedGenreSections.find(section=>String(section?.name||"").trim().toLowerCase()===sectionName)||null;
 },[selectedGenreSections,formData.section]);
 const selectedGenreSubsections=useMemo(()=>{
  return Array.isArray(selectedGenreSection?.subsections)?selectedGenreSection.subsections:[];
 },[selectedGenreSection]);
 const sectionValueIsListed=useMemo(()=>{
  return selectedGenreSections.some(section=>String(section?.name||"").trim().toLowerCase()===String(formData.section||"").trim().toLowerCase());
 },[selectedGenreSections,formData.section]);
 const subsectionValueIsListed=useMemo(()=>{
  return selectedGenreSubsections.some(subsection=>String(subsection||"").trim().toLowerCase()===String(formData.subsection||"").trim().toLowerCase());
 },[selectedGenreSubsections,formData.subsection]);
 const canPublishCurrentStatus=useMemo(()=>statusAllowsPublishing(formData.status),[formData.status]);

 useEffect(()=>{
  if(slugTouched)return;

  const nextSlug=titleSlug||"";

  // eslint-disable-next-line react-hooks/set-state-in-effect
  setFormData(prev=>({
   ...prev,
   slug:nextSlug
  }));
 },[titleSlug,slugTouched]);

 useEffect(()=>{
  let mounted=true;

  const loadData=async()=>{
   try{
    setLoading(true);
    setError("");

    const readJson=async(url,label,{required=false}={})=>{
     try{
      const response=await fetch(url);
      const data=await response.json().catch(()=>null);

      if(!response.ok)throw new Error(data?.message||`Failed to load ${label}`);

      return {data,error:""};
     }catch(err){
      if(required)throw err;
      return {data:null,error:err.message||`Failed to load ${label}`};
     }
    };

    const [authorResult,genreResult,publisherResult,poemResult]=await Promise.all([
     readJson("/api/authors","authors"),
     readJson("/api/genres","genres"),
     readJson("/api/publishers?sort=name&order=asc&limit=10000","publishers"),
     isEdit?readJson(`/api/poems/${activePoemId}`,"poem",{required:true}):Promise.resolve({data:null,error:""})
    ]);

    if(!mounted)return;

    const lookupErrors=[authorResult.error,genreResult.error,publisherResult.error].filter(Boolean);
    const authorList=normalizeLookupList(authorResult.data,"authors");
    const genreList=normalizeLookupList(genreResult.data,"genres");
    const publisherList=normalizeLookupList(publisherResult.data,"publishers");
    const poem=isEdit?poemResult.data||{}:{};
    const selectedPublisher=poem?.publisher&&typeof poem.publisher==="object"?poem.publisher:null;
    const nextPublisherList=selectedPublisher&&selectedPublisher?._id&&!publisherList.some(publisher=>publisher?._id===selectedPublisher._id)
     ?[...publisherList,selectedPublisher]
     :publisherList;

    setAuthors(sortByLabel(authorList,authorLabel));
    setGenres(sortByLabel(genreList,item=>item?.name||""));
    setPublishers(sortByLabel(nextPublisherList,item=>item?.name||""));

    if(lookupErrors.length)setError(lookupErrors.join(" "));

    if(isEdit){
     const analysis=poem.analysis||{};
     const poemGenreId=poem.genre?._id||poem.genre||"";
     const poemGenre=genreList.find(genre=>genre?._id===poemGenreId)||poem.genre;
     const collectionTracksGenre=!poem.collection||isDefaultCollection(poem.collection)||sameText(poem.collection,poemGenre?.name);
     const resolvedHierarchy=resolveGenreHierarchyFields({
      genre:poemGenre,
      section:poem.section,
      subsection:poem.subsection
     });

     updateCollectionTouched(!collectionTracksGenre);
     setFormData({
      title:poem.title||"",
      subtitle:poem.subtitle||"",
      slug:poem.slug||"",
      author:poem.author?._id||poem.author||"",
      genre:poemGenreId,
      publisher:poem.publisher?._id||poem.publisher||"",
      collection:collectionTracksGenre?poemGenre?.name||poem.collection||"Poems":poem.collection,
      section:resolvedHierarchy.section,
      subsection:resolvedHierarchy.subsection,
      status:normalizePoemStatusValue(poem.status),
      copyright:formatDateInputValue(poem.copyright),
      content:poem.content||"",
      backgroundImage:{
       url:poem.backgroundImage?.url||"",
       alt:poem.backgroundImage?.alt||"",
       caption:poem.backgroundImage?.caption||"",
       isActive:poem.backgroundImage?.isActive!==undefined?Boolean(poem.backgroundImage.isActive):true
      },
      authorNote:poem.authorNote||"",
      analysis:{
       formStructure:analysis.formStructure||"",
       theme:ensureArray(analysis.theme),
       tone:ensureArray(analysis.tone),
       language:ensureArray(analysis.language),
       structure:ensureArray(analysis.structure),
       personalInterpretation:ensureArray(analysis.personalInterpretation),
       broaderContextReflection:ensureArray(analysis.broaderContextReflection),
       overall:analysis.overall||""
      },
      definitions:Array.isArray(poem.definitions)&&poem.definitions.length
       ?poem.definitions.map((item)=>({
          term:item.term||"",
          meaning:item.meaning||""
         }))
      :[{term:"",meaning:""}],
      isFeatured:statusAllowsPublishing(poem.status)&&Boolean(poem.isFeatured),
      featuredAt:formatDateInputValue(poem.featuredAt),
      isPublished:statusAllowsPublishing(poem.status)&&Boolean(poem.isPublished),
      publishedWhere:normalizePublishedWhere(poem.publishedWhere)
     });
     setSlugTouched(true);
    }
   }catch(err){
    if(mounted)setError(err.message||"Failed to load form data");
   }finally{
    if(mounted)setLoading(false);
   }
  };

  loadData();

  return()=>{
   mounted=false;
  };
 },[activePoemId,isEdit]);

 useEffect(()=>{
  if(!formData.slug){
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setSlugMessage("");
   setSuggestedSlug("");
   setSlugExists(false);
   return;
  }

  const timer=setTimeout(async()=>{
   try{
    setCheckingSlug(true);
    setSlugMessage("");
    setSuggestedSlug("");
    setSlugExists(false);

    const params=new URLSearchParams();
    params.set("title",formData.title||"");
    params.set("subtitle",formData.subtitle||"");
    params.set("slug",formData.slug||"");
    if(isEdit&&activePoemId)params.set("id",activePoemId);

    const response=await fetch(`/api/poems/check-slug?${params.toString()}`);
    const data=await response.json().catch(()=>null);

    if(!response.ok)throw new Error(data?.message||"Failed to check slug");

    if(data?.exists){
     setSlugExists(true);
     setSuggestedSlug(data.suggestedSlug||"");
     setSlugMessage(data.suggestedSlug?`Slug already exists. Suggested: ${data.suggestedSlug}`:"Slug already exists.");
    }else{
     setSlugExists(false);
     setSlugMessage("Slug is available.");
    }
   }catch(err){
    setSlugMessage(err.message||"Failed to check slug.");
   }finally{
    setCheckingSlug(false);
   }
  },500);

  return()=>clearTimeout(timer);
 },[formData.slug,formData.title,formData.subtitle,isEdit,activePoemId]);

 const titleText=useMemo(()=>{
  return isEdit?"Edit Poem":"Add Poem";
 },[isEdit]);

 const validateForm=()=>{
  const errors={};

  if(!formData.title.trim())errors.title="Title is required.";
  if(!formData.slug.trim())errors.slug="Slug is required.";
  if(slugExists)errors.slug="Slug already exists. Choose another slug or use the suggested slug.";
  if(!formData.author)errors.author="Author is required.";
  if(!formData.genre)errors.genre="Genre is required.";
  if(!stripHtml(formData.content))errors.content="Content is required.";

  const definitionErrors=formData.definitions.map(item=>{
   const hasTerm=Boolean(item.term.trim());
   const hasMeaning=Boolean(item.meaning.trim());

   if(hasTerm&&!hasMeaning)return{meaning:"Meaning is required when a term is entered."};
   if(!hasTerm&&hasMeaning)return{term:"Term is required when a meaning is entered."};
   return{};
  });

  if(definitionErrors.some(item=>item.term||item.meaning)){
   errors.definitions=definitionErrors;
  }

  setFieldErrors(errors);

  return Object.keys(errors).length===0;
 };

 const selectCreatedAuthor=author=>{
  const saved=author?.author||author;
  if(!saved?._id)return;
  setAuthors(prev=>{
   const next=prev.some(item=>item?._id===saved._id)
    ?prev.map(item=>item?._id===saved._id?saved:item)
    :[...prev,saved];
   return sortByLabel(next,authorLabel);
  });
  setFormData(prev=>({...prev,author:saved._id}));
  setFieldErrors(prev=>({...prev,author:""}));
  setShowAuthorModal(false);
 };

 const selectCreatedPublisher=publisher=>{
  const saved=publisher?.publisher||publisher;
  if(!saved?._id)return;
  setPublishers(prev=>{
   const next=prev.some(item=>item?._id===saved._id)
    ?prev.map(item=>item?._id===saved._id?saved:item)
    :[...prev,saved];
   return sortByLabel(next,item=>item?.name||"");
  });
  setFormData(prev=>({...prev,publisher:saved._id}));
  setShowPublisherModal(false);
 };

 const createGenre=async(e)=>{
  e.preventDefault();
  if(savingGenre)return;

  const name=newGenreName.trim();
  if(!name){
   setError("Genre name is required.");
   return;
  }

  try{
   setSavingGenre(true);
   setError("");

   const response=await fetch("/api/genres",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name})
   });
   const data=await response.json().catch(()=>null);

   if(!response.ok)throw new Error(data?.message||"Failed to create genre");

   const saved=data?.genre||data;
   if(!saved?._id)throw new Error("Created genre was missing an id");

   setGenres(prev=>{
    const next=prev.some(item=>item?._id===saved._id)
     ?prev.map(item=>item?._id===saved._id?saved:item)
     :[...prev,saved];
    return sortByLabel(next,item=>item?.name||"");
   });
   setFormData(prev=>{
    const currentGenre=genres.find(genre=>genre?._id===prev.genre);
    const collectionTracksGenre=!collectionTouchedRef.current||!String(prev.collection||"").trim()||isDefaultCollection(prev.collection)||sameText(prev.collection,currentGenre?.name);

    updateCollectionTouched(!collectionTracksGenre);

    return {
     ...prev,
     genre:saved._id,
     collection:collectionTracksGenre?saved.name||prev.collection:prev.collection,
     section:"",
     subsection:""
    };
   });
   setFieldErrors(prev=>({...prev,genre:""}));
   setNewGenreName("");
   setShowGenreModal(false);
  }catch(err){
   setError(err.message||"Failed to create genre");
  }finally{
   setSavingGenre(false);
  }
 };

 const saveGenreHierarchy=async(nextSections)=>{
  if(!selectedGenre?._id)throw new Error("Select a genre first.");

  const response=await fetch(`/api/genres/${selectedGenre._id}`,{
   method:"PUT",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    name:selectedGenre.name,
    sections:nextSections
   })
  });

  const data=await response.json().catch(()=>null);

  if(!response.ok)throw new Error(data?.message||"Failed to update genre hierarchy");

  const saved=data?.genre||data;
  setGenres(prev=>prev.map(genre=>genre?._id===saved?._id?saved:genre));
  return saved;
 };

 const createSection=async(e)=>{
  e.preventDefault();
  if(savingSection)return;

  const name=newSectionName.trim();

  if(!name){
   setError("Section name is required.");
   return;
  }

  try{
   setSavingSection(true);
   setError("");

   const exists=selectedGenreSections.some(section=>String(section?.name||"").trim().toLowerCase()===name.toLowerCase());
   const nextSections=exists
    ?selectedGenreSections
    :[...selectedGenreSections,{name,subsections:[]}];

   await saveGenreHierarchy(nextSections);
   setFormData(prev=>({...prev,section:name,subsection:""}));
   setNewSectionName("");
   setShowSectionModal(false);
  }catch(err){
   setError(err.message||"Failed to create section");
  }finally{
   setSavingSection(false);
  }
 };

 const createSubsection=async(e)=>{
  e.preventDefault();
  if(savingSubsection)return;

  const name=newSubsectionName.trim();

  if(!name){
   setError("Subsection name is required.");
   return;
  }

  if(!formData.section){
   setError("Select or create a section first.");
   return;
  }

  try{
   setSavingSubsection(true);
   setError("");

   const nextSections=selectedGenreSections.map(section=>{
    if(String(section?.name||"").trim().toLowerCase()!==formData.section.trim().toLowerCase())return section;

    const subsections=Array.isArray(section.subsections)?section.subsections:[];
    const exists=subsections.some(item=>String(item||"").trim().toLowerCase()===name.toLowerCase());

    return {
     ...section,
     subsections:exists?subsections:[...subsections,name]
    };
   });

   await saveGenreHierarchy(nextSections);
   setFormData(prev=>({...prev,subsection:name}));
   setNewSubsectionName("");
   setShowSubsectionModal(false);
  }catch(err){
   setError(err.message||"Failed to create subsection");
  }finally{
   setSavingSubsection(false);
  }
 };

const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;
  if(name==="genre"){
   setFormData(prev=>{
    const previousGenre=genres.find(genre=>genre?._id===prev.genre);
    const nextGenre=genres.find(genre=>genre?._id===value);
    const collectionTracksGenre=!collectionTouchedRef.current||!String(prev.collection||"").trim()||isDefaultCollection(prev.collection)||sameText(prev.collection,previousGenre?.name);
    const resolvedHierarchy=resolveGenreHierarchyFields({genre:nextGenre});

    updateCollectionTouched(!collectionTracksGenre);

    return {
     ...prev,
     genre:value,
     collection:collectionTracksGenre?nextGenre?.name||"":prev.collection,
     section:resolvedHierarchy.section,
     subsection:resolvedHierarchy.subsection
    };
   });
   setFieldErrors(prev=>({...prev,genre:""}));
   return;
  }

  if(name==="collection"){
   updateCollectionTouched(!isDefaultCollection(value)&&!sameText(value,selectedGenre?.name));
  }

  setFormData((prev)=>{
   if(name==="section"){
    return {
     ...prev,
     section:value,
     subsection:""
    };
   }

   if(name==="status"){
    const nextStatus=normalizePoemStatusValue(value);
    const canPublishNext=statusAllowsPublishing(nextStatus);
    return {
     ...prev,
     status:nextStatus,
     isFeatured:canPublishNext?prev.isFeatured:false,
     featuredAt:canPublishNext?prev.featuredAt:"",
     isPublished:canPublishNext?prev.isPublished:false,
     publishedWhere:canPublishNext?prev.publishedWhere:[]
    };
   }

   if(name==="isFeatured"){
    if(!statusAllowsPublishing(prev.status)){
     return {
      ...prev,
      isFeatured:false,
      featuredAt:""
     };
    }

    return {
     ...prev,
     isFeatured:checked,
     featuredAt:checked?(prev.featuredAt||getTodayInputValue()):""
    };
   }

   if(name==="isPublished"){
    if(!statusAllowsPublishing(prev.status)){
     return {
      ...prev,
      isPublished:false,
      publishedWhere:[]
     };
    }

    return {
     ...prev,
     isPublished:checked,
     publishedWhere:checked?prev.publishedWhere:[]
    };
   }

   return {
    ...prev,
    [name]:type==="checkbox"?checked:value
   };
  });
  setFieldErrors(prev=>({...prev,[name]:""}));
 };

 const handlePublishedWhereChange=(value,checked)=>{
  setFormData(prev=>{
   if(!statusAllowsPublishing(prev.status)||!prev.isPublished){
    return {
     ...prev,
     publishedWhere:[]
    };
   }

   const current=normalizePublishedWhere(prev.publishedWhere);
   return {
    ...prev,
    publishedWhere:checked
     ?[...new Set([...current,value])]
     :current.filter(item=>item!==value)
   };
  });
 };

 const handleSlugChange=e=>{
  setSlugTouched(true);
  setFormData(prev=>({
   ...prev,
   slug:slugify(e.target.value)
  }));
  setFieldErrors(prev=>({...prev,slug:""}));
 };

 const handleUseTitleSlug=()=>{
  setSlugTouched(false);
  setFormData(prev=>({
   ...prev,
   slug:titleSlug
  }));
  setFieldErrors(prev=>({...prev,slug:""}));
 };

 const handleUseSubtitleSlug=()=>{
  if(!titleSlug)return;
  setSlugTouched(true);
  setFormData(prev=>({
   ...prev,
   slug:subtitleSlug?`${titleSlug}-${subtitleSlug}`:titleSlug
  }));
  setFieldErrors(prev=>({...prev,slug:""}));
 };

 const handleUseSuggestedSlug=()=>{
  if(!suggestedSlug)return;
  setSlugTouched(true);
  setSlugExists(false);
  setFormData(prev=>({
   ...prev,
   slug:suggestedSlug
  }));
  setFieldErrors(prev=>({...prev,slug:""}));
 };

 const handleBackgroundChange=(e)=>{
  const {name,value,type,checked}=e.target;
  setFormData((prev)=>({
   ...prev,
   backgroundImage:{
    ...prev.backgroundImage,
    [name]:type==="checkbox"?checked:value
   }
  }));
 };

 const handleBackgroundFileChange=async(e)=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(!file.type.startsWith("image/")){
   setError("Please select a valid image file");
   return;
  }

  try{
   setUploadingBackground(true);
   setError("");

   const uploadData=new FormData();
   uploadData.append("file",file);

   const response=await fetch("/api/upload/poem-images",{
    method:"POST",
    body:uploadData
   });

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Failed to upload image");
   }

   setFormData((prev)=>({
    ...prev,
    backgroundImage:{
     ...prev.backgroundImage,
     url:data?.url||"",
     alt:prev.backgroundImage.alt||file.name.replace(/\.[^/.]+$/,"")
    }
   }));
  }catch(err){
   setError(err.message||"Failed to upload image");
  }finally{
   setUploadingBackground(false);
  }
 };

 const clearBackgroundImage=()=>{
  setFormData((prev)=>({
   ...prev,
   backgroundImage:{
    ...prev.backgroundImage,
    url:"",
    alt:"",
    caption:"",
    isActive:true
   }
  }));
 };

 const handleAnalysisTextChange=(field,value)=>{
  setFormData(prev=>({
   ...prev,
   analysis:{
    ...prev.analysis,
    [field]:value
   }
  }));
 };

 const handleAnalysisArrayChange=(field,index,value)=>{
  setFormData(prev=>({
   ...prev,
   analysis:{
    ...prev.analysis,
    [field]:prev.analysis[field].map((item,i)=>i===index?value:item)
   }
  }));
 };

 const addAnalysisItem=field=>{
  setFormData(prev=>({
   ...prev,
   analysis:{
    ...prev.analysis,
    [field]:[...prev.analysis[field],""]
   }
  }));
 };

 const removeAnalysisItem=(field,index)=>{
  setFormData(prev=>({
   ...prev,
   analysis:{
    ...prev.analysis,
    [field]:prev.analysis[field].length===1
     ?[""]
     :prev.analysis[field].filter((_,i)=>i!==index)
   }
  }));
 };

 const handleDefinitionChange=(index,field,value)=>{
  setFormData((prev)=>({
   ...prev,
   definitions:prev.definitions.map((item,i)=>i===index?{...item,[field]:value}:item)
  }));
  setFieldErrors(prev=>{
   const nextDefinitions=Array.isArray(prev.definitions)?[...prev.definitions]:[];
   nextDefinitions[index]={...(nextDefinitions[index]||{}),[field]:""};
   return {...prev,definitions:nextDefinitions};
  });
 };

 const addDefinition=()=>{
  setFormData((prev)=>({
   ...prev,
   definitions:[...prev.definitions,{term:"",meaning:""}]
  }));
 };

 const removeDefinition=(index)=>{
  setFormData((prev)=>({
   ...prev,
   definitions:prev.definitions.length===1
    ?[{term:"",meaning:""}]
    :prev.definitions.filter((_,i)=>i!==index)
  }));
  setFieldErrors(prev=>{
   if(!Array.isArray(prev.definitions))return prev;
   return {...prev,definitions:prev.definitions.filter((_,i)=>i!==index)};
  });
 };

 const renderAnalysisArray=(field,label,placeholder)=>{
  return(
   <div className="mb-4">
    <div className="d-flex align-items-center justify-content-between mb-2">
     <h5 className="m-0">{label}</h5>
     <Button type="button" variant="secondary" size="sm" onClick={()=>addAnalysisItem(field)}>Add</Button>
    </div>

    {formData.analysis[field].map((item,index)=>(
     <Row className="g-2 align-items-start mb-2" key={`${field}-${index}`}>
      <Col>
       <Form.Control
        as="textarea"
        rows={2}
        value={item}
        placeholder={placeholder}
        onChange={e=>handleAnalysisArrayChange(field,index,e.target.value)}
       />
      </Col>
      <Col xs="auto">
       <Button type="button" variant="outline-danger" onClick={()=>removeAnalysisItem(field,index)}>
        Remove
       </Button>
      </Col>
     </Row>
    ))}
   </div>
  );
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();
  e.stopPropagation();

  setValidated(true);

  const isValid=validateForm();

  if(!isValid){
   setError("Please fix the highlighted fields.");
   return;
  }

  if(uploadingBackground){
   setError("Please wait for the image upload to finish.");
   return;
  }

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    title:formData.title,
    subtitle:formData.subtitle,
    slug:formData.slug,
    author:formData.author,
    genre:formData.genre,
    publisher:formData.publisher||null,
    collection:formData.collection,
    section:formData.section,
    subsection:formData.subsection,
    status:formData.status,
    copyright:formData.copyright||null,
    content:formData.content,
    backgroundImage:{
     url:formData.backgroundImage.url,
     alt:formData.backgroundImage.alt,
     caption:formData.backgroundImage.caption,
     isActive:formData.backgroundImage.isActive
    },
    authorNote:formData.authorNote,
    analysis:{
     formStructure:formData.analysis.formStructure,
     theme:cleanArray(formData.analysis.theme),
     tone:cleanArray(formData.analysis.tone),
     language:cleanArray(formData.analysis.language),
     structure:cleanArray(formData.analysis.structure),
     personalInterpretation:cleanArray(formData.analysis.personalInterpretation),
     broaderContextReflection:cleanArray(formData.analysis.broaderContextReflection),
     overall:formData.analysis.overall
    },
    definitions:formData.definitions.filter((item)=>item.term.trim()||item.meaning.trim()),
    isFeatured:formData.isFeatured,
    featuredAt:formData.isFeatured?formData.featuredAt||null:null,
    isPublished:formData.isPublished,
    publishedWhere:formData.isPublished?normalizePublishedWhere(formData.publishedWhere):[]
   };

   const response=await fetch(isEdit?`/api/poems/${activePoemId}`:"/api/poems",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await response.json().catch(()=>null);

   if(response.status===409){
    setSuggestedSlug(data?.suggestedSlug||"");
    setSlugExists(true);
    setFieldErrors(prev=>({...prev,slug:data?.suggestedSlug?`Slug already exists. Suggested: ${data.suggestedSlug}`:"Slug already exists."}));
    throw new Error(data?.suggestedSlug?`${data.message} Suggested: ${data.suggestedSlug}`:data?.message||"Slug already exists.");
   }

   if(!response.ok){
    throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} poem`);
   }

   const savedPoem=data?.poem||data;

   setFormData(prev=>({
    ...prev,
    slug:savedPoem?.slug||prev.slug
   }));

   setFieldErrors({});
   setValidated(false);
   setSuccess(`Poem ${isEdit?"updated":"created"} successfully`);

   if(isModal){
    if(onSaved)onSaved(savedPoem);
    return;
   }

   setTimeout(()=>{
    navigate("/poems");
   },800);
  }catch(err){
   setError(err.message||"Failed to save poem");
  }finally{
   setSaving(false);
  }
 };

 if(loading){
  return(
   <section className="form-page py-4">
    <div className="text-center">
     <Spinner animation="border" role="status"/>
    </div>
   </section>
  );
 }

 return(
  <section className="form-page py-2">
   {!isModal?(
    <div className="form-page-header mb-4">
     <h1 className="mb-2">{titleText}</h1>
     <p className="mb-0">{isEdit?"Update poem details and content.":"Create a new poem entry."}</p>
    </div>
   ):null}

   {error?<Alert variant="danger">{error}</Alert>:null}
   {success?<Alert variant="success">{success}</Alert>:null}

   <Form noValidate validated={validated} onSubmit={handleSubmit}>
    <Row className="g-3">

     <Col md={6}>
      <Form.Group className="poem-inline-group">
       <Form.Label>Title</Form.Label>
       <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required isInvalid={Boolean(fieldErrors.title)}/>
       <Form.Control.Feedback type="invalid">{fieldErrors.title||"Title is required."}</Form.Control.Feedback>
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group className="poem-inline-group">
       <Form.Label>Subtitle</Form.Label>
       <Form.Control type="text" name="subtitle" value={formData.subtitle} onChange={handleChange}/>
      </Form.Group>
     </Col>

     <Col xs={12}>
      <Form.Group className="poem-inline-group">
       <Form.Label>Slug</Form.Label>
       <InputGroup hasValidation>
        <Form.Control type="text" name="slug" value={formData.slug} onChange={handleSlugChange} required isInvalid={Boolean(fieldErrors.slug)}/>
        <Button type="button" variant="outline-secondary" onClick={handleUseTitleSlug}>Use Title</Button>
        <Button type="button" variant="outline-secondary" onClick={handleUseSubtitleSlug} disabled={!subtitleSlug}>Use Subtitle</Button>
        <Button type="button" variant="outline-primary" onClick={handleUseSuggestedSlug} disabled={!suggestedSlug}>Use Suggested</Button>
        <Form.Control.Feedback type="invalid">{fieldErrors.slug||"Slug is required."}</Form.Control.Feedback>
       </InputGroup>
       <div className={slugMessage.includes("available")?"text-success small mt-1":"text-danger small mt-1"}>
        {checkingSlug?"Checking slug...":slugMessage}
       </div>
      </Form.Group>
     </Col>

     <Col xl={6} lg={6}>
      <Form.Group className="poem-inline-group">
       <Form.Label>Author</Form.Label>
       <div className="poem-linked-field">
        <Form.Select name="author" value={formData.author} onChange={handleChange} required isInvalid={Boolean(fieldErrors.author)}>
         <option value="">Select Author</option>
         {authors.map((author)=>(
          <option key={author._id} value={author._id}>
           {authorLabel(author)}
          </option>
         ))}
        </Form.Select>
        <div className="poem-linked-field-actions">
         <Button type="button" variant="outline-primary" onClick={()=>setShowAuthorModal(true)}>New</Button>
        </div>
        <Form.Control.Feedback type="invalid">{fieldErrors.author||"Author is required."}</Form.Control.Feedback>
       </div>
      </Form.Group>
     </Col>

     <Col xl={6} lg={6}>
      <Form.Group className="poem-inline-group">
       <Form.Label>Publisher</Form.Label>
       <div className="poem-linked-field">
        <Form.Select name="publisher" value={formData.publisher} onChange={handleChange}>
         <option value="">Select Publisher</option>
         {publishers.map((publisher)=>(
          <option key={publisher._id} value={publisher._id}>{publisher.name}</option>
         ))}
        </Form.Select>
        <div className="poem-linked-field-actions">
         <Button type="button" variant="outline-primary" onClick={()=>setShowPublisherModal(true)}>New</Button>
        </div>
       </div>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poem-inline-group poem-inline-group-tight">
       <Form.Label>Genre</Form.Label>
       <div className="poem-linked-field">
        <Form.Select name="genre" value={formData.genre} onChange={handleChange} required isInvalid={Boolean(fieldErrors.genre)}>
         <option value="">Select Genre</option>
         {genres.map((genre)=>(
          <option key={genre._id} value={genre._id}>{genre.name}</option>
         ))}
        </Form.Select>
        <div className="poem-linked-field-actions">
         <Button type="button" variant="outline-primary" onClick={()=>setShowGenreModal(true)}>New</Button>
         <Button type="button" variant="outline-secondary" onClick={()=>navigate("/genres")}>Manage</Button>
        </div>
        <Form.Control.Feedback type="invalid">{fieldErrors.genre||"Genre is required."}</Form.Control.Feedback>
       </div>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poem-inline-group poem-inline-group-tight">
       <Form.Label>Section</Form.Label>
       <div className="poem-linked-field">
        <Form.Select
         name="section"
         value={formData.section}
         onChange={handleChange}
         disabled={!formData.genre}
        >
         <option value="">{formData.genre?"Select Section":"Select Genre First"}</option>
         {formData.section&&!sectionValueIsListed?(
          <option value={formData.section}>{formData.section}</option>
         ):null}
         {selectedGenreSections.map(section=>(
          <option key={section.name} value={section.name}>{section.name}</option>
         ))}
        </Form.Select>
        <div className="poem-linked-field-actions">
         <Button type="button" variant="outline-primary" onClick={()=>setShowSectionModal(true)} disabled={!formData.genre}>New</Button>
        </div>
       </div>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6}>
      <Form.Group className="poem-inline-group poem-inline-group-tight">
       <Form.Label>Subsection</Form.Label>
       <div className="poem-linked-field">
        <Form.Select
         name="subsection"
         value={formData.subsection}
         onChange={handleChange}
         disabled={!formData.genre||!formData.section}
        >
         <option value="">{formData.section?"Select Subsection":"Select Section First"}</option>
         {formData.subsection&&!subsectionValueIsListed?(
          <option value={formData.subsection}>{formData.subsection}</option>
         ):null}
         {selectedGenreSubsections.map(subsection=>(
          <option key={subsection} value={subsection}>{subsection}</option>
         ))}
        </Form.Select>
        <div className="poem-linked-field-actions">
         <Button type="button" variant="outline-primary" onClick={()=>setShowSubsectionModal(true)} disabled={!formData.genre||!formData.section}>New</Button>
        </div>
       </div>
      </Form.Group>
     </Col>

     <Col xl={6} lg={6}>
      <Form.Group className="poem-inline-group">
       <Form.Label>Collection</Form.Label>
       <Form.Control
        type="text"
        name="collection"
        value={formData.collection}
        onChange={handleChange}
        placeholder="Poems"
        list="poem-collection-options"
       />
       <datalist id="poem-collection-options">
        {suggestedCollection?<option value={suggestedCollection}/>:null}
        <option value="Poems"/>
        <option value="Writing"/>
       </datalist>
      </Form.Group>
     </Col>

     <Col xl={4} lg={6} md={6}>
      <Form.Group className="poem-inline-group">
       <Form.Label>Status</Form.Label>
       <Form.Select name="status" value={formData.status} onChange={handleChange}>
        {poemStatusOptions.map(option=>(
         <option key={option.value} value={option.value}>{option.label}</option>
        ))}
       </Form.Select>
      </Form.Group>
     </Col>

     <Col xl={6} lg={6} md={6}>
      <Form.Group className="poem-inline-group poem-date-group">
       <Form.Label>Copyright Date</Form.Label>
       <Form.Control className="poem-date-control" type="date" name="copyright" value={formData.copyright} onChange={handleChange}/>
      </Form.Group>
     </Col>

     <Col xl={2} lg={6} md={6}>
     <Form.Group className="h-100 d-flex align-items-end">
      <Form.Check type="checkbox" id="isFeatured" name="isFeatured" label="Featured Poem" checked={formData.isFeatured} onChange={handleChange} disabled={!canPublishCurrentStatus}/>
     </Form.Group>
    </Col>

     <Col xl={formData.isFeatured?2:2} lg={6} md={6}>
      <Form.Group className="h-100 d-flex align-items-end">
       <Form.Check type="checkbox" id="isPublished" name="isPublished" label="Published" checked={formData.isPublished} onChange={handleChange} disabled={!canPublishCurrentStatus}/>
      </Form.Group>
     </Col>

     {!canPublishCurrentStatus?(
      <Col xs={12}>
       <div className="text-muted small">Draft and incomplete poems cannot be featured or published.</div>
      </Col>
     ):null}

     {formData.isPublished&&canPublishCurrentStatus?(
      <Col xs={12}>
       <Form.Group>
        <Form.Label>Published Where</Form.Label>
        <div className="d-flex flex-wrap gap-3">
         {publishWhereOptions.map(option=>(
          <Form.Check
           key={option.value}
           type="checkbox"
           id={`publishedWhere-${option.value}`}
           label={option.label}
           checked={normalizePublishedWhere(formData.publishedWhere).includes(option.value)}
           onChange={event=>handlePublishedWhereChange(option.value,event.target.checked)}
          />
         ))}
        </div>
       </Form.Group>
      </Col>
     ):null}

     {formData.isFeatured?(
      <Col xl={6} lg={6} md={6}>
       <Form.Group className="poem-inline-group poem-date-group">
        <Form.Label>Featured Date</Form.Label>
        <Form.Control className="poem-date-control" type="date" name="featuredAt" value={formData.featuredAt} onChange={handleChange}/>
       </Form.Group>
      </Col>
     ):null}

     <Col xs={12}>
      <Form.Group>
       <Form.Label>Content</Form.Label>
       <TiptapPoemEditor
        value={formData.content}
        isInvalid={Boolean(fieldErrors.content)}
        onChange={(value)=>{
         setFormData((prev)=>({
          ...prev,
          content:value
         }));
         setFieldErrors(prev=>({...prev,content:""}));
        }}
       />
       {fieldErrors.content?<div className="invalid-feedback d-block">{fieldErrors.content}</div>:null}
      </Form.Group>
     </Col>

     <Col xs={12}>
      <h3 className="mt-2 mb-3">Background Image</h3>
     </Col>

     <Col md={6}>
      <Form.Group>
       <Form.Label>Upload Image</Form.Label>
       <Form.Control type="file" accept="image/*" onChange={handleBackgroundFileChange} disabled={uploadingBackground}/>
       {uploadingBackground?<div className="text-muted mt-2">Uploading image...</div>:null}
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group>
       <Form.Label>Image URL</Form.Label>
       <Form.Control type="text" name="url" value={formData.backgroundImage.url} onChange={handleBackgroundChange}/>
      </Form.Group>
     </Col>

     {formData.backgroundImage.url?(
      <Col xs={12}>
       <div className="d-flex align-items-start gap-3">
        <Image
         src={formData.backgroundImage.url}
         alt={formData.backgroundImage.alt||"Background preview"}
         thumbnail
         style={{maxWidth:"180px",maxHeight:"180px",objectFit:"cover"}}
        />
        <div className="d-flex flex-column gap-2">
         <span>Image Preview</span>
         <Button type="button" variant="outline-danger" onClick={clearBackgroundImage}>
          Clear Image
         </Button>
        </div>
       </div>
      </Col>
     ):null}

     <Col md={6}>
      <Form.Group>
       <Form.Label>Alt Text</Form.Label>
       <Form.Control type="text" name="alt" value={formData.backgroundImage.alt} onChange={handleBackgroundChange}/>
      </Form.Group>
     </Col>

     <Col md={8}>
      <Form.Group>
       <Form.Label>Caption</Form.Label>
       <Form.Control type="text" name="caption" value={formData.backgroundImage.caption} onChange={handleBackgroundChange}/>
      </Form.Group>
     </Col>

     <Col md={4}>
      <Form.Group className="h-100 d-flex align-items-end">
       <Form.Check type="checkbox" id="backgroundIsActive" name="isActive" label="Background Active" checked={formData.backgroundImage.isActive} onChange={handleBackgroundChange}/>
      </Form.Group>
     </Col>

     <Col xs={12}>
      <h3 className="mt-2 mb-3">Poem Notes & Analysis</h3>

      <Tabs activeKey={activeDetailsTab} onSelect={key=>setActiveDetailsTab(key||"authorNote")} className="mb-3">
       <Tab eventKey="authorNote" title="Author Note">
        <Form.Group>
         <Form.Label>Author Note</Form.Label>
         <Form.Control as="textarea" rows={5} name="authorNote" value={formData.authorNote} onChange={handleChange}/>
        </Form.Group>
       </Tab>

       <Tab eventKey="analysis" title="Analysis">
        <Row className="g-3">
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Form/Structure</Form.Label>
           <Form.Control
            as="textarea"
            rows={3}
            value={formData.analysis.formStructure}
            onChange={e=>handleAnalysisTextChange("formStructure",e.target.value)}
           />
          </Form.Group>
         </Col>

         <Col xs={12}>
          {renderAnalysisArray("theme","Theme","Add a theme")}
         </Col>

         <Col xs={12}>
          {renderAnalysisArray("tone","Tone","Add a tone")}
         </Col>

         <Col xs={12}>
          {renderAnalysisArray("language","Language","Add language notes")}
         </Col>

         <Col xs={12}>
          {renderAnalysisArray("structure","Structure","Add structure notes")}
         </Col>

         <Col xs={12}>
          {renderAnalysisArray("personalInterpretation","Personal Interpretation / Analysis","Add interpretation or analysis")}
         </Col>

         <Col xs={12}>
          {renderAnalysisArray("broaderContextReflection","Reflection on the Broader Context","Add broader context reflection")}
         </Col>

         <Col xs={12}>
          <Form.Group>
           <Form.Label>Overall</Form.Label>
           <Form.Control
            as="textarea"
            rows={4}
            value={formData.analysis.overall}
            onChange={e=>handleAnalysisTextChange("overall",e.target.value)}
           />
          </Form.Group>
         </Col>
        </Row>
       </Tab>

       <Tab eventKey="definitions" title="Definitions">
        <div className="d-flex align-items-center justify-content-between mb-3">
         <h4 className="m-0">Definitions</h4>
         <Button type="button" variant="secondary" onClick={addDefinition}>Add Definition</Button>
        </div>

        {formData.definitions.map((item,index)=>(
         <Row className="g-3 align-items-end mb-3" key={index}>
          <Col md={4}>
           <Form.Group>
            <Form.Label>Term</Form.Label>
            <Form.Control type="text" value={item.term} onChange={(e)=>handleDefinitionChange(index,"term",e.target.value)} isInvalid={Boolean(fieldErrors.definitions?.[index]?.term)}/>
            <Form.Control.Feedback type="invalid">{fieldErrors.definitions?.[index]?.term}</Form.Control.Feedback>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group>
            <Form.Label>Meaning</Form.Label>
            <Form.Control type="text" value={item.meaning} onChange={(e)=>handleDefinitionChange(index,"meaning",e.target.value)} isInvalid={Boolean(fieldErrors.definitions?.[index]?.meaning)}/>
            <Form.Control.Feedback type="invalid">{fieldErrors.definitions?.[index]?.meaning}</Form.Control.Feedback>
           </Form.Group>
          </Col>

          <Col md={2}>
           <Button type="button" variant="danger" className="w-100" onClick={()=>removeDefinition(index)}>
            Remove
           </Button>
          </Col>
         </Row>
        ))}
       </Tab>
      </Tabs>
     </Col>

     <Col xs={12}>
      <div className="d-flex gap-2 pt-3">
       <Button type="submit" variant="primary" disabled={saving||uploadingBackground}>
        {saving?(isEdit?"Updating...":"Saving..."):(isEdit?"Update Poem":"Save Poem")}
       </Button>
       <Button type="button" variant="outline-secondary" onClick={isModal?onClose:()=>navigate("/poems")}>
        Cancel
       </Button>
      </div>
     </Col>

    </Row>
   </Form>

   <Modal show={showAuthorModal} onHide={()=>setShowAuthorModal(false)} size="lg" centered backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>Add Author</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <AuthorForm mode="add" onSaved={selectCreatedAuthor} onCancel={()=>setShowAuthorModal(false)}/>
    </Modal.Body>
   </Modal>

   <Modal show={showGenreModal} onHide={()=>setShowGenreModal(false)} centered backdrop="static">
    <Form onSubmit={createGenre}>
     <Modal.Header closeButton={!savingGenre}>
      <Modal.Title>Add Genre</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <Form.Group>
       <Form.Label>Genre Name</Form.Label>
       <Form.Control value={newGenreName} onChange={e=>setNewGenreName(e.target.value)} autoFocus required/>
      </Form.Group>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="secondary" onClick={()=>setShowGenreModal(false)} disabled={savingGenre}>Cancel</Button>
      <Button type="submit" variant="primary" disabled={savingGenre}>{savingGenre?"Saving...":"Save Genre"}</Button>
     </Modal.Footer>
   </Form>
  </Modal>

   <Modal show={showSectionModal} onHide={()=>setShowSectionModal(false)} centered backdrop="static">
    <Form onSubmit={createSection}>
     <Modal.Header closeButton={!savingSection}>
      <Modal.Title>Add Section</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <p className="text-muted mb-3">Genre: {selectedGenre?.name||"Select a genre first"}</p>
      <Form.Group>
       <Form.Label>Section Name</Form.Label>
       <Form.Control value={newSectionName} onChange={e=>setNewSectionName(e.target.value)} autoFocus required disabled={!selectedGenre}/>
      </Form.Group>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="secondary" onClick={()=>setShowSectionModal(false)} disabled={savingSection}>Cancel</Button>
      <Button type="submit" variant="primary" disabled={savingSection||!selectedGenre}>{savingSection?"Saving...":"Save Section"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>

   <Modal show={showSubsectionModal} onHide={()=>setShowSubsectionModal(false)} centered backdrop="static">
    <Form onSubmit={createSubsection}>
     <Modal.Header closeButton={!savingSubsection}>
      <Modal.Title>Add Subsection</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <p className="text-muted mb-3">
       Genre: {selectedGenre?.name||"Select a genre first"}{formData.section?` / ${formData.section}`:""}
      </p>
      <Form.Group>
       <Form.Label>Subsection Name</Form.Label>
       <Form.Control value={newSubsectionName} onChange={e=>setNewSubsectionName(e.target.value)} autoFocus required disabled={!selectedGenre||!formData.section}/>
      </Form.Group>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="secondary" onClick={()=>setShowSubsectionModal(false)} disabled={savingSubsection}>Cancel</Button>
      <Button type="submit" variant="primary" disabled={savingSubsection||!selectedGenre||!formData.section}>{savingSubsection?"Saving...":"Save Subsection"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>

   <Modal show={showPublisherModal} onHide={()=>setShowPublisherModal(false)} size="lg" centered backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>Add Publisher</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <PublisherForm mode="add" onSaved={selectCreatedPublisher} onCancel={()=>setShowPublisherModal(false)}/>
    </Modal.Body>
   </Modal>
  </section>
 );
}

export default PoemForm;
