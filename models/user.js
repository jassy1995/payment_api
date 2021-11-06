const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  amount: { type: Number, required: true },
  phone_number: { type: String, required: true },
  process: { type: String, required: true },
});

module.exports = mongoose.model("UserDetail", UserSchema);
