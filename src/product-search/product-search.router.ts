import { Router } from "express";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import { authorize } from "../auth/auth.controller";
import { checkDailyRate } from "./../REST-entities/day/day.controller";
import { findProducts } from "./product-search.controller";

const router = Router();

router.get("/", authorize, checkDailyRate, tryCatchWrapper(findProducts));

export default router;
