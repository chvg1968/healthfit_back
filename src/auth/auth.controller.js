const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../REST-entities/user/user.model");
const SessionModel = require("../REST-entities/session/session.model");
const SummaryModel = require("../REST-entities/summary/summary.model");

exports.register = async (req, res) => {
  const { email, password, username } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .send({ message: `User with ${email} email already exists` });
  }
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.HASH_POWER)
  );
  const newMom = await UserModel.create({
    username,
    email,
    passwordHash,
    userData: {
      weight: 0,
      height: 0,
      age: 0,
      bloodType: 0,
      desiredWeight: 0,
      dailyRate: 0,
      notAllowedProducts: [],
    },
    days: [],
  });
  return res.status(201).send({
    email,
    username,
    id: newMom._id,
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca al usuario por correo electrónico
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(403).send({ message: `User with ${email} email doesn't exist` });
    }

    // Comprueba si la contraseña es correcta
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(403).send({ message: "Password is wrong" });
    }

    // Crea una nueva sesión
    const newSession = await SessionModel.create({
      uid: user._id,
    });

    // Genera tokens de acceso y actualización
    const accessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME }
    );
    const refreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME }
    );

    // Obtiene la fecha actual para buscar el resumen del día
    const date = new Date();
    const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    // Busca el resumen del día actual
    const todaySummary = await SummaryModel.findOne({ date: today });

    const response = {
      accessToken,
      refreshToken,
      sid: newSession._id,
      todaySummary: todaySummary || {},
      user: {
        email: user.email,
        username: user.username,
        userData: user.userData,
        id: user._id,
      },
    };

    return res.status(200).send(response);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send({ message: "Server error" });
  }
};

exports.authorize = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const accessToken = authorizationHeader.replace("Bearer ", "");
    let payload;
    try {
      payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await UserModel.findById(payload.uid);
    const session = await SessionModel.findById(payload.sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      return res.status(404).send({ message: "Invalid session" });
    }
    req.user = user;
    req.session = session;
    next();
  } else return res.status(400).send({ message: "No token provided" });
};

exports.refreshTokens = async (req, res) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const activeSession = await SessionModel.findById(req.body.sid);
    if (!activeSession) {
      return res.status(404).send({ message: "Invalid session" });
    }
    const reqRefreshToken = authorizationHeader.replace("Bearer ", "");
    let payload;
    try {
      payload = jwt.verify(reqRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      await SessionModel.findByIdAndDelete(req.body.sid);
      return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await UserModel.findById(payload.uid);
    const session = await SessionModel.findById(payload.sid);
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      return res.status(404).send({ message: "Invalid session" });
    }
    await SessionModel.findByIdAndDelete(payload.sid);
    const newSession = await SessionModel.create({
      uid: user._id,
    });
    const newAccessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
      }
    );
    const newRefreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME }
    );
    return res
      .status(200)
      .send({ newAccessToken, newRefreshToken, sid: newSession._id });
  }
  return res.status(400).send({ message: "No token provided" });
};

exports.logout = async (req, res) => {
  const currentSession = req.session;
  await SessionModel.deleteOne({ _id: currentSession._id });
  return res.status(204).end();
};
