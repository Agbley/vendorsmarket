const mongoose = require("mongoose");

mongoose.connect(process.env.mongo_url);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("mongo DB connection Successful");
});

connection.on("error", (err) => [console.log("Mongo DB connection Failed")]);

module.exports = connection;
