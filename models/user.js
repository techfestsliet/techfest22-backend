const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
    },
    dob: {
      type: Date,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      maxlength: 13,
      trim: true,
    },
    whatsappPhoneNumber: {
      type: String,
      maxlength: 15,
      trim: true,
    },
    telegramPhoneNumber: {
      type: String,
      maxlength: 15,
      trim: true,
    },
    collegeName: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    regNo: {
      type: String,
      maxlength: 10,
      trim: true,
    },
    instituteAddress: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    course: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    branchOfStudy: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    referralCode: {
      type: String,
      maxLength: 50,
      trim: true,
    },
    referrals: {
      type: Number,
      default: 0,
    },
    yearOfStudy: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
    isProfileComplete: {
      type: Boolean,
    },
    institution: {
      type: String,
    },

    role: {
      type: Number,
      default: 0,
    },
    hasPaidEntry: {
      type: Boolean,
    },
    paymentDetails: {
      paymentId: {
        type: String,
      },
      subscriptionType: {
        type: String,
      },
      paymentStatus: {
        type: String,
      },
      isSuccess: {
        type: Boolean,
        default: false,
      },
      paymentIntent: {
        type: String,
      },
      payUserDetail: {
        type: mongoose.SchemaTypes.Mixed,
      },
    },
    payPlan: {
      type: String,
    },
    teamMembers: [
      {
        type: ObjectId,
        ref: "Team",
      },
    ],

    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    workshops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workshop",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
