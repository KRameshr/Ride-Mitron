import request from "supertest";
import app from "../app.js";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup.js";
import User from "../models/User.js";

describe("Auth API", () => {
  beforeAll(async () => await connectTestDB());
  afterAll(async () => await disconnectTestDB());
  afterEach(async () => await clearTestDB());

  const testPhoneNumber = "1234567890";

  describe("POST /api/v1/auth/request-otp", () => {
    it("should send a success message for valid phone number", async () => {
      const res = await request(app)
        .post("/api/v1/auth/request-otp")
        .send({ phoneNumber: testPhoneNumber });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("OTP sent successfully");
    });

    it("should return 400 for invalid phone number", async () => {
      const res = await request(app)
        .post("/api/v1/auth/request-otp")
        .send({ phoneNumber: "123" });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe("POST /api/v1/auth/verify-otp", () => {
    it("should login and return a token for correct OTP (backdoor)", async () => {
      // Request OTP first to populate otpStore
      await request(app)
        .post("/api/v1/auth/request-otp")
        .send({ phoneNumber: testPhoneNumber });

      const res = await request(app)
        .post("/api/v1/auth/verify-otp")
        .send({ phoneNumber: testPhoneNumber, otp: "123456" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.phoneNumber).toBe(testPhoneNumber);
    });

    it("should fail for incorrect OTP", async () => {
      await request(app)
        .post("/api/v1/auth/request-otp")
        .send({ phoneNumber: testPhoneNumber });

      const res = await request(app)
        .post("/api/v1/auth/verify-otp")
        .send({ phoneNumber: testPhoneNumber, otp: "000000" });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("Invalid OTP");
    });
  });
});
