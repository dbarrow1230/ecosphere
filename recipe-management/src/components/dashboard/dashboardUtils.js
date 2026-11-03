// src/components/dashboard/dashboardUtils.js
export const getArray=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.books))return data.books;
 if(Array.isArray(data?.authors))return data.authors;
 if(Array.isArray(data?.publishers))return data.publishers;
 if(Array.isArray(data?.loans))return data.loans;
 if(Array.isArray(data?.rows))return data.rows;
 return [];
};

export const getText=value=>{
 if(typeof value==="string")return value.trim();
 if(typeof value==="number")return String(value);
 if(value&&typeof value==="object"){
  if(typeof value.displayName==="string")return value.displayName.trim();
  if(typeof value.name==="string")return value.name.trim();
  if(typeof value.title==="string")return value.title.trim();
  if(typeof value.label==="string")return value.label.trim();
  if(typeof value.fullName==="string")return value.fullName.trim();
  if(typeof value.legalName==="string")return value.legalName.trim();
  if(typeof value.code==="string")return value.code.trim();
  if(typeof value.firstName==="string"||typeof value.lastName==="string"){
   return `${value.firstName||""} ${value.middleName||""} ${value.lastName||""}`.replace(/\s+/g," ").trim();
  }
  if(typeof value._id==="string")return value._id.trim();
  if(typeof value.id==="string")return value.id.trim();
 }
 return "";
};

const isObjectIdString=value=>/^[a-f0-9]{24}$/i.test(String(value||"").trim());

export const getBookTitle=book=>{
 if(typeof book==="string"){
  const value=book.trim();
  return /^[a-f0-9]{24}$/i.test(value)?"":value;
 }

 const linkedBook=book?.book||book?.bookRef||book?.bookId;
 const linkedTitle=linkedBook&&linkedBook!==book?getBookTitle(linkedBook):"";

 return getText(book?.title)||getText(book?.bookTitle)||linkedTitle||getText(book?.name)||"Untitled Book";
};

export const getDateValue=item=>{
 const raw=item?.purchaseDate||item?.dateAdded||item?.addedAt||item?.publication?.publishedDate||item?.publishedDate||item?.reading?.finishedAt||item?.reading?.startedAt;
 const value=new Date(raw||0).getTime();
 return Number.isNaN(value)?0:value;
};

export const isActiveLoan=loan=>{
 const returned=loan?.returned===true||loan?.isReturned===true||loan?.returnedAt||loan?.dateReturned||loan?.returnedDate;
 const status=String(loan?.status||"").toLowerCase().trim();
 if(returned)return false;
 if(["returned","closed","complete","completed","cancelled","canceled"].includes(status))return false;
 return true;
};

export const getLoanDueDateValue=loan=>{
 const raw=loan?.dueDate||loan?.dueAt||loan?.returnDueDate||loan?.expectedReturnDate||loan?.due_on;
 const value=new Date(raw||0).getTime();
 return Number.isNaN(value)?0:value;
};

export const isOverdueLoan=loan=>{
 if(!isActiveLoan(loan))return false;
 const dueValue=getLoanDueDateValue(loan);
 if(!dueValue)return false;
 return dueValue<Date.now();
};

export const isDueTodayLoan=loan=>{
 if(!isActiveLoan(loan))return false;
 const dueValue=getLoanDueDateValue(loan);
 if(!dueValue)return false;
 const due=new Date(dueValue);
 const now=new Date();
 return due.getFullYear()===now.getFullYear()&&due.getMonth()===now.getMonth()&&due.getDate()===now.getDate();
};

export const isDueThisWeekLoan=loan=>{
 if(!isActiveLoan(loan))return false;
 const dueValue=getLoanDueDateValue(loan);
 if(!dueValue)return false;
 const now=new Date();
 const end=new Date();
 end.setDate(now.getDate()+7);
 return dueValue>=now.getTime()&&dueValue<=end.getTime();
};

export const isRecentlyReturnedLoan=loan=>{
 const raw=loan?.returnedAt||loan?.dateReturned||loan?.returnedDate;
 if(!raw)return false;
 const value=new Date(raw).getTime();
 if(Number.isNaN(value))return false;
 const now=Date.now();
 const week=7*24*60*60*1000;
 return now-value<=week;
};

