// backend/scripts/compareCalibreBooks.js
import Database from "better-sqlite3";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import "../models/AuthorModel.js";
import BookModel from "../models/BookModel.js";

const CALIBRE_DB_PATH="D:/Documents/Calibre Library/metadata.db";

if(!process.env.MONGO_URI){
 console.error("Missing MONGO_URI. Run with dotenvx using backend/.env.");
 process.exit(1);
}

if(!fs.existsSync(CALIBRE_DB_PATH)){
 console.error(`Calibre metadata.db not found: ${CALIBRE_DB_PATH}`);
 process.exit(1);
}

const reportsDir=path.resolve("reports");

if(!fs.existsSync(reportsDir)){
 fs.mkdirSync(reportsDir,{recursive:true});
}

const normalizeText=value=>{
 return String(value||"")
  .toLowerCase()
  .replace(/&/g,"and")
  .replace(/['’]/g,"")
  .replace(/\([^)]*\)/g,"")
  .replace(/\[[^\]]*\]/g,"")
  .replace(/[^a-z0-9]+/g," ")
  .replace(/\s+/g," ")
  .trim();
};

const normalizeIsbn=value=>{
 return String(value||"")
  .toUpperCase()
  .replace(/[^0-9X]/g,"");
};

const csvEscape=value=>{
 const text=String(value??"");
 if(/[",\n\r]/.test(text)){
  return `"${text.replace(/"/g,'""')}"`;
 }
 return text;
};

const writeCsv=(fileName,rows,columns)=>{
 const filePath=path.join(reportsDir,fileName);
 const header=columns.map(col=>csvEscape(col.label)).join(",");
 const body=rows.map(row=>columns.map(col=>csvEscape(row[col.key])).join(",")).join("\n");
 fs.writeFileSync(filePath,[header,body].filter(Boolean).join("\n"),"utf8");
 return filePath;
};

const getTitleKeys=value=>{
 const title=String(value||"").trim();
 const keys=new Set();

 const full=normalizeText(title);
 const beforeColon=normalizeText(title.split(":")[0]);
 const beforeDash=normalizeText(title.split(" - ")[0]);

 if(full)keys.add(full);
 if(beforeColon)keys.add(beforeColon);
 if(beforeDash)keys.add(beforeDash);

 return [...keys];
};

const getCalibreBooks=()=>{
 const db=new Database(CALIBRE_DB_PATH,{readonly:true});

 const rows=db.prepare(`
  SELECT
   books.id,
   books.title,
   books.sort,
   group_concat(DISTINCT authors.name) AS authors,
   group_concat(DISTINCT identifiers.type || ':' || identifiers.val) AS identifiers
  FROM books
  LEFT JOIN books_authors_link ON books.id=books_authors_link.book
  LEFT JOIN authors ON authors.id=books_authors_link.author
  LEFT JOIN identifiers ON identifiers.book=books.id
  GROUP BY books.id
  ORDER BY books.title
 `).all();

 db.close();

 return rows.map(row=>{
  const identifiers=String(row.identifiers||"").split(",").filter(Boolean);
  const isbnValues=identifiers
   .filter(item=>item.toLowerCase().startsWith("isbn:"))
   .map(item=>normalizeIsbn(item.split(":").slice(1).join(":")))
   .filter(Boolean);

  return {
   calibreId:String(row.id||""),
   title:String(row.title||""),
   authors:String(row.authors||""),
   identifiers:String(row.identifiers||""),
   isbnValues,
   isbnKey:isbnValues.join("|"),
   titleKeys:getTitleKeys(row.title)
  };
 });
};

const getAppBooks=async()=>{
 const books=await BookModel.find()
  .select("title subtitle isbn10 isbn13 eisbn authors")
  .populate("authors","firstName middleName lastName displayName sortName")
  .lean();

 return books.map(book=>{
  const isbnValues=[
   normalizeIsbn(book.isbn13),
   normalizeIsbn(book.isbn10),
   normalizeIsbn(book.eisbn)
  ].filter(Boolean);

  return {
   appId:String(book._id||""),
   title:String(book.title||""),
   subtitle:String(book.subtitle||""),
   isbnValues,
   isbnKey:isbnValues.join("|"),
   titleKeys:getTitleKeys(book.title)
  };
 });
};

const buildIsbnMap=books=>{
 const map=new Map();

 for(const book of books){
  for(const isbn of book.isbnValues){
   if(!map.has(isbn))map.set(isbn,[]);
   map.get(isbn).push(book);
  }
 }

 return map;
};

const buildTitleMap=books=>{
 const map=new Map();

 for(const book of books){
  for(const titleKey of book.titleKeys){
   if(!titleKey)continue;
   if(!map.has(titleKey))map.set(titleKey,[]);
   map.get(titleKey).push(book);
  }
 }

 return map;
};

const findInApp=(calibreBook,appIsbnMap,appTitleMap)=>{
 for(const isbn of calibreBook.isbnValues){
  const matches=appIsbnMap.get(isbn);
  if(matches?.length)return true;
 }

 for(const titleKey of calibreBook.titleKeys){
  const matches=appTitleMap.get(titleKey);
  if(matches?.length)return true;
 }

 return false;
};

const run=async()=>{
 await mongoose.connect(process.env.MONGO_URI);

 const calibreBooks=getCalibreBooks();
 const appBooks=await getAppBooks();

 const appIsbnMap=buildIsbnMap(appBooks);
 const appTitleMap=buildTitleMap(appBooks);

 const missingFromApp=[];

 for(const calibreBook of calibreBooks){
  const existsInApp=findInApp(calibreBook,appIsbnMap,appTitleMap);

  if(!existsInApp){
   missingFromApp.push({
       title:calibreBook.title,
    authors:calibreBook.authors,
    isbn:calibreBook.isbnKey,
    identifiers:calibreBook.identifiers
   });
  }
 }

 const missingFromAppPath=writeCsv("calibre_missing_from_app.csv",missingFromApp,[

  {key:"title",label:"Title"},
  {key:"authors",label:"Authors"},
  {key:"isbn",label:"ISBN"},
  {key:"identifiers",label:"Identifiers"}
 ]);

 console.log("");
 console.log("Missing books comparison complete");
 console.log("---------------------------------");
 console.log(`Calibre DB: ${CALIBRE_DB_PATH}`);
 console.log(`Calibre books: ${calibreBooks.length}`);
 console.log(`App books: ${appBooks.length}`);
 console.log(`Missing from app: ${missingFromApp.length}`);
 console.log("");
 console.log(`Missing from app report: ${missingFromAppPath}`);

 await mongoose.disconnect();
};

run().catch(async err=>{
 console.error(err);
 await mongoose.disconnect().catch(()=>{});
 process.exit(1);
});