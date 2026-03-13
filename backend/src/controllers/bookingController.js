import RideRequest from '../models/RideRequest.js';
import Ride from '../models/Ride.js';
import { REQUEST_STATUS } from '../config/constants.js';

export const requestBooking = async (req, res, next) => {
    try {
        const { rideId, seatsRequested } = req.body;

        const ride = await Ride.findById(rideId).lean();
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        if (ride.availableSeats < seatsRequested) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        if (ride.driver.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot book your own ride' });
        }

        // Cost calculation per seat per spec
        const totalAmountPaid = ride.costPerSeat * seatsRequested;

        const request = await RideRequest.create({
            ride: rideId,
            passenger: req.user._id,
            seatsRequested,
            totalCost: totalAmountPaid
        });

        res.status(201).json(request);
    } catch (error) {
        next(error);
    }
};

export const respondToBooking = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body; // ACCEPT or REJECT

        const request = await RideRequest.findById(requestId).populate('ride');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (action === 'ACCEPT') {
            if (request.ride.availableSeats < request.seatsRequested) {
                return res.status(400).json({ message: 'Not enough seats anymore' });
            }

            request.status = REQUEST_STATUS.ACCEPTED;
            await request.save();

            // Deduct seats
            request.ride.availableSeats -= request.seatsRequested;
            await request.ride.save();

        } else if (action === 'REJECT') {
            request.status = REQUEST_STATUS.REJECTED;
            await request.save();
        }

        res.status(200).json(request);
    } catch (error) {
        next(error);
    }
};

export const getMyRequests = async (req, res, next) => {
    try {
        // Requests sent by user
        const passengerRequests = await RideRequest.find({ passenger: req.user._id })
            .populate('ride')
            .lean();

        // Requests received as driver
        const myRides = await Ride.find({ driver: req.user._id }).select('_id').lean();
        const rideIds = myRides.map(r => r._id);
        const driverRequests = await RideRequest.find({ ride: { $in: rideIds } })
            .populate('passenger', 'name rating')
            .lean();

        res.status(200).json({
            asPassenger: passengerRequests,
            asDriver: driverRequests
        });
    } catch (error) {
        next(error);
    }
};
