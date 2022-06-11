const mongoose = require("mongoose");

const SponsorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageSrc: {
    type: String,
  },
  link: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Sponsor", SponsorSchema);
