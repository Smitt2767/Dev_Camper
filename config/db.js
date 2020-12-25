const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(
    `Database connected ${conn.connection.host}:${conn.connection.port}`.cyan
      .underline.bold
  );
};

module.exports = connectDB;
