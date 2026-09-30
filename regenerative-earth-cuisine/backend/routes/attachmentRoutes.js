import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {
  getAttachments,
  getAttachmentById,
  openAttachmentContent,
  createAttachment,
  uploadAttachment,
  updateAttachment,
  archiveAttachment,
  deleteAttachment,
} from "../controllers/attachmentController.js";

const router = express.Router();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const attachmentDirectory=path.resolve(__dirname,"../public/attachments");

if(!fs.existsSync(attachmentDirectory))fs.mkdirSync(attachmentDirectory,{recursive:true});

const sanitizeFileName=value=>String(value||"file").replace(/\\/g,"/").split("/").pop().replace(/[<>:"/\\|?*]/g,"_").trim()||"file";
const upload=multer({
 storage:multer.diskStorage({
  destination:(_req,_file,callback)=>callback(null,attachmentDirectory),
  filename:(_req,file,callback)=>callback(null,`${Date.now()}-${sanitizeFileName(file.originalname)}`)
 }),
 limits:{fileSize:26214400}
});

router.post("/upload",upload.single("file"),uploadAttachment);

router.route("/")
  .get(getAttachments)
  .post(createAttachment);

router.route("/:id")
  .get(getAttachmentById)
  .put(updateAttachment)
  .delete(deleteAttachment);

router.get("/:id/content", openAttachmentContent);

router.patch("/:id/archive", archiveAttachment);

export default router;
