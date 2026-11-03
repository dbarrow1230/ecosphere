export const emptyBlend = () => ({
  name: '',
  sku: '',
  description: '',
  category: '',
  heat: 'Mild',
  uses: '',
  storage: '',
  allergens: '',
  image: '',
  packGrams: 100,
  packagingCost: 0,
  price: 0,
  published: false,
  formula: []
});
export const emptyResource = () => ({
  name: '',
  costPerKg: 0,
  botanicalName: '',
  category: '',
  type: '',
  vendor: '',
  allergens: '',
  email: '',
  phone: '',
  notes: ''
});
export const resourceLabels = {
  herbs: 'Herbs',
  spices: 'Spices',
  vendors: 'Ingredient vendors',
  equipment: 'Equipment',
  kitchen_equipment: 'Kitchen equipment',
  equipment_vendors: 'Equipment vendors',
  category: 'Categories',
  types: 'Types'
};
export const blendCost = (row, ingredients) => row.formula.reduce((sum, part) => sum + row.packGrams * part.percent / 100 * Number(ingredients.find(item => item._id === part.ingredientId)?.costPerKg || 0) / 1000, 0) + Number(row.packagingCost);
