// backend/models/index.js

// admin
export {default as AdminSetting} from "./admin/AdminSettingModel.js";

// core
export {default as ClientBusiness} from "./core/clientBusinessModel.js";
export {default as BusinessProfile} from "./core/BusinessProfileModel.js";
export {default as ContactInquiry} from "./core/contactInquiryModel.js";
export {default as SocialLink} from "./core/SocialLinkModel.js";

// consulting
export {default as Service} from "./consulting/serviceModel.js";
export {default as Project} from "./consulting/projectModel.js";
export {default as ProjectNote} from "./consulting/projectNoteModel.js";
export {default as Assessment} from "./consulting/assessmentModel.js";
export {default as MenuReview} from "./consulting/menuReviewModel.js";
export {default as OpeningSupport} from "./consulting/OpeningSupportModel.js";
export {default as Proposal} from "./consulting/proposalModel.js";
export {default as Deliverable} from "./consulting/deliverableModel.js";

// content
export {default as CaseStudy} from "./content/caseStudyModel.js";
export {default as Resource} from "./content/ResourceModel.js";
export {default as Testimonial} from "./content/testimonialModel.js";

// dashboard
export {default as DashboardPreference} from "./dashboard/DashboardPreferenceModel.js";
export {default as DashboardSnapshot} from "./dashboard/dashboardSnapshotModel.js";
export {default as DashboardStat} from "./dashboard/DashboardStatModel.js";
export {default as DashboardWidget} from "./dashboard/DashboardWidgetModel.js";

// finance
export {default as Pricing} from "./finance/pricingModel.js";
export {default as Estimate} from "./finance/estimateModel.js";
export {default as Invoice} from "./finance/invoiceModel.js";
export {default as Payment} from "./finance/paymentModel.js";
export {default as Expense} from "./finance/expenseModel.js";

// foundation
export {default as AuditLog} from "./foundation/AuditLogModel.js";
export {default as MediaAsset} from "./foundation/MediaAssetModel.js";
// Seo optional
export {default as Seo} from "./foundation/SeoModel.js";

// inventory
export {default as InventoryItem} from "./inventory/InventoryItemModel.js";
export {default as InventoryLot} from "./inventory/inventoryLotModel.js";
export {default as InventoryTransaction} from "./inventory/inventoryTransactionModel.js";
export {default as InventoryBalance} from "./inventory/inventoryBalanceModel.js";
export {default as PantryItem} from "./inventory/PantryItemModel.js";
export {default as ShoppingList} from "./inventory/ShoppingListModel.js";
export {default as VendorItem} from "./inventory/VendorItemModel.js";

// locations
export {default as Country} from "./locations/countryModel.js";
export {default as County} from "./locations/countyModel.js";
export {default as State} from "./locations/stateModel.js";
export {default as Location} from "./locations/LocationModel.js";
export {default as KitchenLocation} from "./locations/KitchenLocationModel.js";
export {default as StorageLocation} from "./locations/StorageLocationModel.js";

// master
export {default as CategoryMaster} from "./master/CategoryModel.js";
export {default as Course} from "./master/CourseModel.js";
export {default as Cuisine} from "./master/CuisineModel.js";
export {default as Dietary} from "./master/DietaryModel.js";
export {default as Recipe} from "./master/ReceipeModel.js";
export {default as RecipeCosting} from "./master/RecipeCostingModel.js";
export {default as VendorCategory} from "./master/VendorCategoryModel.js";
export {default as VendorIngredientPrice} from "./master/VendorIngredientPriceModel.js";

// reference
export {default as AppKey} from "./reference/appKeyModel.js";
export {default as BusinessRef} from "./reference/businessModel.js";
export {default as BusinessType} from "./reference/businessTypeModel.js";
export {default as LocationRef} from "./reference/LocationModel.js";
export {default as LocationType} from "./reference/LocationTypeModel.js";
export {default as MetricUnit} from "./reference/MetricUnitModel.js";
export {default as ImperialUnit} from "./reference/ImperialUnitModel.js";
export {default as TaxRate} from "./reference/TaxRateModel.js";
export {default as Vendor} from "./reference/vendorModel.js";

// reporting
export {default as Report} from "./reporting/ReportModel.js";
export {default as ConsultingSnapshot} from "./reporting/consultingSnapshotModel.js";
export {default as ProjectReport} from "./reporting/projectReportModel.js";
export {default as MenuPerformanceReport} from "./reporting/MenuPerformanceReportModel.js";
export {default as RevenueReport} from "./reporting/RevenueReportModel.js";
export {default as WasteReport} from "./reporting/WasteReportModel.js";

// taxonomy
export {default as Category} from "./taxonomy/CategoryModel.js";
export {default as Tag} from "./taxonomy/TagModel.js";
export {default as Label} from "./taxonomy/LabelModel.js";

// users
export {default as Permission} from "./users/permissionModel.js";
export {default as User} from "./users/userModel.js";
export {default as UserDetails} from "./users/userDetailsModel.js";
export {default as UserRoles} from "./users/userRolesModel.js";
export {default as RolePermission} from "./users/rolePermissionModel.js";
export {default as UserRoleAssignment} from "./users/userRoleAssignmentModel.js";
export {default as UserPermissionOverride} from "./users/userPermissionOverrideModel.js";

// waste
export {default as WasteReason} from "./waste/WasteReasonModel.js";
export {default as WasteEntry} from "./waste/WasteEntryModel.js";
export {default as WasteRecord} from "./waste/wasteRecordModel.js";
export {default as WasteSummary} from "./waste/WasteSummaryModel.js";