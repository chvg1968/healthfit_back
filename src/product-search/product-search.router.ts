import { Router } from "express";
import tryCatchWrapper from "../helpers/function-helpers/try-catch-wrapper";
import { authorize } from "./../auth/auth.controller";
import { findProducts } from "./product-search.controller";

const router = Router();

router.get("/", authorize, tryCatchWrapper(findProducts));

export default router;
