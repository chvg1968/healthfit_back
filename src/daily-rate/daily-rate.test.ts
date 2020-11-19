import mongoose, { Document } from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import { IMom, ISession } from "../helpers/typescript-helpers/interfaces";
import Server from "../server/server";
import UserModel from "../REST-entities/user/user.model";
import SessionModel from "../REST-entities/session/session.model";
import SummaryModel from "../REST-entities/summary/summary.model";

describe("Daily-rate router test suite", () => {
  let app: Application;
  let response: Response;
  let secondResponse: Response;
  let accessToken: string;
  let createdUser: Document | null;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/daily-rate`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    response = await supertest(app).post("/auth/register").send({
      email: "test@email.com",
      password: "qwerty123",
      username: "Test",
    });
    createdUser = await UserModel.findById(response.body.id);
    secondResponse = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    accessToken = secondResponse.body.accessToken;
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: "test@email.com" });
    await SessionModel.deleteOne({ _id: secondResponse.body.sid });
    await mongoose.connection.close();
  });

  describe("GET /daily-rate", () => {
    let response: Response;

    const validReqBody = {
      weight: 90,
      height: 180,
      age: 30,
      desiredWeight: 80,
      bloodType: 2,
    };

    const dailyRate = 10 * 90 + 6.25 * 180 - 5 * 30 - 161 - 10 * (90 - 80);

    const invalidReqBody = {
      weight: 90,
      height: 180,
      age: 30,
      desiredWeight: 80,
    };

    const secondInvalidReqBody = {
      weight: -10,
      height: 180,
      age: 30,
      desiredWeight: 80,
      bloodType: 2,
    };

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/daily-rate").send(validReqBody);
      });

      it("Should return a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          dailyRate,
          notAllowedProducts: response.body.notAllowedProducts,
        });
      });

      it("Should return a list of not allowed products", () => {
        expect(response.body.notAllowedProducts).toBeTruthy();
      });
    });

    context("With invalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app).get("/daily-rate").send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });

    context("With secondInvalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .get("/daily-rate")
          .send(secondInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });
  });

  describe("POST /daily-rate/:userId", () => {
    let response: Response;
    let summariesToUpdate: Document[];

    const validReqBody = {
      weight: 90,
      height: 180,
      age: 30,
      desiredWeight: 80,
      bloodType: 2,
    };

    const dailyRate = 10 * 90 + 6.25 * 180 - 5 * 30 - 161 - 10 * (90 - 80);

    const invalidReqBody = {
      weight: 90,
      height: 180,
      age: 30,
      desiredWeight: 80,
    };

    const secondInvalidReqBody = {
      weight: -10,
      height: 180,
      age: 30,
      desiredWeight: 80,
      bloodType: 2,
    };

    context("With validReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post(`/daily-rate/${(createdUser as IMom)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        summariesToUpdate = await SummaryModel.find({
          _id: (createdUser as IMom)._id,
        });
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          id: (createdUser as IMom)._id.toString(),
          dailyRate,
          summaries: summariesToUpdate,
          notAllowedProducts: response.body.notAllowedProducts,
        });
      });

      it("Should return a list of not allowed products", () => {
        expect(response.body.notAllowedProducts).toBeTruthy();
      });
    });

    context("With invalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post(`/daily-rate/${(createdUser as IMom)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
        summariesToUpdate = await SummaryModel.find({
          _id: (createdUser as IMom)._id,
        });
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });

    context("With secondInvalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post(`/daily-rate/${(createdUser as IMom)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send(secondInvalidReqBody);
        summariesToUpdate = await SummaryModel.find({
          _id: (createdUser as IMom)._id,
        });
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });

    context("Without providing accessToken", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post(`/daily-rate/${(createdUser as IMom)._id}`)
          .send(secondInvalidReqBody);
        summariesToUpdate = await SummaryModel.find({
          _id: (createdUser as IMom)._id,
        });
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("Without invalid accessToken", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post(`/daily-rate/${(createdUser as IMom)._id}`)
          .set("Authorization", `Bearer qwerty123`)
          .send(secondInvalidReqBody);
        summariesToUpdate = await SummaryModel.find({
          _id: (createdUser as IMom)._id,
        });
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });
  });
});
