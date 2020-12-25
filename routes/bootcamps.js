const express = require("express");
const Bootcamp = require("../model/Bootcamps");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
// CONTROLLERS
const {
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  createBootcamp,
  deleteBootcamp,
  getBootcampsWithInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcampsController");

const advancedResults = require("../middleware/advancedResult");
// include other resourse router
const courseRouter = require("./courses");
const reviewsRouter = require("./reviews");

// re-route into ther resource routers
router.use("/:bootcampID/courses", courseRouter);
router.use("/:bootcampID/reviews", reviewsRouter);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);
router.route("/radius/:zipcode/:distance").get(getBootcampsWithInRadius);

module.exports = router;
