
const Mongoose = require("mongoose");

const localDB = `mongodb://0.0.0.0:27017/TheHiveHub`;

const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB Connected");
};
Mongoose.set("strictQuery", false);

module.exports = connectDB;
