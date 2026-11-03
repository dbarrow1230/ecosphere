import Attachment from "../models/attachmentModel.js";
import {generateRecordId} from "../utils/recordId.js";
import fs from "node:fs/promises";
import path from "node:path";

const normalizeTags=value=>[
 ...new Set((Array.isArray(value)?value:String(value||"").split(",")).map(item=>String(item||"").trim()).filter(Boolean))
];

export const getAttachments = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const { parentModel, parentRecordId, status } = req.query;

    const filter = { userId };
    if (parentModel) filter.parentModel = parentModel;
    if (parentRecordId) filter.parentRecordId = parentRecordId;
    if (status) filter.status = status;

    const attachments = await Attachment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: attachments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttachmentById = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const attachment = await Attachment.findOne({ _id: req.params.id, userId });

    if (!attachment) return res.status(404).json({ success: false, message: "Attachment not found" });

    res.json({ success: true, data: attachment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAttachment = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, message: "A user is required to create an attachment" });
    const attachmentId = await generateRecordId({userId,recordType:"ATT",projectCode:req.body.projectCode||"GENERAL",subtype:req.body.parentModel || "FILE",subjectCode:req.body.subjectCode});
    const attachment = await Attachment.create({
      ...req.body,
      userId,
      attachmentId,
    });

    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAttachment = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId || req.query.userId;

    const attachment = await Attachment.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { returnDocument:"after", runValidators: true }
    );

    if (!attachment) return res.status(404).json({ success: false, message: "Attachment not found" });

    res.json({ success: true, data: attachment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const archiveAttachment = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId || req.query.userId;

    const attachment = await Attachment.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: "archived" },
      { returnDocument:"after" }
    );

    if (!attachment) return res.status(404).json({ success: false, message: "Attachment not found" });

    res.json({ success: true, data: attachment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    const attachment = await Attachment.findOneAndDelete({ _id: req.params.id, userId });

    if (!attachment) return res.status(404).json({ success: false, message: "Attachment not found" });

    res.json({ success: true, message: "Attachment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) return res.status(400).json({ success: false, message: "A user is required to upload an attachment" });
    if (!req.file) return res.status(400).json({ success: false, message: "Choose a file to upload" });
    if (!req.body.parentModel || !req.body.parentRecordId) {
      return res.status(400).json({ success: false, message: "The attachment must be linked to a saved record" });
    }

    const attachmentId = await generateRecordId({
      userId,
      recordType: "ATT",
      projectCode: req.body.projectCode || "GENERAL",
      subtype: req.body.parentModel || "FILE",
      subjectCode: req.body.subjectCode || path.parse(req.file.originalname).name,
    });

    const attachment = await Attachment.create({
      userId,
      attachmentId,
      parentModel: req.body.parentModel,
      parentRecordId: req.body.parentRecordId,
      parentDisplayId: req.body.parentDisplayId || "",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: path.resolve(req.file.path),
      fileType: path.extname(req.file.originalname).replace(/^\./, "").toLowerCase(),
      mimeType: req.file.mimetype || "application/octet-stream",
      size: req.file.size || 0,
      description: req.body.description || "",
      tags: normalizeTags(req.body.tags),
      status: "active",
    });

    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const openAttachmentContent = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const attachment = await Attachment.findOne({ _id: req.params.id, userId }).lean();

    if (!attachment) return res.status(404).json({ success: false, message: "Attachment not found" });

    const absolutePath = path.resolve(attachment.filePath);
    const file = await fs.stat(absolutePath);

    if (!file.isFile()) return res.status(404).json({ success: false, message: "Attachment file was not found" });

    const fileName = attachment.originalName || attachment.fileName || path.basename(absolutePath);
    res.type(attachment.mimeType || attachment.fileType || path.extname(fileName));
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.sendFile(absolutePath);
  } catch (error) {
    const status = error?.code === "ENOENT" ? 404 : 500;
    res.status(status).json({ success: false, message: status === 404 ? "Attachment file was not found" : error.message });
  }
};
