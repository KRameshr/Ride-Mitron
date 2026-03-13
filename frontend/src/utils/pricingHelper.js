export const calculateCost = (distance, mileage, petrolPrice, platformFee) => {
    const fuel = (distance / mileage) * petrolPrice;
    return {
        fuel,
        platformFee,
        totalBase: fuel + platformFee
    };
};
