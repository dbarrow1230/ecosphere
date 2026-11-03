import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import { root, loadEnvironment } from "./utils/environment.js";
import { connectDB } from './services/connectDB.js';
import { createInventoryService } from './services/inventoryService.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { createOverviewController } from "./controllers/dashboard/overviewController.js";
import { createOverviewRoutes } from "./routes/dashboard/overviewRoutes.js";
import { createResourcesController } from "./controllers/reference/resourcesController.js";
import { createResourcesRoutes } from "./routes/reference/resourcesRoutes.js";
import { createBlendsController } from "./controllers/products/blendsController.js";
import { createBlendsRoutes } from "./routes/products/blendsRoutes.js";
import { createStockController } from "./controllers/inventory/stockController.js";
import { createStockRoutes } from "./routes/inventory/stockRoutes.js";
import { createProductionController } from "./controllers/production/productionController.js";
import { createProductionRoutes } from "./routes/production/productionRoutes.js";
import { createOrdersController } from "./controllers/orders/ordersController.js";
import { createOrdersRoutes } from "./routes/orders/ordersRoutes.js";
import { createPublicWebsiteController } from './controllers/publicWebsiteController.js';
import { createPublicWebsiteRoutes } from './routes/publicWebsiteRoutes.js';
loadEnvironment();
const app = express(),
  port = Number(process.env.PORT || 6022);
