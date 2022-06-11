const { validationResult, Result } = require("express-validator");

const Team = require("../models/team");
const User = require("../models/user");
const Event = require("../models/events");
const mail = require("../utils/mail");

module.exports.createTeam = async (req, res) => {
  const leaderId = req.userId;

  const { teamName, eventType, members } = req.body;
  const leader = await User.findById(leaderId);
  if (
    (eventType === "offline" &&
      leader.paymentDetails.subscriptionType !== "599") ||
    !leader.paymentDetails.isSuccess
  ) {
    return res.status(208).json({
      isError: true,
      message: `You do not have compatible payment!`,
    });
  }
  const teamExist = await Team.findOne({ name: teamName, leaderId: leaderId });
  // return console.log(!teamExist);
  if (teamExist) {
    return res.status(200).json({
      isError: true,
      message: `Team with ${teamName} is already exist!`,
    });
  }

  let teamMembers = [];

  for (const element of members) {
    const user = await User.findOne({ email: element });
    // console.log(user);
    if (
      (eventType === "offline" &&
        user.paymentDetails.subscriptionType !== "599") ||
      !user.paymentDetails.isSuccess
    ) {
      return res.status(208).json({
        isError: true,
        message: `Some member do not have compatible payment, Please change event mode!`,
      });
    }
    teamMembers.push({
      memberId: user._id.toString(),
      name: user.name,
      email: user.email,
      status: false,
    });
  }

  // return console.log(members);

  // return console.log(teamMembers);

  const team = new Team({
    name: teamName,
    leaderId: leaderId,
    leaderName: leader.name,
    eventType: eventType,
    members: teamMembers,
  });

  // return console.log(team);
  team
    .save()
    .then((t) => {
      //sending invitation links
      teamMembers.map((member) => {
        const uri = `https://api.techfestsliet.com/verifyTeamInvitation/${member.memberId}/${t._id}`;
        mail.sendMail({
          to: member.email,
          subject: "Team Verification Link",
          html: `<h3>Click on the link to verify your team membership in :${teamName} <br></h3>
        <h4>Leader name is ${leader.name} and email ${leader.email}<br></h4>
        <p><a href=${uri}>Click here</a></p>`,
        });
      });
      User.findByIdAndUpdate(
        leaderId,
        { $push: { teamMembers: t._id } },
        (err, user) => {
          if (err || !user) {
            return res.render("teamInvitation", {
              isError: true,
              message: "Something went  wrong!",
            });
          }
        }
      );
      return res.status(200).json({
        isError: false,
        message: "Team Created successfully",
        team: t,
      });
    })
    .catch((err) => console.log(err));
};

module.exports.getTeamById = (req, res) => {
  const { id } = req.body;

  Team.findById(id, (err, team) => {
    if (err || !team) {
      return res
        .status(200)
        .json({ isError: true, message: "Cannot find team" });
    } else {
      return res.status(200).json({ isError: false, team });
    }
  });
};

exports.getTeams = (req, res) => {
  Team.find()
    .populate("leaderId", ["name"])
    .populate("event", ["name"])
    .populate("members.memberId", ["name", "email"])
    .exec((err, teams) => {
      return res.status(200).json({
        isError: false,
        teams: teams,
      });
    });
};

exports.getProperTeams = async (req, res) => {
  const userId = req.userId;

  const teamMembersPart = await User.findById(userId).populate(
    "teamMembers",
    "name"
  );

  let teams = [];
  if (!teamMembersPart.teamMembers) {
    return res.status(200).json({
      isError: false,
      teams: teams,
    });
  }
  for (const t of teamMembersPart.teamMembers) {
    const tt = await Team.findById(t._id).populate("events", ["name"]);
    teams.push(tt);
  }
  return res.status(200).json({
    isError: false,
    teams: teams,
  });
};

exports.getTeamWhomeLeader = async (req, res) => {
  const userId = req.userId;
  const teams = await Team.find({ leaderId: userId });
  return res.status(200).json({
    isError: false,
    teams: teams,
  });
};

