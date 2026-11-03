import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const reference=path.resolve(root,'../natures-apothecary');
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const excluded=new Set(['node_modules','dist','dist-public','.git']);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>excluded.has(entry.name)?[]:entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const requiredGroups=['backend/db','backend/middleware','backend/controllers/app','backend/controllers/reference','backend/controllers/locations','backend/models/reference','backend/models/locations','backend/routes/app','backend/routes/reference','backend/routes/locations','backend/controllers/users','backend/models/users','backend/routes/users','backend/jobs','backend/socket','backend/utils'];
let verified=0;
for(const group of requiredGroups)for(const source of files(path.join(reference,group))){
 const relative=path.relative(reference,source),target=path.join(root,relative);assert.ok(fs.existsSync(target),`Missing established file: ${relative}`);
 if(relative.endsWith('permissionMiddleware.js')){
  const adapted=fs.readFileSync(source,'utf8').replace('module.exports={authorizePermissions};','export {authorizePermissions};');assert.equal(fs.readFileSync(target,'utf8'),adapted);
 }else if(relative.endsWith('users'+path.sep+'userModel.js')){
  const adapted=fs.readFileSync(target,'utf8').replaceAll('\r\n','\n').replace('const accountDatabase=decodeURIComponent(new URL(process.env.ECOSPHERE_MONGO_URI||process.env.MONGO_URI).pathname.slice(1));\nconst accountConnection=mongoose.connection.useDb(accountDatabase,{useCache:true});\nconst User=accountConnection.models.User||accountConnection.model("User",userSchema);','const User=mongoose.model("User",userSchema);');
  assert.equal(adapted.replaceAll('\r\n','\n').trimEnd(),fs.readFileSync(source,'utf8').replaceAll('\r\n','\n').trimEnd(),'User schema differs from the established schema.');
 }else if(relative.endsWith('users'+path.sep+'userDetailsModel.js')){
  const adapted=fs.readFileSync(target,'utf8').replaceAll('\r\n','\n').replace('import User from "./userModel.js";\n','').replace('const UserDetails=User.db.models.UserDetails||User.db.model("UserDetails",userDetailsSchema);','const UserDetails=mongoose.models.UserDetails||mongoose.model("UserDetails",userDetailsSchema);');
  assert.equal(adapted.replaceAll('\r\n','\n').trimEnd(),fs.readFileSync(source,'utf8').replaceAll('\r\n','\n').trimEnd(),'User details schema differs from the established schema.');
 }else assert.equal(hash(source),hash(target),`Scaffold content differs: ${relative}`);
 verified++;
}
const html=fs.readFileSync(path.join(reference,'index.html'),'utf8').replace('content="natures-apothecary"','content="herbs-spices"').replace('<title>Natures Apothecary</title>','<title>Herbs &amp; Spices</title>');assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),html);
assert.equal(hash(path.join(reference,'src/main.jsx')),hash(path.join(root,'src/main.jsx')));
for(const required of ['AppKeys','Businesses','BusinessTypes','Footers','Seasons','Holidays','Occasions','Taglines','BusinessRolesPermissionsPage','TaxRatesPage'])assert.ok(fs.existsSync(path.join(root,`src/pages/admin/${required}.jsx`)));
function pageStructure(source){
 const result=[],ast=parse(source,{sourceType:'module',plugins:['jsx']});
 function visit(node){if(!node||typeof node!=='object')return;
  if(node.type==='JSXOpeningElement'){const name=node.name.type==='JSXMemberExpression'?`${node.name.object.name}.${node.name.property.name}`:node.name.name;const className=node.attributes.find(item=>item.type==='JSXAttribute'&&item.name.name==='className')?.value?.value||'';result.push([name,className]);}
  for(const [key,value] of Object.entries(node)){if(['loc','start','end','extra','comments'].includes(key))continue;if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}
 }visit(ast);return result;
}
for(const page of ['Home','about','contactus','faq','privacy','termsofservice'])assert.deepEqual(pageStructure(fs.readFileSync(path.join(root,`src/pages/${page}.jsx`),'utf8')),pageStructure(fs.readFileSync(path.join(reference,`src/pages/${page}.jsx`),'utf8')),`Standard page structure differs: ${page}`);
for(const template of ['AboutTemplate','FAQTemplate'])assert.ok(fs.existsSync(path.join(root,`src/components/${template}.jsx`)));
for(const component of ['Header','Footer']){
 assert.deepEqual(pageStructure(fs.readFileSync(path.join(root,`src/components/${component}.jsx`),'utf8')),pageStructure(fs.readFileSync(path.join(reference,`src/components/${component}.jsx`),'utf8')),`Established component structure differs: ${component}`);
 assert.equal(hash(path.join(root,`src/components/${component}.css`)),hash(path.join(reference,`src/components/${component}.css`)),`Established stylesheet differs: ${component}`);
}
for(const file of files(root).filter(file=>/\.(js|jsx|mjs)$/.test(file))){
 const ast=parse(fs.readFileSync(file,'utf8'),{sourceType:'module',plugins:['jsx']});
 function check(node){if(!node||typeof node!=='object')return;const literal=node.type==='ImportDeclaration'||node.type==='ExportNamedDeclaration'||node.type==='ExportAllDeclaration'?node.source:node.type==='CallExpression'&&node.callee.type==='Import'?node.arguments[0]:null;
  if(literal?.value?.startsWith('.')){const resolved=path.resolve(path.dirname(file),literal.value);assert.ok([resolved,resolved+'.js',resolved+'.jsx',path.join(resolved,'index.js')].some(candidate=>fs.existsSync(candidate)),`Broken import in ${path.relative(root,file)}: ${literal.value}`);}
  for(const [key,value] of Object.entries(node)){if(['loc','start','end','extra','comments'].includes(key))continue;if(Array.isArray(value))value.forEach(check);else if(value&&typeof value==='object')check(value);}
 }check(ast);
}
console.log(`PASS: ${verified} required backend scaffold files, full index/app-key metadata, standard main.jsx, all six standard pages, Header/Footer structures and styles, admin files, and relative imports.`);
