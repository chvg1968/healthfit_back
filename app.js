const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const errorHandler = require("./errors/errorHandler");
require("dotenv").config();

const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./api-doc.json");

// Configuración de CORS para permitir localhost:3000 y la URL de Netlify
const allowedOrigins = ["http://localhost:3000", "https://healthfitfront.netlify.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Si es necesario, dependiendo de tus requerimientos de autenticación
  })
);

const {
  userRouter,
  productsRouter,
  dietariesRouter,
  authRouter,
} = require("./routes/api");

const formatsLogger =
 app.get("env") === "development" ? "dev" : "short";

app.use(express.json());
app.use(logger(formatsLogger));
app.use(express.static("public"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/users", authRouter, userRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/dietaries", dietariesRouter);

// Después de la configuración de CORS
app.use((req, res, next) => {
  console.log('Requested URL:', req.url);
  next();
});


app.use((_, res, next) => {
 next({ status: 404, message: "Not found" });
});

app.use(errorHandler);

module.exports = app;
