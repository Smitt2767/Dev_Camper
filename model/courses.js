const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title..."],
  },
  description: {
    type: String,
    required: [true, "Please add a course description..."],
  },
  weeks: {
    type: Number,
    required: [true, "Please add a number of weeks..."],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost..."],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill..."],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipsAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

courseSchema.statics.getAverageCost = async function (bootcampID) {
  try {
    const obj = await this.aggregate([
      {
        $match: { bootcamp: bootcampID },
      },
      {
        $group: {
          _id: "$bootcamp",
          averageCost: {
            $avg: "$tuition",
          },
        },
      },
    ]);
    const averageCost =
      obj.length === 0 ? 0 : Math.ceil((obj[0].averageCost / 10) * 10);

    await this.model("Bootcamp").findByIdAndUpdate(bootcampID, {
      averageCost,
    });
  } catch (e) {
    console.log(e);
  }
};

// Calc averagecost after save and before remove
courseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});
courseSchema.pre("remove", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
  next();
});

module.exports = mongoose.model("Course", courseSchema);
