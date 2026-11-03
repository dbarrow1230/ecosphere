// backend/routes/product/productRoutes.js
import express from "express";
import {
 getProducts,
 getProductById,
 createProduct,
 updateProduct,
 deleteProduct
} from "../../controllers/product/productController.js";

const router=express.Router();

router.get("/",getProducts);
router.get("/:id",getProductById);
router.post("/",createProduct);
router.put("/:id",updateProduct);
router.delete("/:id",deleteProduct);

export default router;