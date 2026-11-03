const fs=require("fs");
const path=require("path");

const fontDir=__dirname;
const cssFile=path.join(fontDir,"index.css");
const jsFile=path.join(fontDir,"index.js");
const exts=[".ttf",".otf",".woff",".woff2"];

const formatOf=ext=>{
 if(ext===".ttf")return "truetype";
 if(ext===".otf")return "opentype";
 if(ext===".woff")return "woff";
 if(ext===".woff2")return "woff2";
 return "";
};

const cleanName=file=>{
 return path.basename(file,path.extname(file)).replace(/[-_]+/g," ").trim();
};

const files=fs.readdirSync(fontDir).filter(file=>exts.includes(path.extname(file).toLowerCase())).sort();
const fonts=files.map(file=>({
 name:cleanName(file),
 family:cleanName(file),
 file:file,
 format:formatOf(path.extname(file).toLowerCase()),
 fallback:"Georgia, serif"
}));

const css=fonts.map(font=>{
 return "@font-face{\n"+
 " font-family:\""+font.family.replace(/"/g,'\\"')+"\";\n"+
 " src:url(\"./"+font.file.replace(/"/g,'\\"')+"\") format(\""+font.format+"\");\n"+
 " font-weight:400;\n"+
 " font-style:normal;\n"+
 " font-display:swap;\n"+
 "}";
}).join("\n\n");

const js="import \"./index.css\";\n\n"+
"export const sharedFonts="+JSON.stringify(fonts,null,1)+";\n\n"+
"export default sharedFonts;\n";

fs.writeFileSync(cssFile,css+"\n","utf8");
fs.writeFileSync(jsFile,js,"utf8");

console.log("Generated index.css and index.js with "+fonts.length+" fonts.");
