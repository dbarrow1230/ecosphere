// backend/services/index.js
export {default as createInventoryTransactionService} from "./inventory/createInventoryTransactionService.js";
export {default as recalcInventoryBalanceService} from "./inventory/recalcInventoryBalanceService.js";
export {default as upsertInventoryLotService} from "./inventory/upsertInventoryLotService.js";

export {default as postGoodsReceiptService} from "./inventory/postGoodsReceiptService.js";
export {default as postStockTransferService} from "./inventory/postStockTransferService.js";
export {default as postStockAdjustmentService} from "./inventory/postStockAdjustmentService.js";
export {default as postSalesUsageService} from "./inventory/postSalesUsageService.js";
export {default as postVendorReturnService} from "./inventory/postVendorReturnService.js";
export {default as postWasteRecordService} from "./inventory/postWasteRecordService.js";