export const getAuthorMap=authors=>{
 const map=new Map();

 authors.forEach(author=>{
  const id=String(author?._id||author?.id||"").trim();
  const name=getText(author?.displayName)||`${author?.firstName||""} ${author?.middleName||""} ${author?.lastName||""}`.replace(/\s+/g," ").trim()||getText(author?.name);
  if(id&&name)map.set(id,name);
 });

 return map;
};

export const getAuthorName=(item,authorMap)=>{
 if(!item)return "";

 if(typeof item==="string"){
  const key=item.trim();
  if(!key||isObjectIdString(key))return authorMap.get(key)||"";
  return authorMap.get(key)||key;
 }

 const populatedName=getText(item?.displayName)||`${item?.firstName||""} ${item?.middleName||""} ${item?.lastName||""}`.replace(/\s+/g," ").trim()||getText(item?.name)||getText(item?.title);
 if(populatedName)return populatedName;

 const id=String(item?._id||item?.id||"").trim();
 if(id&&authorMap.has(id))return authorMap.get(id);

 return "";
};

const getAuthorFieldName=(value,authorMap)=>{
 if(!value)return "";

 if(typeof value==="string"){
  const key=value.trim();
  if(!key||key==="Unknown Author")return "";
  if(isObjectIdString(key))return authorMap.get(key)||"";
  return key;
 }

 if(typeof value==="object"){
  const populatedName=getText(value?.displayName)||`${value?.firstName||""} ${value?.middleName||""} ${value?.lastName||""}`.replace(/\s+/g," ").trim()||getText(value?.name)||getText(value?.title);
  if(populatedName&&!isObjectIdString(populatedName)&&populatedName!=="Unknown Author")return populatedName;

  const id=String(value?._id||value?.id||"").trim();
  if(id&&authorMap.has(id))return authorMap.get(id);
 }

 return "";
};

export const getBookAuthor=(book,authorMap)=>{
 const direct=getAuthorFieldName(book?.author,authorMap)||getAuthorFieldName(book?.authorRef,authorMap)||getAuthorFieldName(book?.authorId,authorMap);
 if(direct)return direct;

 if(Array.isArray(book?.authors)&&book.authors.length){
  const names=book.authors.map(author=>getAuthorName(author,authorMap)).filter(Boolean);
  if(names.length)return names.join(", ");
 }

 return "Unknown Author";
};

export const getFormatNames=book=>{
 const names=[];

 if(Array.isArray(book?.formats)){
  book.formats.forEach(format=>{
   const name=getText(format);
   if(name)names.push(name);
  });
 }

 if(Array.isArray(book?.formatPrices)){
  book.formatPrices.forEach(item=>{
   const name=getText(item?.format);
   if(name)names.push(name);
  });
 }

 if(book?.format){
  const name=getText(book.format);
  if(name)names.push(name);
 }

 return [...new Set(names.map(name=>name.toLowerCase().trim()).filter(Boolean))];
};

export const getBookEffectiveCost=book=>{
 const prices=[];

 if(book?.cost!==undefined&&book?.cost!==null&&book?.cost!==""){
  const value=Number(book.cost);
  if(Number.isFinite(value))prices.push(value);
 }

 if(Array.isArray(book?.formatPrices)){
  book.formatPrices.forEach(item=>{
   if(item?.price!==undefined&&item?.price!==null&&item?.price!==""){
    const value=Number(item.price);
    if(Number.isFinite(value))prices.push(value);
   }
  });
 }

 if(!prices.length)return 0;
 return Math.max(...prices);
};

const getDuplicateTitleKey=book=>[
 getText(book?.title).toLowerCase(),
 getText(book?.subtitle).toLowerCase(),
 getText(book?.edition).toLowerCase(),
 getText(book?.volume).toLowerCase(),
 getText(book?.series).toLowerCase(),
 book?.seriesNumber==null?"":String(book.seriesNumber).trim()
].join("|");

const getBookIdentifier=book=>String(book?.isbn13||book?.isbn10||book?.eisbn||book?.asin||"").trim();

export const getTotalLibraryValue=books=>{
 return books.reduce((sum,book)=>sum+getBookEffectiveCost(book),0);
};

