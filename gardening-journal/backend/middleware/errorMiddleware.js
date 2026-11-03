// backend/middleware/errorMiddleware.js

const notFound=(req,res,next)=>{
 if(!req.originalUrl.startsWith("/api")){
  return next();
 }

 const error=new Error(`Not Found - ${req.originalUrl}`);
 res.status(404);
 next(error);
};

const errorHandler=(err,req,res,next)=>{
 let statusCode=res.statusCode===200?500:res.statusCode;
 let message=err.message||"Server Error";

 if(err.name==="CastError")
 {
  statusCode=400;
  message="Invalid resource id";
 }

 if(err.code===11000)
 {
  statusCode=409;
  message="Duplicate field value entered";
 }

 if(err.name==="ValidationError")
 {
  statusCode=400;
  message=Object.values(err.errors).map(val=>val.message).join(", ");
 }

 res.status(statusCode).json({
  message,
  stack:process.env.NODE_ENV==="production"?null:err.stack
 });
};

export {notFound,errorHandler};