const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TfDetailsSchema = new Schema({
  registration: {
    type: Number,
    required: true,
  },
  institutions: {
    type: Number,
    required: true,
  },
  slietians: {
    type: Number,
    required: true,
  },
});

module.exports = new mongoose.model("tfDetails", TfDetailsSchema);
