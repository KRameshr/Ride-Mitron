import Ride from '../models/Ride.js';
import { getDistanceMatrix, geocodeAddress } from '../services/mapsService.js';
import { calculateRideCost } from '../services/pricingService.js';
import User from '../models/User.js';

import AdminConfig from '../models/AdminConfig.js';

export const postRide = async (req, res, next) => {
    try {
        // Basic verification
        const user = await User.findById(req.user._id);
        if (!user.vehicleDetails || !user.vehicleDetails.hasVehicle) {
            return res.status(403).json({ message: 'Must add vehicle details to post a ride' });
        }

        let { origin, destination, startTime, totalSeats } = req.body;

        if (!origin?.coordinates || origin.coordinates.length < 2 || origin.coordinates[0] == null) {
            origin.coordinates = await geocodeAddress(origin.name);
        }

        if (!destination?.coordinates || destination.coordinates.length < 2 || destination.coordinates[0] == null) {
            destination.coordinates = await geocodeAddress(destination.name);
        }

        // Get distance using Google Maps Service
        const distanceData = await getDistanceMatrix(
            origin.coordinates,
            destination.coordinates
        );

        const distanceKm = distanceData.distanceValue / 1000;

        // Cost calculation calculation model as spec Model logic
        let totalFuelCost = 0;
        let fuelCostPerUser = 0;
        let driverFee = 0;
        let riderFee = 0;
        let costPerSeat = 0; // Rider Cost

        if (distanceKm > 0) {
            const config = await AdminConfig.findOne() || { petrolPrice: 100, dieselPrice: 90, riderMinFee: 15, riderPercentage: 10, driverMinFee: 10, driverPercentage: 5 };
            const mileageToUse = user.vehicleDetails.mileage || 15;
            const hasDiesel = user.vehicleDetails.fuelType === 'diesel';
            const priceToUse = hasDiesel ? config.dieselPrice : config.petrolPrice;

            totalFuelCost = (distanceKm / mileageToUse) * priceToUse;
            fuelCostPerUser = totalFuelCost / (totalSeats + 1);

            driverFee = Math.max(config.driverMinFee, fuelCostPerUser * ((config.driverPercentage || 5) / 100));
            riderFee = Math.max(config.riderMinFee, fuelCostPerUser * ((config.riderPercentage || 10) / 100));

            // final assignments
            costPerSeat = fuelCostPerUser + riderFee;
        }

        const newRide = await Ride.create({
            driver: req.user._id,
            origin: {
                name: origin.name,
                location: {
                    type: 'Point',
                    coordinates: origin.coordinates,
                },
            },
            destination: {
                name: destination.name,
                location: {
                    type: 'Point',
                    coordinates: destination.coordinates,
                },
            },
            startTime,
            distanceKm,
            totalSeats,
            availableSeats: totalSeats,
            vehicleType: user.vehicleDetails.vehicleType,
            fuelCost: totalFuelCost,
            driverFee,
            riderFee,
            driverPlatformFee: driverFee,
            riderPlatformFee: riderFee,
            totalCost: totalFuelCost + driverFee + (riderFee * totalSeats),
            costPerSeat,
        });

        // User update mechanics
        await User.findByIdAndUpdate(req.user._id, { $inc: { totalRidesGiven: 1 } });

        res.status(201).json(newRide);
    } catch (error) {
        next(error);
    }
};

export const searchRides = async (req, res, next) => {
    try {
        let { originLng, originLat, destLng, destLat, originName, destName, maxDistance = 5000, date } = req.query;

        if ((!originLng || !originLat) && originName) {
            const coords = await geocodeAddress(originName);
            originLng = coords[0];
            originLat = coords[1];
        }

        if ((!destLng || !destLat) && destName) {
            const coords = await geocodeAddress(destName);
            destLng = coords[0];
            destLat = coords[1];
        }

        if (!originLng || !originLat || (!destLng && !destLat && !destName)) {
            return res.status(400).json({ message: 'Origin and destination coordinates or names are required' });
        }

        // Geospatial Query using MongoDB 2dsphere index
        const startOfDay = new Date(date).setHours(0, 0, 0, 0);
        const endOfDay = new Date(date).setHours(23, 59, 59, 999);

        const rides = await Ride.find({
            status: 'PENDING',
            availableSeats: { $gt: 0 },
            'origin.location': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(originLng), parseFloat(originLat)],
                    },
                    $maxDistance: parseInt(maxDistance), // Max 5 km away from user intent
                },
            },
            startTime: {
                $gte: new Date(startOfDay),
                $lte: new Date(endOfDay),
            },
            driver: { $ne: req.user._id } // Don't show user's own rides
        }).populate('driver', 'name rating vehicleDetails.model');

        res.status(200).json(rides);
    } catch (error) {
        next(error);
    }
};

export const getRideDetails = async (req, res, next) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('driver', 'name phoneNumber rating totalRidesGiven vehicleDetails');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json(ride);
    } catch (error) {
        next(error);
    }
};
