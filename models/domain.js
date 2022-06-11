const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const domainSchema = new Schema({
  domainName: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true,
  },
  domainInfo: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true,
  },
  photo: {
    type: String,
  },
  studentCoordinator: [
    {
      //for students
      type: Schema.Types.ObjectId,
      ref: "Coordinator",
    },
  ],
  facultyCoordinator: [
    {
      type: Schema.Types.ObjectId,
      ref: "Coordinator",
    },
  ],
});

module.exports = mongoose.model("Domain", domainSchema);
