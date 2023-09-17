const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const router = express.Router();

const { User, schemas } = require("../../models/User");
const { auth } = require("../../middlewares");
const { createError, sendEmail, msg } = require("../../helpers");

const { SECRET_KEY } = process.env;

router.post("/register", async (req, res, next) => {
  try {
    const { error } = schemas.addUser.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw createError(
        409,
        `Користувач з електронною поштою ${email} вже існує`
      );
    }
    const hashPass = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();
    const result = await User.create({
      name,
      email,
      password: hashPass,
      verificationToken,
    });
    await sendEmail(msg(email, verificationToken));
    res.status(201).json({
      name: result.name,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    console.log(verificationToken);
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw createError(404, "Не знайдено, можливо ви вже верифікували Email");
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.status(200).json({
      message: "Підтвердження успішне",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { error } = schemas.emailValidation.validate(req.body);
    if (error) {
      throw createError(400, "Введіть валідний Email");
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "Такого Email не знайдено");
    }
    if (user.verify) {
      throw createError(409, "Електронна пошта вже перевірена");
    }

    const { verificationToken } = user;
    await sendEmail(msg(email, verificationToken));

    res.status(200).json({
      message: "Лист з підтвердженням електронної пошти відправлено",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = schemas.loginUser.validate(req.body);
    if (error) {
      const errorMessage = error.message.split(" ")[0];
      console.log(errorMessage);
      console.log(error.message);
      if (errorMessage === '"password"') {
        throw createError(
          400,
          "Пароль має складати шість, або більше символів"
        );
      }
      throw createError(400, "Використовуйте валідний Email");
    }

    const { email, password } = req.body;
    const result = await User.findOne({ email });
    if (!result) {
      throw createError(404, "Користувача з таким Email не знайдено");
    }
    const passwordCompare = await bcrypt.compare(password, result.password);
    if (!passwordCompare) {
      throw createError(401, "Неправильний пароль");
    }
    if (!result.verify) {
      throw createError(403, "Верифікуйте ваш Email");
    }
    const payload = {
      id: result._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(result._id, { token });

    res.status(200).json({
      token,
      name: result.name,
      verify: result.verify,
      notAllowedProducts: result.notAllowedProducts,
      parameters: result.parameters,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/user", auth, async (req, res, next) => {
  try {
    const { name, notAllowedProducts, parameters } = req.user;
    res.json({ name, notAllowedProducts, parameters });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).json();
  } catch (err) {
    next();
  }
});

module.exports = router;
