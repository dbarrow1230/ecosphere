const toNumber=value=>{
  const number=Number(value);
  return Number.isFinite(number)?number:0;
};

const divide=(amount, divisor)=>{
  const numerator=toNumber(amount);
  const denominator=toNumber(divisor);
  return denominator===0?0:numerator/denominator;
};

const percentage=value=>toNumber(value)/100;

export const calculateCostPerPurchaseUnit=(packageCost, packageQuantity)=>{
  return divide(packageCost,packageQuantity);
};

export const calculateTotalRecipeUnits=(packageQuantity, conversionRate)=>{
  return toNumber(packageQuantity)*toNumber(conversionRate);
};

export const calculateCostPerRecipeUnit=(packageCost, packageQuantity, conversionRate=1)=>{
  const totalRecipeUnits=calculateTotalRecipeUnits(packageQuantity,conversionRate);
  return divide(packageCost,totalRecipeUnits);
};

export const calculateIngredientCost=(amountNeeded, costPerRecipeUnit)=>{
  return toNumber(amountNeeded)*toNumber(costPerRecipeUnit);
};

export const calculateIngredientCostFromPackage=(packageCost, packageQuantity, conversionRate, amountNeeded)=>{
  const costPerRecipeUnit=calculateCostPerRecipeUnit(packageCost,packageQuantity,conversionRate);
  return calculateIngredientCost(amountNeeded,costPerRecipeUnit);
};

export const calculatePackagesRequired=(amountNeeded, packageQuantity)=>{
  return divide(amountNeeded,packageQuantity);
};

export const calculateWholePackagesRequired=(amountNeeded, packageQuantity)=>{
  return Math.ceil(calculatePackagesRequired(amountNeeded,packageQuantity));
};

export const calculateWholePackagePurchaseCost=(amountNeeded, packageQuantity, packageCost)=>{
  return calculateWholePackagesRequired(amountNeeded,packageQuantity)*toNumber(packageCost);
};

export const calculatePartialPackageCost=(amountUsed, packageQuantity, packageCost)=>{
  return divide(amountUsed,packageQuantity)*toNumber(packageCost);
};

export const convertUnits=(quantity, conversionFactor)=>{
  return toNumber(quantity)*toNumber(conversionFactor);
};

export const calculateConversionRate=(targetQuantity, sourceQuantity)=>{
  return divide(targetQuantity,sourceQuantity);
};

export const calculateWeightToVolume=(packageWeight, weightPerRecipeUnit)=>{
  return divide(packageWeight,weightPerRecipeUnit);
};

export const calculateVolumeToWeight=(recipeVolume, weightPerVolumeUnit)=>{
  return toNumber(recipeVolume)*toNumber(weightPerVolumeUnit);
};

export const calculateYieldPercentage=(ediblePortionWeight, asPurchasedWeight)=>{
  return divide(ediblePortionWeight,asPurchasedWeight)*100;
};

export const calculateWastePercentage=(wasteWeight, asPurchasedWeight)=>{
  return divide(wasteWeight,asPurchasedWeight)*100;
};

export const calculateWasteWeight=(asPurchasedWeight, ediblePortionWeight)=>{
  return toNumber(asPurchasedWeight)-toNumber(ediblePortionWeight);
};

export const calculateEdiblePortionQuantity=(asPurchasedQuantity, yieldPercentage)=>{
  return toNumber(asPurchasedQuantity)*percentage(yieldPercentage);
};

export const calculateAsPurchasedQuantity=(ediblePortionQuantity, yieldPercentage)=>{
  return divide(ediblePortionQuantity,percentage(yieldPercentage));
};

export const calculateEdiblePortionUnitCost=(asPurchasedUnitCost, yieldPercentage)=>{
  return divide(asPurchasedUnitCost,percentage(yieldPercentage));
};

export const calculateYieldFactor=yieldPercentage=>{
  return divide(1,percentage(yieldPercentage));
};

export const calculateWasteCost=(wasteQuantity, unitCost)=>{
  return toNumber(wasteQuantity)*toNumber(unitCost);
};

export const calculateTotalIngredientCost=ingredientCosts=>{
  return ingredientCosts.reduce((total,cost)=>total+toNumber(cost),0);
};

export const calculateSubRecipeUnitCost=(subRecipeCost, subRecipeYield)=>{
  return divide(subRecipeCost,subRecipeYield);
};

export const calculateSubRecipeCostUsed=(amountUsed, subRecipeUnitCost)=>{
  return toNumber(amountUsed)*toNumber(subRecipeUnitCost);
};

