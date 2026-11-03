import createHerbModel from "../models/ingredients/herbModel.js";
import createSpiceModel from "../models/ingredients/spiceModel.js";
import createVendorModel from "../models/reference/ingredientVendorModel.js";
import createEquipmentModel from "../models/reference/equipmentModel.js";
import createKitchenEquipmentModel from "../models/reference/kitchenEquipmentModel.js";
import createEquipmentVendorModel from "../models/reference/equipmentVendorModel.js";
import createCategoryModel from "../models/reference/ingredientCategoryModel.js";
import createTypeModel from "../models/reference/typeModel.js";
import createBlendModel from "../models/products/blendModel.js";
import createOrderModel from "../models/orders/orderModel.js";
import createInventoryLedgerModel from "../models/inventory/inventoryLedgerModel.js";
export function createModels(connection) {
  return {
    'herbs': createHerbModel(connection),
    'spices': createSpiceModel(connection),
    'vendors': createVendorModel(connection),
    'equipment': createEquipmentModel(connection),
    'kitchen_equipment': createKitchenEquipmentModel(connection),
    'equipment_vendors': createEquipmentVendorModel(connection),
    'category': createCategoryModel(connection),
    'types': createTypeModel(connection),
    blends: createBlendModel(connection),
    orders: createOrderModel(connection),
    inventory_ledger: createInventoryLedgerModel(connection)
  };
}
