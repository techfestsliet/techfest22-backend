const { failAction, successAction } = require("../utils/response");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const { findById } = require("../models/user");
const Event = require("../models/events");
const Workshop = require("../models/workshop");
const Team = require("../models/team");
module.exports.getReferralCode = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(failAction(errors.array()[0]));
  }

  const { _id } = req.body.id;
  User.findById(_id, (err, user) => {
    if (err || !user) {
      return res.status(404).status(failAction("User not found"));
    }

    return res.status(201).json(successAction(user.referralCode));
  });
};

module.exports.getUserById = (req, res) => {
  // const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   return res.status(400).json(failAction(errors.array()[0]));
  // }
  const _id = req.userId;
  // const { _id } = req.user._id;

  User.findOne({ _id: _id })
    .populate("events", ["name", "endDate"])
    .populate("workshops", ["workshopName", "endDate"])
    .exec((err, user) => {
      if (err || !user) {
        return res.status(208).json({ isError: true, message: "Not auth" });
      }
      user.password = null;

      return res
        .status(200)
        .json({ isError: false, isSuccess: true, user: user });
    });
};

module.exports.getAllUsers = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(failAction(errors.array()[0]));
  }

  User.find()
    .select([
      "name",
      "email",
      "phone",
      "whatsappPhoneNumber",
      "telegramPhoneNumber",
      "collegeName",
      "branchOfStudy",
      "course",
      "referrals",
      "yearOfStudy",
      "hasPaidEntry",
      "paymentDetails",
      "teamMembers",
      "events",
      "workshops",
    ])
    .populate("teamMembers", "name")
    .populate("events", "name")
    .populate("workshops", "workshopName")
    .exec((err, u) => {
      res.status(200).json({ isError: false, users: u });
    });
};

module.exports.getUserByEmail = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(failAction(errors.array()[0]));
  }

  const { email } = req.body.email;

  User.findOne({ email: email }, (err, user) => {
    if (err || !user) {
      return res.status(404).status(failAction("User not found"));
    }

    return res.status(201).json(successAction(user));
  });
};

module.exports.pushEvent = async (req, res) => {
  const userId = req.userId;
  const event = req.body.event;
  const teamId = req.body.teamId;
  const eventMode = req.body.eventMode;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(208).json({
      isError: true,
      title: "Event Error",
      message: "User not found!",
    });
  }

  const eventExisted = await Event.findById(event);
  if (!eventExisted) {
    return res.status(208).json({
      isError: true,
      title: "Event Error",
      message: "Event not found!",
    });
  }
  // return console.log(req.body);
  if (teamId === "self") {
    if (
      (eventExisted.eventMode === "offline" &&
        user.paymentDetails.subscriptionType !== "599") ||
      !user.paymentDetails.isSuccess
    ) {
      return res.status(208).json({
        isError: true,
        title: "Payment Error",
        message: "You do not have compatible payment!",
      });
    }
    const eventsListed = user.events.map((e) => {
      return e._id.toString();
    });

    if (eventsListed.indexOf(event) !== -1) {
      return res.status(208).json({
        isError: true,
        title: "Event Exist",
        message: "Event Already registered!",
      });
    }
    const userPush = await Event.findByIdAndUpdate(event, {
      $push: { individual: user },
    });
    User.findOneAndUpdate(
      { _id: user._id },
      { $push: { events: event } },
      (err, user) => {
        if (err || !user) {
          return res.status(208).json({
            isError: false,
            title: "Error",
            message: "Cannot add event",
          });
        }

        return res
          .status(201)
          .json({ isError: true, title: "Success", message: "Event is added" });
      }
    );
  } else {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(208).json({
        isError: true,
        title: "Team Error",
        message: "Team not found!",
      });
    }
    // return console.log(userId, team.leaderId);
    if (userId !== team.leaderId.toString()) {
      return res.status(208).json({
        isError: true,
        title: "Team Error",
        message: "You are not leader of this team!",
      });
    }
    // return console.log(team.eventType);
    if (team.eventType !== eventMode) {
      return res.status(208).json({
        isError: true,
        title: "Pay Error",
        message: "this is an offline event and your team mode is online",
      });
    }
    const individualExist = user.events.map((u) => {
      return u.toString();
    });
    // const teamMemberExistEvent = eventExisted.teams.map((t) => {
    //   return t.toString();
    // });
    // return console.log(individualExist);
    if (individualExist.indexOf(event) != -1) {
      return res.status(208).json({
        isError: true,
        title: "Team Error",
        message: "You have already register in this event!",
      });
    }
    for (const teamMember of team.members) {
      if (!teamMember.status) {
        return res.status(208).json({
          isError: true,
          title: "Team Error",
          message: "Some team members haven't accepted the team invitation!",
        });
      }

      const userMemberExistEvent = await User.findById(teamMember.memberId);
      const userAddedEvents = await userMemberExistEvent.events.map((e) => {
        return e.toString();
      });
      if (userAddedEvents.indexOf(event) != -1) {
        return res.status(208).json({
          isError: true,
          title: "Team Error",
          message: `${userMemberExistEvent.name} have already register in this event!`,
        });
      }

      const userPushEvent = await User.findOneAndUpdate(
        { _id: userMemberExistEvent._id },
        { $push: { events: eventExisted } }
      );
    }
    const leaderPush = await User.findByIdAndUpdate(userId, {
      $push: { events: eventExisted },
    });
    const teamPush = await Event.findByIdAndUpdate(event, {
      $push: { teams: team },
    });
    const teamEventPush = await Team.findByIdAndUpdate(teamId, {
      $push: { events: eventExisted },
    });
    return res
      .status(201)
      .json({ isError: true, title: "Success", message: "Event is added" });
  }
};

