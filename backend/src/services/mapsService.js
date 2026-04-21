import axios from "axios";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

export const getDistanceMatrix = async (originCoords, destCoords) => {
  // If no Google Maps key, use open-source OSRM API for accurate distances
  if (!env.googleMapsKey || env.googleMapsKey === "your_google_maps_api_key") {
    logger.warn(
      "Using open-source OSRM API for routing due to missing Google Maps key",
    );
    try {
      // OSRM expects longitude,latitude
      const originStr = `${originCoords[0]},${originCoords[1]}`;
      const destStr = `${destCoords[0]},${destCoords[1]}`;

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${originStr};${destStr}?overview=false`,
      );

      if (response.data.code !== "Ok") {
        throw new Error(`OSRM API error: ${response.data.code}`);
      }

      const route = response.data.routes[0];
      return {
        distanceText: `${(route.distance / 1000).toFixed(1)} km`,
        distanceValue: route.distance, // in meters
        durationText: `${Math.round(route.duration / 60)} mins`,
        durationValue: route.duration, // in seconds
      };
    } catch (error) {
      logger.error("OSRM Service Error:", error.message);
      // Fallback to static mock if OSRM fails
      return {
        distanceText: "15 km",
        distanceValue: 15000,
        durationText: "30 mins",
        durationValue: 1800,
      };
    }
  }

  try {
    const originStr = `${originCoords[1]},${originCoords[0]}`; // Lat,Lng
    const destStr = `${destCoords[1]},${destCoords[0]}`;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&key=${env.googleMapsKey}`,
    );

    if (response.data.status !== "OK") {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const element = response.data.rows[0].elements[0];
    if (element.status !== "OK") {
      throw new Error(`Distance calculation failed: ${element.status}`);
    }

    return {
      distanceText: element.distance.text,
      distanceValue: element.distance.value,
      durationText: element.duration.text,
      durationValue: element.duration.value,
    };
  } catch (error) {
    logger.error("Maps Service Error:", error);
    throw new Error("Failed to calculate distance between locations");
  }
};

export const geocodeAddress = async (address) => {
  if (!env.googleMapsKey || env.googleMapsKey === "your_google_maps_api_key") {
    logger.warn(
      "Using open-source Nominatim API for geocoding due to missing Google Maps key",
    );
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            format: "json",
            q: address,
            limit: 1,
          },
          headers: {
            "User-Agent": "RideMitronApp/1.0", // Required by Nominatim
          },
        },
      );

      if (response.data && response.data.length > 0) {
        return [
          parseFloat(response.data[0].lon),
          parseFloat(response.data[0].lat),
        ];
      } else {
        logger.warn(`Nominatim could not find coordinates for: ${address}`);
        return [77.21, 28.63]; // fallback to Delhi [lon, lat]
      }
    } catch (error) {
      logger.error("Nominatim Geocoding Error:", error.message);
      return [77.21, 28.63];
    }
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${env.googleMapsKey}`,
    );

    if (response.data.status !== "OK") {
      throw new Error(`Google Maps API geocode error: ${response.data.status}`);
    }

    const location = response.data.results[0].geometry.location;
    return [location.lng, location.lat]; // GeoJSON format: [longitude, latitude]
  } catch (error) {
    logger.error("Geocoding Error:", error.message);
    throw new Error("Failed to geocode address");
  }
};
