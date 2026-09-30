// /backend/business/receiptBusiness.js

import fs from 'fs/promises';
import path from 'path';
import {Purchase,Receipt,Store} from '../models/index.js';

const deleteFileIfExists=async(filePath)=>{
 try{
  await fs.access(filePath);
  await fs.unlink(filePath);
 }catch(err){}
};

export const createReceiptLogic=async(data={})=>{
 if(!data.user) throw new Error('User is required');
 if(data.store) {
  const store=await Store.findById(data.store);
  if(!store) throw new Error('Invalid store');
 }
 if(data.purchase){
  const purchase=await Purchase.findById(data.purchase);
  if(!purchase) throw new Error('Invalid purchase');
 }
 return await Receipt.create(data);
};

export const attachReceiptToPurchaseLogic=async({receiptId,purchaseId}={})=>{
 const receipt=await Receipt.findById(receiptId);
 if(!receipt) throw new Error('Receipt not found');
 const purchase=await Purchase.findById(purchaseId);
 if(!purchase) throw new Error('Purchase not found');
 receipt.purchase=purchase._id;
 await receipt.save();
 purchase.receipt=receipt._id;
 await purchase.save();
 return{receipt,purchase};
};

export const replaceReceiptImageLogic=async({receiptId,newImage,uploadDir}={})=>{
 const receipt=await Receipt.findById(receiptId);
 if(!receipt) throw new Error('Receipt not found');
 const oldImage=receipt.image||'';
 receipt.image=newImage;
 await receipt.save();
 if(oldImage&&uploadDir){
  await deleteFileIfExists(path.join(uploadDir,oldImage));
 }
 return receipt;
};

export default{
 createReceiptLogic,
 attachReceiptToPurchaseLogic,
 replaceReceiptImageLogic
};