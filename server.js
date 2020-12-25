const path = require("path");

require("dotenv").config();
const express = require("express");
const fileupload = require("express-fileupload");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const ErrorResponse = require("./utils/errorResponse");
connectDB();

// SECURITY
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// ROUTES
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
// MIDDLEWARES
const errorHandler = require("./middleware/error");

const app = express();
const port = process.env.PORT;

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// SERVER STATIC FILES
app.use(express.static(path.join(__dirname, "public")));
// BODY PARSER
app.use(express.json());
app.use(cookieParser());
app.use(fileupload());

const limiter = rateLimit({
  windowMs: 10 * 60 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    data: "Only 100 requests per 10 minutes allowed from this IP...",
  },
});

// SECURITY middlewares
app.use(mongoSanitize()); // sanitize the user data
app.use(helmet()); // add extra security headers to our response
app.use(xss()); // prevent cross site scripting attacks
app.use(limiter); // limit the requests from 1 ip...
app.use(hpp()); // prevent http param polution
app.use(cors()); //prevent requests from different origin address
// MOUNT ROUTERS

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.all("*", (req, res, next) => {
  next(new ErrorResponse(`can't find ${req.originalUrl}...`, 404));
});

app.use(errorHandler);

const server = app.listen(
  port,
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow.bold
  )
);
// Handel Unhandeled rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Err: ${err}`);
  // Close the server
  server.close(() => {
    process.exit(1);
  });
});
