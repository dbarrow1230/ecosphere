import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const directory=fileURLToPath(new URL('../public/seed/',import.meta.url));
// These are existing uploads of the same named crop, under newer filenames.
const aliases={
 'acorn squash.webp':'Acorn Squash.jpg','bell pepper.jpeg':'bell-peppers.jpg',
 'Echinacea-Purple-Coneflower-Seed-Packet.webp':'echinacea.jpg',
 'Pennyroyal Mint.png':'pennyroyal-mint.png','holy basil.jpg':'holy basil.webp',
 'CalendulaApricotBeauty.webp':'calendula.jpg','jalapeno.jpg':'jalapeno Pepper.jpg',
 'lemon seeds.jpg':'lemon-seedlings.jpg','SageBroadLeaf.jpg':'sage.jpg',
 'buttterhead lettuce.jpg':'Buttercrunch Lettuce.jpg','chocolatebeauty.jpg':'chocolate beauty pepper.jpg',
 'thai basil.webp':'thai-basil.jpg','Mini Sweet Peppers.jpg':'mini-sweet-pepper-mix.jpg',
 'Basil Sweet.webp':'basil sweet.jpg','chervilcurled.png':'Chervil Curled.jpg',
 'FennelFlorence.png':'fennel florence.jpg','Parsley Giant Italian.jpg':'parsley italian giant.jpg',
 'Chives common.jpg':'chives.jpg','green onion.jpg':'scallion.jpg',
 'Basil genovese.jpeg':'basil-genovese.jpg','SunbrightPepper.jpg':'pepper sunbright.jpg',
 'Thyme common.jpg':'thyme common.jpg','orangesun.jpg':'Orange sun pepper.jpg',
 'dill weed.jpg':'dill bouquet.jpg','Oregano Italian.jpg':'Oregano.jpg',
 'Sweet snap peppers.webp':'sweet snaps peppers.jpg','Collards Geogia Southern.jpg':'collards gergia southern.jpg',
 'HabaneroOrange.webp':'habanero pepper orange.jpg','Spinach Bloomsdale.jpg':'spinach bloomsdale.webp',
 'Lemon Basil.jpg':'basil lemon.jpg','Chamomile.jpg':'chamomile roman.jpg'
};

export function resolveSeedCover(seed,files=fs.existsSync(directory)?fs.readdirSync(directory):[]){
 const filenameOf=value=>{
  const raw=typeof value==='string'?value:value?.filename||value?.url||value?.relativePath||value?.path||'';
  const filename=path.basename(String(raw).replace(/\\/g,'/'));
  try{return decodeURIComponent(filename);}catch{return filename;}
 };
 const exact=value=>{
  if(!value)return '';
  const filename=filenameOf(value);
  return files.find(file=>file.toLowerCase()===filename.toLowerCase())||'';
 };
 const current=seed.coverImage??seed.image_path;
 if(/^https?:\/\//i.test(current||''))return current;
 const alias=Object.entries(aliases).find(([name])=>name.toLowerCase()===filenameOf(current).toLowerCase())?.[1];
 const found=exact(current)||exact(alias);
 if(found)return found;
 for(const image of seed.images||[]){
  const found=exact(image);
  if(found)return found;
 }
 const names={'Garlic Chives':'chives garlic.jpg','Mixed Bell Peppers':'bell pepper mix.jpg'};
 return exact(names[seed.plantName||seed.name])||current||'';
}

