import request from "supertest";
import app from "../app.js";

describe("Health Check API", () => {
  it("should return 200 OK", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe("OK");
  });

  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.statusCode).toEqual(404);
  });
});
