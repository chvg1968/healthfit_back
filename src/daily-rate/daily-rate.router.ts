import { Router } from "express";
import Joi from "joi";
import validate from "../helpers/function-helpers/validate";
import { authorize } from "./../auth/auth.controller";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import { countDailyRate } from "./daily-rate.controller";

const getDailyRateSchema = Joi.object({
  weight: Joi.number().required().min(20).max(500),
  height: Joi.number().required().min(100).max(250),
  age: Joi.number().required().min(18).max(100),
  desiredWeight: Joi.number().required().min(20).max(500),
  bloodType: Joi.number().required().valid(1, 2, 3, 4),
});

const router = Router();

router.get("/", validate(getDailyRateSchema), tryCatchWrapper(countDailyRate));
router.post(
  "/:userId",
  authorize,
  validate(getDailyRateSchema),
  tryCatchWrapper(countDailyRate)
);

export default router;
