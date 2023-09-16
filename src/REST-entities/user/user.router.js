const { Router } = require("express");
const { authorize } = require("../../auth/auth.controller");
const tryCatchWrapper = require("../../helpers/function-helpers/try-catch-wrapper");
const { getUserInfo } = require("./user.controller");

const router = Router();

router.get("/", tryCatchWrapper(authorize), tryCatchWrapper(getUserInfo));

module.exports = router;