export const calculateAdjustedRecipeCost=({
  ingredientCost=0,
  wasteCost=0,
  laborCost=0,
  overheadCost=0,
  packagingCost=0,
  otherCost=0
})=>{
  return [
    ingredientCost,
    wasteCost,
    laborCost,
    overheadCost,
    packagingCost,
    otherCost
  ].reduce((total,cost)=>total+toNumber(cost),0);
};

export const calculateRecipeCostWithContingency=(recipeCost, contingencyPercentage)=>{
  return toNumber(recipeCost)*(1+percentage(contingencyPercentage));
};

export const calculateCostPerPortion=(recipeCost, portions)=>{
  return divide(recipeCost,portions);
};

export const calculateRecipeCostPerWeightUnit=(recipeCost, finishedWeight)=>{
  return divide(recipeCost,finishedWeight);
};

export const calculateRecipeCostPerVolumeUnit=(recipeCost, finishedVolume)=>{
  return divide(recipeCost,finishedVolume);
};

export const calculatePortionCostByWeight=(portionWeight, costPerWeightUnit)=>{
  return toNumber(portionWeight)*toNumber(costPerWeightUnit);
};

export const calculatePortionsProduced=(finishedYield, portionSize)=>{
  return divide(finishedYield,portionSize);
};

export const calculatePortionVariance=(actualPortionSize, standardPortionSize)=>{
  return toNumber(actualPortionSize)-toNumber(standardPortionSize);
};

export const calculateOverPortionCost=(portionVariance, costPerWeightUnit, portionsSold)=>{
  return toNumber(portionVariance)*toNumber(costPerWeightUnit)*toNumber(portionsSold);
};

export const calculateRecipeConversionFactor=(desiredYield, originalYield)=>{
  return divide(desiredYield,originalYield);
};

export const calculateScaledQuantity=(originalQuantity, conversionFactor)=>{
  return toNumber(originalQuantity)*toNumber(conversionFactor);
};

export const calculateScaledRecipeCost=(originalRecipeCost, conversionFactor)=>{
  return toNumber(originalRecipeCost)*toNumber(conversionFactor);
};

export const calculateNewYield=(availableQuantity, originalQuantity, originalYield)=>{
  return divide(availableQuantity,originalQuantity)*toNumber(originalYield);
};

export const calculateBatchCount=(requiredQuantity, yieldPerBatch)=>{
  return divide(requiredQuantity,yieldPerBatch);
};

export const calculateWholeBatchCount=(requiredQuantity, yieldPerBatch)=>{
  return Math.ceil(calculateBatchCount(requiredQuantity,yieldPerBatch));
};

export const calculateLaborCostPerMinute=hourlyWage=>{
  return divide(hourlyWage,60);
};

export const calculateLaborCost=(laborHours, hourlyWage)=>{
  return toNumber(laborHours)*toNumber(hourlyWage);
};

export const calculateLaborCostFromMinutes=(laborMinutes, hourlyWage)=>{
  return divide(laborMinutes,60)*toNumber(hourlyWage);
};

export const calculateLoadedLaborRate=(hourlyWage, payrollBurdenPercentage)=>{
  return toNumber(hourlyWage)*(1+percentage(payrollBurdenPercentage));
};

export const calculateLoadedLaborCost=(laborHours, loadedLaborRate)=>{
  return toNumber(laborHours)*toNumber(loadedLaborRate);
};

export const calculateLaborCostPerPortion=(laborCost, portions)=>{
  return divide(laborCost,portions);
};

export const calculateLaborPercentage=(laborCost, salesRevenue)=>{
  return divide(laborCost,salesRevenue)*100;
};

export const calculateOverheadRatePerHour=(periodOverhead, productiveHours)=>{
  return divide(periodOverhead,productiveHours);
};

export const calculateRecipeOverheadCost=(productionHours, overheadRatePerHour)=>{
  return toNumber(productionHours)*toNumber(overheadRatePerHour);
};

export const calculateOverheadPercentageAllocation=(directCost, overheadPercentage)=>{
  return toNumber(directCost)*percentage(overheadPercentage);
};

export const calculateUtilityCostPerMinute=equipmentCostPerHour=>{
  return divide(equipmentCostPerHour,60);
};

export const calculateEquipmentUtilityCost=(equipmentMinutes, utilityCostPerMinute)=>{
  return toNumber(equipmentMinutes)*toNumber(utilityCostPerMinute);
};

