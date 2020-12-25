const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Review must have a title..."],
    maxlength: [30, "maximum 30 charectors only..."],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Review must have a title..."],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Review must have a rating..."],
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: [true, "review must assosiated with one bootcamp..."],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: [true, "review must assosiated with one user..."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// prevent user from submit muliple reviews...
reviewSchema.index(
  {
    bootcamp: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

reviewSchema.statics.getAverageRating = async function (bootcampID) {
  try {
    const obj = await this.aggregate([
      {
        $match: { bootcamp: bootcampID },
      },
      {
        $group: {
          _id: "$bootcamp",
          nRating: { $sum: 1 },
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);
    const averageRating =
      obj.length === 0 ? 0 : obj[0].averageRating.toFixed(2);
    await this.model("Bootcamp").findByIdAndUpdate(bootcampID, {
      averageRating,
    });
  } catch (e) {
    console.log(e);
  }
};

// Calc averageRating after save and before remove
reviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});
reviewSchema.pre("remove", function (next) {
  this.constructor.getAverageRating(this.bootcamp);
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
