const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name..."],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 charactors..."],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description..."],
      trim: true,
      maxlength: [500, "Description can not be more than 500 charactors..."],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use valid url with HTTP or HTTPS...",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20..."],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
        "Please enter a valid email...",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address..."],
    },

    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      contry: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be atleast 1..."],
      max: [10, "Rating must can not more than 10..."],
    },
    averageCost: {
      type: Number,
      default: 0,
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "must be a one user assosiated with this bootcamp"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual fields
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

// create bootcamp slug using name
BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
BootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    contry: loc[0].countryCode,
    zipcode: loc[0].zipcode,
  };
  // Do not save address in db
  this.address = undefined;
  next();
});
// BootcampSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "courses",
//     select: "name description",
//   });
//   next();
// });

// Cascade if bootcamp removed all the courses also removed
BootcampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({
    bootcamp: this._id,
  });
  next();
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
