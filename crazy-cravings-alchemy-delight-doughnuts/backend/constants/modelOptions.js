export const ORDER_TYPES = {
  ONLINE: "online",
  PICKUP: "pickup",
  DELIVERY: "delivery",
};

export const RETURN_REASONS = {
  CHANGED_MIND: "changedMind",
  WRONG_ITEM: "wrongItem",
  DAMAGED: "damaged",
  DEFECTIVE: "defective",
  NOT_AS_DESCRIBED: "notAsDescribed",
  LATE_DELIVERY: "lateDelivery",
  DUPLICATE_ORDER: "duplicateOrder",
  OTHER: "other",
};

export const ITEM_CONDITIONS = {
  NEW: "new",
  UNOPENED: "unopened",
  OPENED: "opened",
  USED: "used",
  DAMAGED: "damaged",
  DEFECTIVE: "defective",
};

export const RETURN_RESOLUTIONS = {
  REFUND: "refund",
  EXCHANGE: "exchange",
  REPLACEMENT: "replacement",
  STORE_CREDIT: "storeCredit",
};

export const REFUND_METHODS = {
  ORIGINAL_PAYMENT: "originalPayment",
  STORE_CREDIT: "storeCredit",
  CASH: "cash",
  EXCHANGE: "exchange",
  OTHER: "other",
};

export const REFUND_STATUSES = {
  NONE: "none",
  PENDING: "pending",
  PARTIAL: "partial",
  REFUNDED: "refunded",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export const RETURN_ITEM_STATUSES = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  RECEIVED: "received",
  COMPLETED: "completed",
};

export const BUDGET_PERIODS = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
  CUSTOM: "custom",
};
