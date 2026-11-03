const stopWords=new Set(["A","AN","AND","AS","AT","BY","FOR","FROM","IN","INTO","OF","ON","OR","THE","TO","WITH"]);

const clean=value=>String(value||"").trim();

const cleanCode=value=>clean(value).toUpperCase().replace(/[^A-Z0-9]/g,"");

const isObjectIdLike=value=>/^[a-f0-9]{24}$/i.test(clean(value));

const getName=item=>{
 if(!item)return "";
 if(typeof item==="string")return isObjectIdLike(item)?"":item.trim();

 const first=clean(item?.firstName);
 const middle=clean(item?.middleName);
 const last=clean(item?.lastName);
 const full=[first,middle,last].filter(Boolean).join(" ");

 return clean(item?.displayName||item?.name||item?.title||item?.label||item?.value||full);
};

const joinNames=items=>Array.isArray(items)?items.map(getName).filter(Boolean).join(", "):"";

export const getBookAuthorDisplay=book=>
 joinNames(book?.authors)||getName(book?.author)||getName(book?.authorRef)||getName(book?.authorId);

const codePart=(value,length,fallback)=>{
 const code=cleanCode(value);
 return code.slice(0,length)||fallback;
};

const splitName=name=>{
 const parts=clean(name).replace(/\s+/g," ").split(" ").filter(Boolean);
 if(!parts.length)return {last:"",first:""};
 if(parts.length===1)return {last:parts[0],first:""};
 return {last:parts[parts.length-1],first:parts[0]};
};

const getPrimaryAuthorName=book=>{
 if(Array.isArray(book?.authors)&&book.authors.length)return getName(book.authors[0]);
 return getName(book?.author)||getName(book?.authorRef)||getName(book?.authorId);
};

const titleWords=title=>{
 const normalized=clean(title).toUpperCase();
 const words=normalized.match(/[A-Z0-9]+/g)||[];
 const withoutLeadingArticle=stopWords.has(words[0])?words.slice(1):words;
 return withoutLeadingArticle.filter(word=>!stopWords.has(word));
};

const titleCode=title=>{
 const words=titleWords(title);
 const titleParts=words.slice(0,3).map(word=>codePart(word,9,"")).filter(Boolean);
 return titleParts.join("-")||codePart(title,12,"BOOK");
};

const publicationYear=book=>{
 const value=book?.publication?.publishedDate||book?.publishedDate||book?.year||book?.publicationYear;
 if(!value)return "";
 const match=String(value).match(/\d{4}/);
 return match?.[0]||"";
};

const authorCode=book=>{
 const author=getPrimaryAuthorName(book);
 const {last,first}=splitName(author);
 const lastCode=codePart(last||author,10,"UNKNOWN");
 const firstCode=cleanCode(first).slice(0,4);
 return [lastCode,firstCode].filter(Boolean).join("-");
};

const uniqueSuffix=book=>{
 const identifier=cleanCode(book?.customId||book?.isbn13||book?.isbn10||book?.eisbn||book?.asin||book?.barcode||book?._id||book?.id);
 return identifier.slice(-5);
};

export const getBookFilingCode=book=>{
 if(!book)return "#";

 const author=authorCode(book);
 const title=titleCode(book?.title);
 const year=publicationYear(book);
 const suffix=uniqueSuffix(book);

 return [author,title,year,suffix].filter(Boolean).join("-");
};