exports.addTeamMember = async (req, res, next) => {
  const leaderId = req.userId;
  const teamName = req.body.teamName;
  const memberMail = req.body.memberMail;
  const eventMode = req.body.eventMode;

  const leader = await User.findById(leaderId);

  if (
    (eventMode === "offline" &&
      leader.paymentDetails.subscriptionType !== "599") ||
    !leader.paymentDetails.isSuccess
  ) {
    return res.status(208).json({
      isError: true,
      message: `You do not have compatible payment!`,
    });
  }
  if (leader.email === memberMail) {
    return res.status(208).json({
      isError: true,
      message: `${leader.email} is your mail!`,
    });
  }

  const leaderDomain = leader.email.split("@")[1];

  const member = await User.findOne({ email: memberMail });
  if (!member) {
    return res.status(208).json({
      isError: true,
      message: `${memberMail}, Not found!`,
    });
  }
  const memberDomain = member.email.split("@")[1];

  if (leaderDomain === "sliet.ac.in" && memberDomain != "sliet.ac.in") {
    return res.status(208).json({
      isError: true,
      message: `${memberMail}, You can only add slietians!`,
    });
  }
  if (leaderDomain != "sliet.ac.in" && memberDomain === "sliet.ac.in") {
    return res.status(208).json({
      isError: true,
      message: `${member.email}, You cannot add slietians!`,
    });
  }

  if (
    (eventMode === "offline" &&
      member.paymentDetails.subscriptionType !== "599") ||
    !member.paymentDetails.isSuccess
  ) {
    return res.status(208).json({
      isError: true,
      message: `${member.email} do not have compatible payment!`,
    });
  }

  // const uri =
  // mail.sendMail({
  //   to: memberMail,
  //   subject: "Event team member registration",
  //   html: `<h3>Click on the link to verify your team membership of :${teamName} <br></h3>
  //   <p><a href=${uri}>Click here</a></p>`,
  // });
  res.status(200).json({
    isError: false,
    mId: member._id,
  });
};

exports.verifyTeamInvitation = async (req, res) => {
  const teamId = req.params.teamId;
  const userId = req.params.userId;
  // return console.log(teamId);
  if (teamId.length != 24 || teamId.length != 24) {
    return res.render("teamInvitation", {
      isError: true,
      message: "Something wrong in link!",
    });
  }
  const team = await Team.findById(teamId);
  const user = await User.findById(userId);

  // return console.log(team);
  if (!team || !user) {
    return res.render("teamInvitation", {
      isError: true,
      message: "Something  wrong!",
    });
  }
  const userTeamExist = team.members.map((m) => {
    return m.memberId.toString();
  });
  // return console.log(userTeamExist.indexOf(userId) != -1);
  if (userTeamExist.indexOf(userId) === -1) {
    return res.render("teamInvitation", {
      isError: true,
      message: "Something wrong in team!",
    });
  }
  const userUseLink = user.teamMembers.map((u) => {
    return u.toString();
  });
  // return console.log(userUseLink.indexOf(teamId));
  if (userUseLink.indexOf(teamId) != -1) {
    return res.render("teamInvitation", {
      isError: true,
      message: "Used linked!",
    });
  }
  User.findByIdAndUpdate(
    userId,
    { $push: { teamMembers: team } },
    (err, user) => {
      if (err || !user) {
        return res.render("teamInvitation", {
          isError: true,
          message: "Something went  wrong!",
        });
      }
    }
  );

  Team.findOneAndUpdate(
    { _id: teamId, "members.memberId": userId },

    { $set: { "members.$.status": true } },
    { new: true, useFindAndModify: false },
    (err, team) => {
      if (err || !team) {
        console.log(err);
        return res.render("teamInvitation", {
          isError: true,
          message: "Something went  wrong!",
        });
      }
      // return console.log(team);
    }
  );
  res.render("teamInvitation", {
    isError: false,
    message: "Successfully accepted!",
  });
};

exports.deleteTeam = async (req, res) => {
  const userId = req.userId;
  const teamId = req.body.team;

  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(208).json({
      isError: true,
      title: "Error",
      message: `Team not found!`,
    });
  }
  // return console.log(userId, team.leaderId);
  if (userId !== team.leaderId.toString()) {
    return res.status(208).json({
      isError: true,
      title: "Error",
      message: `You are not leader of this team!`,
    });
  }
  for (const eventId of team.events) {
    //pulling events in leader user
    const leader = await User.findByIdAndUpdate(userId, {
      $pull: { events: eventId },
    });
  }
  const leader = await User.findByIdAndUpdate(userId, {
    $pull: { teamMembers: team._id },
  });

  for (const member of team.members) {
    for (const eventId of team.events) {
      //pulling all events in perticular user
      const user = await User.findByIdAndUpdate(
        member.memberId,

        { $pull: { events: eventId } }
      );
    }
    if (member.status) {
      const user = await User.findByIdAndUpdate(
        //pulling the team if accepted
        member.memberId,

        { $pull: { teamMembers: team._id } }
      );
    }
  }
  for (const eventId of team.events) {
    //pulling team from all events
    const event = await Event.findByIdAndUpdate(eventId, {
      $pull: { teams: team._id },
    });
  }

  Team.findByIdAndRemove(teamId).then((results) => {
    return res.status(208).json({
      isError: false,
      title: "Success",
      message: `team deleted!`,
    });
  });
};