module.exports.pushWorkshop = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json(failAction(errors.array()[0]));
  }

  const { workshop } = req.body;
  // return console.log(workshop);
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(208).json({ isError: true, message: "User not found!" });
  }
  const workshopExisted = await Workshop.findById(workshop._id);
  if (!workshopExisted) {
    return res.status(208).json({
      isError: true,
      title: "Workshop Error",
      message: "Workshop not found!",
    });
  }

  //pay check
  // if (
  //   workshopExisted.workshopMode === "offline" &&
  //   user.paymentDetails.subscriptionType !== "599"
  // ) {
  //   return res.status(208).json({
  //     isError: true,
  //     title: "Payment Error",
  //     message: "This mode is for Gold subscription users!",
  //   });
  // }
  const workshopsListed = user.workshops.map((w) => {
    return w._id.toString();
  });

  if (workshopsListed.indexOf(workshop._id.toString()) !== -1) {
    return res.status(208).json({
      isError: true,
      title: "Workshop Exist",
      message: "Workshop Already Added",
    });
  }
  user.workshops.forEach((ws) => {
    if (ws.id == workshop.id) {
      return res.status(400).json({
        isError: true,
        title: "Error",
        message: "Workshop Already Added",
      });
    }
  });

  User.findOneAndUpdate(
    { _id: user._id },
    { $push: { workshops: workshop } },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          isError: true,
          title: "Error",
          message: "Cannot add workshop",
        });
      }

      Workshop.findByIdAndUpdate(
        workshop._id,
        { $push: { participants: user._id } },
        (err, workshop) => {
          if (err || !workshop) {
            return res.status(200).json({
              isError: true,
              title: "Error",
              message: "Cannot add workshop",
            });
          }
        }
      );

      return res.status(201).json({
        isError: false,
        title: "Success",
        message: "Workshop is added",
      });
    }
  );
};

exports.getVerifyUserWbe = (req, res) => {
  res.render("verifyuser");
};

module.exports.updateUser = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(failAction(errors.array()[0]));
  }

  const { email, phone, dob, whatsappPhoneNumber } = req.body.data;

  if (!phone || !dob || !whatsappPhoneNumber) {
    req.body.data["isProfileComplete"] = false;
  } else {
    req.body.data["isProfileComplete"] = true;
  }

  User.findOneAndUpdate(
    { email: email },
    { $set: req.body.data },
    { new: true, useFindAndModify: false },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json(failAction("Cannot update user"));
      }

      return res.status(201).json(successAction(user));
    }
  );
};

exports.unenrolEvent = async (req, res) => {
  const userId = req.userId;
  const eventId = req.body.eventId;
  const user = await User.findById(userId);
  const event = await Event.findById(eventId);
  if (!user) {
    return res.status(208).json({
      isError: true,
      title: "Error",
      message: "User not found!",
    });
  }
  if (!event) {
    return res.status(208).json({
      isError: true,
      title: "Error",
      message: "Event not found!",
    });
  }

  const removeFromUser = await User.findByIdAndUpdate(userId, {
    $pull: { events: eventId },
  });
  const reomveFromEvent = await Event.findByIdAndUpdate(eventId, {
    $pull: { individual: userId },
  });
  return res.status(200).json({
    isError: false,
    title: "Success",
    message: "Event unenrolled!",
  });
};

exports.otherCollegeUserPaidData = async (req, res) => {
  const users = await User.find({});
};
