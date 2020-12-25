const dotenv = require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const Course = require("./model/courses");
const Bootcamp = require("./model/Bootcamps");
const User = require("./model/users");
const Review = require("./model/reviews");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected".yellow))
  .catch((err) => console.log(err));

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);

const importData = async () => {
  try {
    // await Bootcamp.create(bootcamps);
    // await Course.create(courses);
    // await User.create(users);
    await Review.create(reviews);
    console.log("all data imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteData = async () => {
  try {
    // await Bootcamp.deleteMany();
    // await Course.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    console.log("all data removed...".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "-i" || process.argv[2] === "--import") importData();
if (process.argv[2] === "-d" || process.argv[2] === "--delete") deleteData();
