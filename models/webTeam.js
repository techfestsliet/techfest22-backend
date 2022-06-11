const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
});

module.exports = mongoose.model("WebTeam", WebTeamSchema);
