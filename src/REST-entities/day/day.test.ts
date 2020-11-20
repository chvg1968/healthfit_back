import mongoose, { Document } from "mongoose";
import supertest, { Response } from "supertest";
import { Application } from "express";
import Server from "../../server/server";
import UserModel from "../user/user.model";
import SessionModel from "../session/session.model";
import SummaryModel from "../summary/summary.model";
import {
  IMom,
  IDaySummary,
  IDay,
} from "../../helpers/typescript-helpers/interfaces";
import { MongoDBObjectId } from "./../../helpers/typescript-helpers/types";
import DayModel from "./day.model";

describe("Day router test suite", () => {
  let app: Application;
  let response: Response;
  let secondResponse: Response;
  let accessToken: string;
  let secondAccessToken: string;
  let createdUser: Document | null;
  let secondCreatedUser: Document | null;
  let dayId: MongoDBObjectId;
  let eatenProductId: string;

  beforeAll(async () => {
    app = new Server().startForTesting();
    const url = `mongodb://127.0.0.1/day`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    await supertest(app).post("/auth/register").send({
      email: "test@email.com",
      password: "qwerty123",
      username: "Test",
    });
    await supertest(app).post("/auth/register").send({
      email: "testt@email.com",
      password: "qwerty123",
      username: "Test",
    });
    createdUser = await UserModel.findOne({ email: "test@email.com" });
    secondCreatedUser = await UserModel.findOne({ email: "testt@email.com" });
    response = await supertest(app)
      .post("/auth/login")
      .send({ email: "test@email.com", password: "qwerty123" });
    secondResponse = await supertest(app)
      .post("/auth/login")
      .send({ email: "testt@email.com", password: "qwerty123" });
    accessToken = response.body.accessToken;
    secondAccessToken = secondResponse.body.accessToken;
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: "test@email.com" });
    await UserModel.deleteOne({ email: "testt@email.com" });
    await SessionModel.deleteOne({ _id: response.body.sid });
    await SessionModel.deleteOne({ _id: secondResponse.body.sid });
    await mongoose.connection.close();
  });

  describe("POST /day/product", () => {
    let response: Response;
    let newSummary: Document | null;

    const validReqBody = {
      date: "2020-12-31",
      productId: "5d51694802b2373622ff552c",
      weight: 200,
    };

    const invalidReqBody = {
      date: "2020-12-31",
      productId: "5d51694802b2373622ff552c",
    };

    const secondInvalidReqBody = {
      date: "2020-12-31",
      productId: "qwerty123",
      weight: 200,
    };

    const thirdInvalidReqBody = {
      date: "2020-13-31",
      productId: "5d51694802b2373622ff552c",
      weight: 200,
    };

    context("Before counting dailyRate", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
      });

      it("Should return a 403 status code", () => {
        expect(response.status).toBe(403);
      });

      it("Should say that dailyRate wasn't counted", () => {
        expect(response.body.message).toBe(
          "Please, count your daily rate first"
        );
      });
    });

    context("With validReqBody", () => {
      beforeAll(async () => {
        await supertest(app)
          .post(`/daily-rate/${(createdUser as IMom)._id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            weight: 90,
            height: 180,
            age: 30,
            desiredWeight: 85,
            bloodType: 1,
          });
        response = await supertest(app)
          .post("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        newSummary = await SummaryModel.findById(response.body.newSummary._id);
        dayId = response.body.newDay._id.toString();
        eatenProductId = response.body.eatenProduct.id;
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          eatenProduct: {
            title: "Меланж яичный",
            weight: 200,
            kcal: 314,
            id: response.body.eatenProduct.id,
          },
          newDay: {
            eatenProducts: [
              {
                title: "Меланж яичный",
                weight: 200,
                kcal: 314,
                id: response.body.eatenProduct.id,
              },
            ],
            _id: response.body.newDay._id.toString(),
            date: "2020-12-31",
            daySummary: response.body.newDay.daySummary,
            __v: 0,
          },
          newSummary: {
            ...(newSummary as IDaySummary).toObject(),
            _id: (newSummary as IDaySummary)._id.toString(),
            userId: (newSummary as IDaySummary).userId.toString(),
          },
        });
      });

      it("Should create new summary in DB", () => {
        expect(newSummary).toBeTruthy();
      });

      it("Should create an id for eatenProduct", () => {
        expect(response.body.eatenProduct.id).toBeTruthy();
      });
    });

    context("Without providing an accessToken", () => {
      beforeAll(async () => {
        response = await supertest(app).post("/day/product").send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid accessToken", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/day/product")
          .send(validReqBody)
          .set("Authorization", `Bearer qwerty123`);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });

    context("With invalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });

    context("With secondInvalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(secondInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });

    context("With thirdInvalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .post("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(thirdInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });
  });

  describe("DELETE /day/product", () => {
    let response: Response;
    let newDaySummary: Document | null;
    let newDay: Document | null;

    const validReqBody = {
      dayId,
      eatenProductId,
    };

    const invalidReqBody = {
      dayId,
    };

    const secondInvalidReqBody = {
      dayId: "qwerty123",
      eatenProductId,
    };

    context("With validReqBody", () => {
      beforeAll(async () => {
        validReqBody.dayId = dayId;
        validReqBody.eatenProductId = eatenProductId;
        response = await supertest(app)
          .delete("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(validReqBody);
        newDaySummary = await SummaryModel.findById(
          response.body.newDaySummary._id
        );
        newDay = await DayModel.findById(validReqBody.dayId);
      });

      it("Should return a 201 status code", () => {
        expect(response.status).toBe(201);
      });

      it("Should return an expected result", () => {
        expect(response.body).toEqual({
          newDaySummary: {
            ...(newDaySummary as IDaySummary).toObject(),
            _id: (newDaySummary as IDaySummary)._id.toString(),
            userId: (newDaySummary as IDaySummary).userId.toString(),
          },
        });
      });

      it("Should delete a product from DB", () => {
        expect(
          (newDay as IDay).eatenProducts.find(
            (product) => product.id === validReqBody.eatenProductId
          )
        ).toBeFalsy();
      });
    });

    context("Without providing accessToken", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .delete("/day/product")
          .send(validReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });

      it("Should say that token wasn't provided", () => {
        expect(response.body.message).toBe("No token provided");
      });
    });

    context("With invalid accessToken", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .delete("/day/product")
          .set("Authorization", `Bearer qwerty123`)
          .send(validReqBody);
      });

      it("Should return a 401 status code", () => {
        expect(response.status).toBe(401);
      });

      it("Should return an unauthorized status", () => {
        expect(response.body.message).toBe("Unauthorized");
      });
    });

    context("With invalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .delete("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(invalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });

    context("With secondInvalidReqBody", () => {
      beforeAll(async () => {
        response = await supertest(app)
          .delete("/day/product")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(secondInvalidReqBody);
      });

      it("Should return a 400 status code", () => {
        expect(response.status).toBe(400);
      });
    });

    context("With another account", () => {
      beforeAll(async () => {
        await supertest(app)
          .post(`/daily-rate/${(secondCreatedUser as IMom)._id}`)
          .set("Authorization", `Bearer ${secondAccessToken}`)
          .send({
            weight: 90,
            height: 180,
            age: 30,
            desiredWeight: 85,
            bloodType: 1,
          });
        response = await supertest(app)
          .delete("/day/product")
          .set("Authorization", `Bearer ${secondAccessToken}`)
          .send(validReqBody);
      });

      it("Should return a 404 status code", () => {
        expect(response.status).toBe(404);
      });

      it("Should return a 404 status code", () => {
        expect(response.body.message).toBe("Day not found");
      });
    });
  });
});
