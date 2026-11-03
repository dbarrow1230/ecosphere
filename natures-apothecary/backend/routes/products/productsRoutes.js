// backend/routes/products/productsRoutes.js
import express from "express";
import {createProduct,getProducts,getProductById,updateProduct,deleteProduct,previewProductDetails} from "../../controllers/products/productsController.js";

const router=express.Router();

router.post("/parse-details",previewProductDetails);
router.post("/",createProduct);
router.get("/",getProducts);
router.get("/:id",getProductById);
router.put("/:id",updateProduct);
router.delete("/:id",deleteProduct);

export default router;
