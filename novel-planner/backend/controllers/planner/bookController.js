import Book,{NameYourStory} from "../../models/planner/bookModel.js";

export const getBooks=async(req,res)=>{
 try{
  const {business_id,user_id,isActive}=req.query;

  const filter={};

  if(business_id)filter.business_id=business_id;
  if(user_id)filter.user_id=user_id;
  if(isActive!==undefined)filter.isActive=isActive==="true";
  else filter.isActive=true;

  const books=await Book.find(filter).sort({updatedAt:-1,createdAt:-1});

  res.status(200).json(books);
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get books",
   error:error.message
  });
 }
};

export const getBookById=async(req,res)=>{
 try{
  const book=await Book.findById(req.params.id);

  if(!book){
   return res.status(404).json({
    success:false,
    message:"Book not found"
   });
  }

  res.status(200).json(book);
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get book",
   error:error.message
  });
 }
};

export const saveBook=async(req,res)=>{
 try{
  const {business_id,user_id,title}=req.body;

  if(!business_id||!title){
   return res.status(400).json({
    success:false,
    message:"business_id and title are required"
   });
  }

  const initialStatus=req.body.status||"Planning";
  const book=await Book.create({
   ...req.body,
   statusHistory:req.body.statusHistory||[{status:initialStatus,revisionNumber:0,changedAt:new Date()}],
   user_id:user_id||null,
   createdBy:req.body.createdBy||user_id||null,
   updatedBy:req.body.updatedBy||user_id||null
  });

  res.status(201).json(book);
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save book",
   error:error.message
  });
 }
};

export const updateBook=async(req,res)=>{
 try{
  const existing=await Book.findById(req.params.id);
  if(!existing)return res.status(404).json({success:false,message:"Book not found"});
  const update={...req.body,updatedBy:req.body.updatedBy||req.body.user_id||null};
  delete update.statusHistory;
  if(req.body.status&&req.body.status!==existing.status){
   update.statusHistory=[...(existing.statusHistory||[]),{status:req.body.status,revisionNumber:Number(req.body.revisionNumber)||((existing.statusHistory||[]).length),changedAt:new Date()}];
  }
  const book=await Book.findByIdAndUpdate(
   req.params.id,
   update,
   {returnDocument:"after",runValidators:true}
  );

  if(!book){
   return res.status(404).json({
    success:false,
    message:"Book not found"
   });
  }

  res.status(200).json(book);
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update book",
   error:error.message
  });
 }
};

export const archiveBook=async(req,res)=>{
 try{
  const book=await Book.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!book){
   return res.status(404).json({
    success:false,
    message:"Book not found"
   });
  }

  res.status(200).json(book);
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive book",
   error:error.message
  });
 }
};

export const getBookName=async(req,res)=>{
 try{
  const {bookId}=req.params;
  const {business_id,user_id}=req.query;

  const filter={
   book_id:bookId,
   isActive:true
  };

  if(business_id)filter.business_id=business_id;
  if(user_id)filter.user_id=user_id;

  const bookName=await NameYourStory.findOne(filter);

  res.status(200).json({
   success:true,
   data:bookName
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get book name",
   error:error.message
  });
 }
};

export const saveBookName=async(req,res)=>{
 try{
  const {bookId}=req.params;
  const {business_id,user_id}=req.body;

  if(!business_id||!user_id||!bookId){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and bookId are required"
   });
  }

  const bookName=await NameYourStory.findOneAndUpdate(
   {
    business_id,
    user_id,
    book_id:bookId
   },
   {
    ...req.body,
    book_id:bookId,
    updatedBy:req.body.updatedBy||user_id||null
   },
   {
    returnDocument:"after",
    upsert:true,
    runValidators:true,
    setDefaultsOnInsert:true
   }
  );

  res.status(200).json({
   success:true,
   message:"Book name saved",
   data:bookName
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save book name",
   error:error.message
  });
 }
};

export const archiveBookName=async(req,res)=>{
 try{
  const {bookId}=req.params;
  const {business_id,user_id,updatedBy}=req.body;

  const filter={
   book_id:bookId
  };

  if(business_id)filter.business_id=business_id;
  if(user_id)filter.user_id=user_id;

  const bookName=await NameYourStory.findOneAndUpdate(
   filter,
   {
    isActive:false,
    updatedBy:updatedBy||user_id||null
   },
   {returnDocument:"after"}
  );

  if(!bookName){
   return res.status(404).json({
    success:false,
    message:"Book name not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Book name archived",
   data:bookName
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive book name",
   error:error.message
  });
 }
};
