import BookModel from "../../models/BookModel.js";
import AuthorModel from "../../models/AuthorModel.js";
import PublisherModel from "../../models/PublisherModel.js";
import LoanModel from "../../models/LoanModel.js";
import ReadingGoalModel from "../../models/ReadingGoalModel.js";
import ReadingPlanModel from "../../models/ReadingPlanModel.js";

const currentGoalQuery=()=>{
 const now=new Date();
 const year=now.getFullYear();
 const month=now.getMonth()+1;

 return {
  status:"active",
  $or:[
   {period:"monthly",year,month},
   {period:"yearly",year}
  ]
 };
};

export const getLibraryDashboardSummary=async(req,res)=>{
 try{
  const [
   books,
   authors,
   publishers,
   loans,
   readingGoal,
   readingPlans
  ]=await Promise.all([
   BookModel.find({})
    .select("title subtitle authors publishers formats formatPrices genres subjects purchaseDate reading pages pageCount cost currency publication images isbn10 isbn13 eisbn asin catalogStatus amazonListingRequired amazonRequired asinRequired requiresAsin requiresASIN requiresAmazon amazon metadata source entrySource importSource createdByImport")
    .populate({path:"authors",select:"displayName firstName middleName lastName name"})
    .populate({path:"publishers",select:"name"})
    .populate({path:"formats",select:"name"})
    .populate({path:"formatPrices.format",select:"name"})
    .populate({path:"genres",select:"name"})
    .lean(),
   AuthorModel.find({}).select("displayName firstName middleName lastName name").lean(),
   PublisherModel.find({}).select("name").lean(),
   LoanModel.find({}).select("book returnedAt status dueAt lentAt").lean(),
   ReadingGoalModel.findOne(currentGoalQuery()).sort({period:1,updatedAt:-1}).lean(),
   ReadingPlanModel.find({status:"active"})
    .select("name book subject daysOfWeek startDate endDate status")
    .populate({path:"book",select:"title subtitle"})
    .lean()
  ]);

  return res.status(200).json({
   success:true,
   books,
   authors,
   publishers,
   loans,
   readingGoal,
   readingPlans
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch dashboard summary",
   error:error.message
  });
 }
};
