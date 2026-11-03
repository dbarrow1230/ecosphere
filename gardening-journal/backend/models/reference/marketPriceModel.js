import mongoose from "mongoose";

// Read existing pricing references without creating a new pricing catalog.
const schema=new mongoose.Schema({},{strict:false,autoCreate:false,autoIndex:false,collection:"market_prices"});
export default mongoose.models.MarketPrice||mongoose.model("MarketPrice",schema);