export const calculateElectricEquipmentCost=(kilowatts, hoursUsed, electricityRate)=>{
  return toNumber(kilowatts)*toNumber(hoursUsed)*toNumber(electricityRate);
};

export const calculateGasEquipmentCost=(gasUsage, gasRate)=>{
  return toNumber(gasUsage)*toNumber(gasRate);
};

export const calculateOverheadCostPerPortion=(overheadCost, portions)=>{
  return divide(overheadCost,portions);
};

export const calculatePackagingCostPerPortion=packagingItems=>{
  return packagingItems.reduce((total,cost)=>total+toNumber(cost),0);
};

export const calculateTotalPackagingCost=(packagingCostPerPortion, portions)=>{
  return toNumber(packagingCostPerPortion)*toNumber(portions);
};

export const calculateMileageCost=(milesDriven, costPerMile)=>{
  return toNumber(milesDriven)*toNumber(costPerMile);
};

export const calculatePackagingPercentage=(packagingCost, sellingPrice)=>{
  return divide(packagingCost,sellingPrice)*100;
};

export const calculateFoodCostPercentage=(foodCost, sellingPrice)=>{
  return divide(foodCost,sellingPrice)*100;
};

export const calculateSellingPriceFromFoodCost=(foodCost, targetFoodCostPercentage)=>{
  return divide(foodCost,percentage(targetFoodCostPercentage));
};

export const calculateFoodCostAllowance=(sellingPrice, targetFoodCostPercentage)=>{
  return toNumber(sellingPrice)*percentage(targetFoodCostPercentage);
};

export const calculateCostMultiplier=targetFoodCostPercentage=>{
  return divide(1,percentage(targetFoodCostPercentage));
};

export const calculateSellingPriceFromMultiplier=(foodCost, costMultiplier)=>{
  return toNumber(foodCost)*toNumber(costMultiplier);
};

export const calculatePrimeCost=(foodCost, laborCost)=>{
  return toNumber(foodCost)+toNumber(laborCost);
};

export const calculatePrimeCostPercentage=(primeCost, salesRevenue)=>{
  return divide(primeCost,salesRevenue)*100;
};

export const calculateFullCostPerPortion=costs=>{
  return costs.reduce((total,cost)=>total+toNumber(cost),0);
};

export const calculateSellingPriceFromFullCost=(fullCost, targetTotalCostPercentage)=>{
  return divide(fullCost,percentage(targetTotalCostPercentage));
};

export const calculateMarkupAmount=(sellingPrice, cost)=>{
  return toNumber(sellingPrice)-toNumber(cost);
};

export const calculateMarkupPercentage=(profit, cost)=>{
  return divide(profit,cost)*100;
};

export const calculateSellingPriceFromMarkup=(cost, markupPercentage)=>{
  return toNumber(cost)*(1+percentage(markupPercentage));
};

export const calculateGrossProfit=(sellingPrice, costOfGoodsSold)=>{
  return toNumber(sellingPrice)-toNumber(costOfGoodsSold);
};

export const calculateGrossMarginPercentage=(grossProfit, sellingPrice)=>{
  return divide(grossProfit,sellingPrice)*100;
};

export const calculateSellingPriceFromMargin=(cost, marginPercentage)=>{
  return divide(cost,1-percentage(marginPercentage));
};

export const calculateContributionMargin=(sellingPrice, variableCost)=>{
  return toNumber(sellingPrice)-toNumber(variableCost);
};

export const calculateContributionMarginPercentage=(contributionMargin, sellingPrice)=>{
  return divide(contributionMargin,sellingPrice)*100;
};

export const calculateNetProfit=(revenue, expenses)=>{
  return toNumber(revenue)-toNumber(expenses);
};

export const calculateNetProfitMargin=(netProfit, revenue)=>{
  return divide(netProfit,revenue)*100;
};

export const calculateDiscountAmount=(originalPrice, discountPercentage)=>{
  return toNumber(originalPrice)*percentage(discountPercentage);
};

export const calculateDiscountedPrice=(originalPrice, discountPercentage)=>{
  return toNumber(originalPrice)-calculateDiscountAmount(originalPrice,discountPercentage);
};

export const calculatePriceBeforeDiscount=(discountedPrice, discountPercentage)=>{
  return divide(discountedPrice,1-percentage(discountPercentage));
};

export const calculateSalesTax=(taxablePrice, taxRate)=>{
  return toNumber(taxablePrice)*percentage(taxRate);
};

export const calculatePriceIncludingTax=(sellingPrice, taxRate)=>{
  return toNumber(sellingPrice)*(1+percentage(taxRate));
};

