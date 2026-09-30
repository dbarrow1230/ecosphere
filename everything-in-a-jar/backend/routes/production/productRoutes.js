import express from "express";
import {createProduct,deleteProduct,getProductById,getProducts,updateProduct} from "../../controllers/production/productController.js";

const router=express.Router();

router.post("/",createProduct);
router.get("/",getProducts);
router.get("/:id",getProductById);
router.put("/:id",updateProduct);
router.delete("/:id",deleteProduct);

export default router;