const {
  protect
} = await import('./middleware/authMiddleware.js');
const {
  websiteManagementAccess
} = await import('../../shared/backend/websiteManagementAccess.js');
const {
  default: RoleAssignment
} = await import('./models/users/userRoleAssignmentModel.js');
const {
  connection,
  db
} = await connectDB();
const {default:User}=await import('./models/users/userModel.js');
const {default:businessConnection}=await import('./db/businessInfoConnection.js');
const {
  default: stateRoutes
} = await import('./routes/locations/stateRoutes.js');
const {
  default: countryRoutes
} = await import('./routes/locations/countryRoutes.js');
const {
  default: countyRoutes
} = await import('./routes/locations/countyRoutes.js');
const {
  default: partsRoutes
} = await import('./routes/reference/partsRoutes.js');
const {
  default: formsRoutes
} = await import('./routes/reference/formsRoutes.js');
const {
  default: statusRoutes
} = await import('./routes/reference/statusRoutes.js');
const {
  default: metricunitsRoutes
} = await import('./routes/reference/metricUnitsRoutes.js');
const {
  default: imperialunitsRoutes
} = await import('./routes/reference/imperialUnitsRoutes.js');
const {
  default: categoryRoutes
} = await import('./routes/reference/categoryRoutes.js');
const {
  default: businessRoutes
} = await import('./routes/reference/businessRoutes.js');
const {
  default: businessTypeRoutes
} = await import('./routes/reference/businessTypeRoutes.js');
const {
  default: appKeyRoutes
} = await import('./routes/reference/appKeyRoutes.js');
const {
  default: footerRoutes
} = await import('./routes/reference/footerRoutes.js');
const {
  default: seasonRoutes
} = await import('./routes/reference/seasonRoutes.js');
const {
  default: taglineRoutes
} = await import('./routes/reference/taglineRoutes.js');
const {
  default: occasionRoutes
} = await import('./routes/reference/occasionRoutes.js');
const {
  default: holidayRoutes
} = await import('./routes/reference/holidayRoutes.js');
const {
  default: receiptTemplateRoutes
} = await import('./routes/reference/receiptTemplateRoutes.js');
const {
  default: receiptHeaderRoutes
} = await import('./routes/reference/receiptHeaderRoutes.js');
const {
  default: receiptSubHeaderRoutes
} = await import('./routes/reference/receiptSubHeaderRoutes.js');
const {
  default: receiptFooterRoutes
} = await import('./routes/reference/receiptFooterRoutes.js');
const {
  default: imperialUnitRoutes
} = await import('./routes/reference/ImperialUnitRoutes.js');
const {
  default: metricUnitRoutes
} = await import('./routes/reference/MetricUnitRoutes.js');
const {
  default: locationTypeRoutes
} = await import('./routes/reference/LocationTypeRoutes.js');
const {
  default: locationRoutes
} = await import('./routes/reference/LocationRoutes.js');
const {
  default: taxRateRoutes
} = await import('./routes/reference/taxRateRoutes.js');
const {
  default: vendorRoutes
} = await import('./routes/reference/vendorRoutes.js');
const {
  default: allergenRoutes
} = await import('./routes/reference/allergenRoutes.js');
const {
  default: userDetailsRoutes
} = await import('./routes/users/userDetailsRoutes.js');
const {
  default: userRoutes
} = await import('./routes/users/userRoutes.js');
const {
  default: userRolesRoutes
} = await import('./routes/users/userRolesRoutes.js');
const {
  default: userRoleAssignmentRoutes
} = await import('./routes/users/userRoleAssignmentRoutes.js');
const {
  default: rolePermissionRoutes
} = await import('./routes/users/rolePermissionRoutes.js');
const {
  default: userPermissionOverrideRoutes
} = await import('./routes/users/userPermissionOverrideRoutes.js');
const {
  default: effectivePermissionRoutes
} = await import('./routes/users/effectivePermissionRoutes.js');
const {
  default: permissionRoutes
} = await import('./routes/users/permissionRoutes.js');
const {
  default: permissionModuleRoutes
} = await import('./routes/users/permissionModuleRoutes.js');
const {
  default: businessDepartmentRoutes
} = await import('./routes/users/businessDepartmentRoutes.js');
const {
  default: departmentPermissionRoutes
} = await import('./routes/users/departmentPermissionRoutes.js');
const {
  default: userDepartmentAssignmentRoutes
} = await import('./routes/users/userDepartmentAssignmentRoutes.js');
const {
  default: appModuleRoutes
} = await import('./routes/app/appModuleRoutes.js');
const {
  default: appRoutes
} = await import('./routes/app/appRoutes.js');
const services = {
  ...createInventoryService(db),
  connection
};
app.use(cors({
  origin: ['http://127.0.0.1:5174', 'http://localhost:5174', 'http://127.0.0.1:5196', 'http://localhost:5196', 'http://127.0.0.1:5228'],
  credentials: true
}));
app.use(express.json({
  limit: '150kb'
}));
app.use(cookieParser());
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  app: 'herbs-spices',
  database: mongoose.connection.name,
  accountsDatabase:User.db.name,
  businessDatabase:businessConnection.name
}));
app.use('/logos', express.static(path.join(root, 'backend/public/logos')));
app.use('/api/studio', protect, websiteManagementAccess(RoleAssignment));
app.use('/api/studio/overview', createOverviewRoutes(createOverviewController(services)));
app.use('/api/studio/resources', createResourcesRoutes(createResourcesController(services)));
app.use('/api/studio/blends', createBlendsRoutes(createBlendsController(services)));
app.use('/api/studio/stock', createStockRoutes(createStockController(services)));
app.use('/api/studio/production', createProductionRoutes(createProductionController(services)));
app.use('/api/studio/orders', createOrdersRoutes(createOrdersController(services)));
app.use('/api/public-site', createPublicWebsiteRoutes(createPublicWebsiteController(services)));
app.use("/api/app-modules", appModuleRoutes);
app.use("/api/app", appRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/counties", countyRoutes);
app.use("/api/reference/parts", partsRoutes);
app.use("/api/reference/forms", formsRoutes);
app.use("/api/reference/statuses", statusRoutes);
app.use("/api/reference/metric-units", metricunitsRoutes);
app.use("/api/reference/imperial-units", imperialunitsRoutes);
app.use("/api/reference/categories", categoryRoutes);
app.use("/api/reference/allergens", allergenRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/business-types", businessTypeRoutes);
app.use("/api/app-keys", appKeyRoutes);
app.use("/api/footers", footerRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/taglines", taglineRoutes);
app.use("/api/occasions", occasionRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/receipt-templates", receiptTemplateRoutes);
app.use("/api/receipt-headers", receiptHeaderRoutes);
app.use("/api/receipt-sub-headers", receiptSubHeaderRoutes);
app.use("/api/receipt-footers", receiptFooterRoutes);
app.use("/api/imperial-units", imperialUnitRoutes);
app.use("/api/metric-units", metricUnitRoutes);
app.use("/api/location-types", locationTypeRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/tax-rates", taxRateRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/allergens", allergenRoutes);
app.use("/api/users/details", userDetailsRoutes);
app.use("/api/users/roles", userRolesRoutes);
app.use("/api/users/role-assignments", userRoleAssignmentRoutes);
app.use("/api/users/role-permissions", rolePermissionRoutes);
app.use("/api/users/department-permissions", departmentPermissionRoutes);
app.use("/api/users/user-permission-overrides", userPermissionOverrideRoutes);
app.use("/api/users/effective-permissions", effectivePermissionRoutes);
app.use("/api/users/permissions", permissionRoutes);
app.use("/api/users/permission-modules", permissionModuleRoutes);
app.use("/api/users/business-departments", businessDepartmentRoutes);
app.use("/api/users/department-assignments", userDepartmentAssignmentRoutes);
app.use("/api/users", userRoutes);
app.use(notFound);
app.use((error, req, res, next) => {
  if (error.status) res.status(error.status);else if (error.name === 'Error' && res.statusCode === 200) res.status(400);
  return errorHandler(error, req, res, next);
});
const server = app.listen(port, '127.0.0.1', () => console.log('Herbs & Spices backend ready on http://127.0.0.1:' + port));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => {
  await connection.close();
  await mongoose.disconnect();
  process.exit(0);
}));
