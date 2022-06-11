const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  isTeamParticipation: {
    type: Boolean,
  },
  eventMode: {
    type: String,
    required: true,
    trim: true,
  },
  driveLink: {
    type: String,
    trim: true,
    required: true,
  },
  domain: {
    type: String,
    trim: true,
  },
  ePrizeWorth: {
    type: Number,
    trim: true,
  },
  photo: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  teams: [
    {
      type: ObjectId,
      ref: "Team",
    },
  ],
  individual: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  studentCoordinator: [
    {
      type: ObjectId,
      required: true,
      ref: "Coordinator",
    },
  ],
});

module.exports = mongoose.model("Event", EventSchema);
