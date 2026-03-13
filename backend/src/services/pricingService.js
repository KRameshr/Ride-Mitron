import AdminConfig from '../models/AdminConfig.js';

export const calculateRideCost = async (distanceKm, mileageKeyIN, fuelTypeIN) => {
    // 1. Minimum sanity checks
    let distanceToCalculate = distanceKm;
    if (distanceToCalculate < 1) {
        distanceToCalculate = 1; // charge at least 1km
    }

    const mileageToUse = Number(mileageKeyIN) || 15;
    const fuelTypeKey = fuelTypeIN?.toLowerCase() === 'diesel' ? 'dieselPrice' : 'petrolPrice';

    // 2. Load Config from Database
    const config = await AdminConfig.findOne() ||
        { petrolPrice: 100, dieselPrice: 90, platformFee: 5, riderMinFee: 15, riderPercentage: 10, driverMinFee: 10, driverPercentage: 5 };

    const fuelPrice = config[fuelTypeKey] || 100;

    // 3. Fuel Calculation (Formula applied verbatim to specification)
    const totalFuelCost = (distanceToCalculate / mileageToUse) * fuelPrice;

    // 4. Return raw constants 
    return {
        fuelCost: totalFuelCost,
        driverMinFee: config.driverMinFee || 10,
        driverPercentage: config.driverPercentage || 5,
        riderMinFee: config.riderMinFee || 15,
        riderPercentage: config.riderPercentage || 10,
        fuelPriceApplied: fuelPrice
    };
};
