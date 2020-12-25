const express = require("express");
const User = require("../model/users");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");
const { protect, authorize } = require("../middleware/auth");
const advancedResult = require("../middleware/advancedResult");

router.use(protect, authorize("admin"));

router.route("/").get(advancedResult(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
