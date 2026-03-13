# Ride Mitron 🚗💨

Ride Mitron is a smart carpooling and ride-sharing platform designed for the Indian market. It connects drivers with empty seats to commuters heading the same way, using a fair fuel-split pricing algorithm.

## 🚀 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend:** Node.js, Express.js, JWT Authentication.
- **Database:** MongoDB (Geospatial Indexing for route matching).
- **APIs:** Google Maps API (Distance Matrix, Geocoding), Razorpay (Payments), Twilio/Fast2SMS (OTP).

## 🛠️ Deployment Checklist

### 1. Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies: `npm install`.
3. Create a `.env` file (refer to `.env.example`).
4. **Required Env Keys:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long random string for security.
   - `GOOGLE_MAPS_API_KEY`: Required for distance calculation.
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: For processing payments.
5. Start in production mode: `npm start` (or use PM2 with `ecosystem.config.cjs`).

### 2. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Create a production build: `npm run build`.
4. The high-performance static files will be generated in the `dist` folder.
5. Host the `dist` folder using Nginx, Vercel, or Netlify.

## 🛡️ Key Features
- **OTP Login:** Secure mobile-based authentication.
- **Fair Pricing:** Backend automatically calculates costs based on vehicle mileage and real fuel prices.
- **Geospatial Search:** Find rides starting within 5km of your exact location using MongoDB 2dsphere.
- **Payment Integration:** Securely pay platform fees via Razorpay.
- **Responsive Design:** Premium UI that works on Mobile, Tablet, and Desktop.

## 📄 License
This project is for demonstration purposes. All rights reserved.
