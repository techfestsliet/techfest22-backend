const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  leaderId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  leaderName: {
    type: String,
  },
  events: [
    {
      type: ObjectId,
      ref: "Event",
    },
  ],
  eventType: {
    type: String,
  },
  members: [
    {
      memberId: {
        type: ObjectId,
        ref: "User",
      },
      email: {
        type: String,
      },
      status: {
        type: Boolean,
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model("Team", TeamSchema);