export const calculatePreTaxPrice=(taxInclusivePrice, taxRate)=>{
  return divide(taxInclusivePrice,1+percentage(taxRate));
};

export const calculatePlatformFee=(sellingPrice, platformFeePercentage)=>{
  return toNumber(sellingPrice)*percentage(platformFeePercentage);
};

export const calculateNetRevenueAfterFees=({
  sellingPrice=0,
  discounts=0,
  platformFees=0,
  transactionFees=0
})=>{
  return toNumber(sellingPrice)-toNumber(discounts)-toNumber(platformFees)-toNumber(transactionFees);
};

export const calculateRequiredPlatformPrice=(targetNetRevenue, platformFeePercentage)=>{
  return divide(targetNetRevenue,1-percentage(platformFeePercentage));
};

export const calculateCostOfGoodsSold=(beginningInventory, purchases, endingInventory)=>{
  return toNumber(beginningInventory)+toNumber(purchases)-toNumber(endingInventory);
};

export const calculateAverageInventory=(beginningInventory, endingInventory)=>{
  return (toNumber(beginningInventory)+toNumber(endingInventory))/2;
};

export const calculateInventoryTurnover=(costOfGoodsSold, averageInventory)=>{
  return divide(costOfGoodsSold,averageInventory);
};

export const calculateDaysOfInventory=(daysInPeriod, inventoryTurnover)=>{
  return divide(daysInPeriod,inventoryTurnover);
};

export const calculateFoodCostVariance=(actualFoodCost, theoreticalFoodCost)=>{
  return toNumber(actualFoodCost)-toNumber(theoreticalFoodCost);
};

export const calculateCaseCostPerUnit=(caseCost, unitsPerCase)=>{
  return divide(caseCost,unitsPerCase);
};

export const calculateDeliveredUnitCost=(productCost, freight, deliveryFees, totalUnits)=>{
  return divide(
    toNumber(productCost)+toNumber(freight)+toNumber(deliveryFees),
    totalUnits
  );
};

export const calculateSupplierSavings=(priceDifference, quantityPurchased)=>{
  return toNumber(priceDifference)*toNumber(quantityPurchased);
};

export const calculateGuestCountWithBuffer=(expectedGuests, bufferPercentage)=>{
  return toNumber(expectedGuests)*(1+percentage(bufferPercentage));
};

export const calculateCateringLaborCost=(staffCount, hoursWorked, hourlyRate)=>{
  return toNumber(staffCount)*toNumber(hoursWorked)*toNumber(hourlyRate);
};

export const calculateCateringPricePerGuest=(sellingPrice, guestCount)=>{
  return divide(sellingPrice,guestCount);
};

export const calculateCateringProfit=(eventRevenue, eventCost)=>{
  return toNumber(eventRevenue)-toNumber(eventCost);
};

export const calculateBreakEvenUnits=(fixedCosts, contributionMarginPerUnit)=>{
  return divide(fixedCosts,contributionMarginPerUnit);
};

export const calculateBreakEvenSales=(fixedCosts, contributionMarginPercentage)=>{
  return divide(fixedCosts,percentage(contributionMarginPercentage));
};

export const calculateUnitsForTargetProfit=(fixedCosts, targetProfit, contributionMarginPerUnit)=>{
  return divide(toNumber(fixedCosts)+toNumber(targetProfit),contributionMarginPerUnit);
};

export const calculateAverageCheck=(totalSales, transactions)=>{
  return divide(totalSales,transactions);
};

export const calculateMenuItemContributionMargin=(menuPrice, itemFoodCost)=>{
  return toNumber(menuPrice)-toNumber(itemFoodCost);
};

export const calculatePopularityPercentage=(itemQuantitySold, totalItemsSold)=>{
  return divide(itemQuantitySold,totalItemsSold)*100;
};

export const calculatePopularityThreshold=menuItemCount=>{
  return divide(100,menuItemCount)*0.7;
};

export const calculateUsageVariance=(actualUsage, standardUsage)=>{
  return toNumber(actualUsage)-toNumber(standardUsage);
};

export const calculateUsageVarianceCost=(usageVariance, standardUnitCost)=>{
  return toNumber(usageVariance)*toNumber(standardUnitCost);
};

export const calculatePriceVariance=(actualUnitCost, standardUnitCost, actualQuantity)=>{
  return (toNumber(actualUnitCost)-toNumber(standardUnitCost))*toNumber(actualQuantity);
};