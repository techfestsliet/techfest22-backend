const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const coordinatorSchema = new Schema({
  coordinatorName: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true,
  },
  coordinatorPhone: {
    type: String,
    required: true,
    maxlength: 15,
    trim: true,
  },
  coordinatorEmail: {
    type: String,
    required: true,
    trim: true,
  },
  coordinatorType: {
    //faculty or student
    type: String,
  },
  coordinatorDesignation: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,

    trim: true,
  },
});

module.exports = mongoose.model("Coordinator", coordinatorSchema);
