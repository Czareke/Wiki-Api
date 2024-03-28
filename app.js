require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const userRoute = require("./routes/userRoutes");
const wikiRouter = require("./routes/wikiRoute");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controller/errorController");
const AppError = require("./utils/appError");
const rateLimit = require("express-rate-limit"); //limits the amount req user can make within a time-stops ppl from using multi routes
const helmet = require("helmet"); //it helps secure express apps by setting it to the res header
const mongoSanitize = require("express-mongo-sanitize"); //prevents hacking of the db
const xss = require("xss-clean");
const hpp = require("hpp"); //express middleware to protect against http parameter pollution attacks
const cookieParser = require("cookie-parser");
const cors = require("cors");
// swagger
const swaggerUi=require('swagger-ui-express')
const yaml=require("yamljs")
const swaggerDocument=YAML.load('./swagger.yaml')

const app = express();
app.use(bodyParser.json());
app.enable("trust proxy");
// secure http headers
app.use(helmet());
// implement curs
app.use(cors());
// access-control-allow-origin
app.options("*", cors());
// Development logging
app.use(morgan("dev"));

// limit req from some ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this Ip address,Try again after an hour",
});
app.use("/api", limiter);
// data sanitation against noSQL,Query injection
app.use(mongoSanitize());
app.use(hpp());

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Wiki Api</h1><<a href='/api-docs'Documentation</a>");
});

// if you have html file
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html")
// })
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerDocument))
app.use("/api/v1/wiki", wikiRouter);
app.use("/api/v1/user", userRouter);

// Handling unhandled routes
// For all http methods
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

// Server
module.exports = app;
