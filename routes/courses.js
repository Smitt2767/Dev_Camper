const express = require("express");
const Course = require("../model/courses");
const advancedResults = require("../middleware/advancedResult");
const {
  getCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse,
} = require("../controllers/coursesController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), createCourse);
router
  .route("/:id")
  .get(getCourse)
  .delete(protect, authorize("publisher", "admin"), deleteCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse);

module.exports = router;
