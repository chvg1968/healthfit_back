import { Document } from "mongoose";
import { MongoDBObjectId } from "./types";

export interface IMom extends Document {
  name: string;
  email: string;
  passwordHash: string;
  userData: {
    weight: number;
    height: number;
    age: number;
    bloodType: number;
    desiredWeight: number;
    dailyRate: number;
  };
  days: MongoDBObjectId[];
}

export interface IDay extends Document {
  date: string;
  eatenProducts: IEatenProduct[];
  daySummary: MongoDBObjectId;
}

export interface IDaySummary extends Document {
  date: string;
  kcalLeft: number;
  kcalConsumed: number;
  dailyRate: number;
  percentsOfDailyRate: number;
}

export interface IEatenProduct {
  title: { ru: string; ua: string };
  weight: number;
  calories: number;
}

export interface ISession extends Document {
  uid: string;
}

export interface IJWTPayload {
  uid: string;
  sid: string;
}

export interface IProduct extends IEatenProduct, Document {
  categories: string[];
  groupBloodNotAllowed: (boolean | null)[];
}