export const getValueByFormat=books=>{
 const totals={hardcover:0,softcover:0,digital:0,audiobook:0};

 books.forEach(book=>{
  const cost=getBookEffectiveCost(book);
  const formats=getFormatNames(book);

  if(formats.some(format=>format.includes("hardcover")))totals.hardcover+=cost;
  if(formats.some(format=>format.includes("softcover")||format.includes("paperback")))totals.softcover+=cost;
  if(formats.some(format=>format.includes("digital")||format.includes("ebook")||format.includes("e-book")||format.includes("pdf")||format.includes("epub")||format.includes("kindle")))totals.digital+=cost;
  if(formats.some(format=>format.includes("audio")))totals.audiobook+=cost;
 });

 const rows=[
  {label:"Hardcover",value:totals.hardcover},
  {label:"Softcover",value:totals.softcover},
  {label:"Digital",value:totals.digital},
  {label:"Audiobook",value:totals.audiobook}
 ];

 const max=Math.max(...rows.map(row=>row.value),0);

 return rows.map(row=>({
  ...row,
  percent:max?Math.max((row.value/max)*100,4):0
 }));
};

export const getMissingMetadataCounts=(books,authorMap)=>{
 const isbnCounts=new Map();
 const asinCounts=new Map();
 const identifierCounts=new Map();
 const titleCounts=new Map();

 books.forEach(book=>{
  const isbn=String(book?.isbn13||book?.isbn10||book?.eisbn||"").trim();
  const asin=String(book?.asin||"").trim();
  const identifier=getBookIdentifier(book);
  const title=getDuplicateTitleKey(book);

  if(isbn)isbnCounts.set(isbn,(isbnCounts.get(isbn)||0)+1);
  if(asin)asinCounts.set(asin,(asinCounts.get(asin)||0)+1);
  if(identifier)identifierCounts.set(identifier,(identifierCounts.get(identifier)||0)+1);
  if(getText(book?.title))titleCounts.set(title,(titleCounts.get(title)||0)+1);
 });

 return{
  missingAuthors:books.filter(book=>getBookAuthor(book,authorMap)==="Unknown Author").length,
  missingPublishers:books.filter(book=>!(getText(book?.publisher)||getText(book?.publisherRef)||(Array.isArray(book?.publishers)&&book.publishers.length))).length,
  missingFormats:books.filter(book=>getFormatNames(book).length===0).length,
  missingCovers:books.filter(book=>!(Array.isArray(book?.images)&&book.images.some(Boolean))).length,
  missingIsbn10:books.filter(book=>!String(book?.isbn10||"").trim()).length,
  missingIsbn13:books.filter(book=>!String(book?.isbn13||"").trim()).length,
  missingEisbn:books.filter(book=>!String(book?.eisbn||"").trim()).length,
  missingAsin:books.filter(book=>!String(book?.asin||"").trim()).length,
  missingSubjects:books.filter(book=>!(Array.isArray(book?.subjects)&&book.subjects.length)).length,
  hasIdentifier:books.filter(book=>!!getBookIdentifier(book)).length,
  asinOnly:books.filter(book=>String(book?.catalogStatus||"").trim()==="ASIN Only").length,
  noIsbn:books.filter(book=>String(book?.catalogStatus||"").trim()==="No ISBN").length,
  digitalNoIsbn:books.filter(book=>String(book?.catalogStatus||"").trim()==="Digital No ISBN").length,
  manualEntry:books.filter(book=>String(book?.catalogStatus||"").trim()==="Manual Entry").length,
  duplicateIsbns:[...isbnCounts.values()].filter(count=>count>1).length,
  duplicateAsins:[...asinCounts.values()].filter(count=>count>1).length,
  duplicateIdentifiers:[...identifierCounts.values()].filter(count=>count>1).length,
  duplicateTitles:[...titleCounts.values()].filter(count=>count>1).length
 };
};

export const getGenreBreakdown=books=>{
 const counts=new Map();

 books.forEach(book=>{
  const genres=Array.isArray(book?.genres)&&book.genres.length?book.genres:book?.subjects||[];

  if(Array.isArray(genres)){
   genres.forEach(item=>{
    const label=getText(item)||"Unlabeled";
    counts.set(label,(counts.get(label)||0)+1);
   });
  }
 });

 const rows=[...counts.entries()]
  .map(([label,value])=>({label,value}))
  .sort((a,b)=>b.value-a.value)
  .slice(0,8);

 const max=Math.max(...rows.map(row=>row.value),0);

 return rows.map(row=>({
  ...row,
  percent:max?Math.max((row.value/max)*100,4):0
 }));
};