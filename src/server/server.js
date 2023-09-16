const cors = require("cors");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const authRouter = require("../auth/auth.router");
const dailyRateRouter = require("../daily-rate/daily-rate.router");
const productRouter = require("../product-search/product-search.router");
const dayRouter = require("../REST-entities/day/day.router");
const userRouter = require("../REST-entities/user/user.router");
const swaggerDocument = require("../../swagger.json");

class Server {
  constructor() {
    this.app = express();
  }

  async start() {
    this.initMiddlewares();
    await this.initDbConnection();
    this.initRoutes();
    this.initErrorHandling();
    this.initListening();
  }

  startForTesting() {
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandling();
    return this.app;
  }

  initMiddlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  async initDbConnection() {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      });
      console.log("Database connection is successful");
    } catch (error) {
      console.log("Database connection failed", error);
      process.exit(1);
    }
  }

  initRoutes() {
    this.app.use("/auth", authRouter);
    this.app.use("/daily-rate", dailyRateRouter);
    this.app.use("/product", productRouter);
    this.app.use("/day", dayRouter);
    this.app.use("/user", userRouter);
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  }

  initErrorHandling() {
    this.app.use(
      (err, req, res, next) => {
        let status = 500;
        if (err.response) {
          status = err.response.status;
        }
        return res.status(status).send(err.message);
      }
    );
  }

  initListening() {
    this.app.listen(process.env.PORT || 3000, () =>
      console.log("Started listening on port", process.env.PORT)
    );
  }
}

// Exporta la clase Server
module.exports = Server;
